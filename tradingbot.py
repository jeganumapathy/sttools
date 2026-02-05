import logging
import threading
import requests
import sys
import random
import math
import argparse
import json
import os
import time
import joblib
import numpy as np
import pandas as pd
from datetime import date, datetime, timedelta
from kiteconnect import KiteConnect


base_url = "https://www.nseindia.com"

# Set up headers for NSE
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'X-Requested-With': 'XMLHttpRequest'
}

# --- Option Greeks Calculation (Black-Scholes) ---
RISK_FREE_RATE = 0.07  # 7% annual risk-free rate assumption
MIN_EXPIRY_FOR_STABLE_GREEKS = 0.5 / 365.0  # Half a day in years; avoids Gamma/Vega explosion

# Global flags
LIVE_TRADING = False
USE_DUMMY_DATA = False

# --- Configuration ---
def load_config():
    defaults = {
        "min_profit_pct": 3,
        "max_profit_pct": 8,
        "stop_loss_pct": 5,
        "trailing_stop_pct": 2,
        "quantity": 25,
        "spot_mean": 25642
    }
    try:
        with open("config.json", "r") as f:
            return {**defaults, **json.load(f)}
    except FileNotFoundError:
        return defaults

CONFIG = load_config()

# --- Trade State Management ---
trade_book = {
    "active_trade": False,
    "symbol": None,
    "strike": None,
    "type": None,  # "CE" or "PE"
    "buy_price": 0,
    "quantity": CONFIG["quantity"],
    "min_profit_pct": CONFIG["min_profit_pct"],
    "max_profit_pct": CONFIG["max_profit_pct"],
    "stop_loss_pct": CONFIG["stop_loss_pct"],
    "trailing_stop_pct": CONFIG["trailing_stop_pct"],
    "highest_pnl_pct": 0.0,  # Track highest PnL for trailing stop
    "total_pnl": 0.0,
    "total_buy_qty": 0,
    "total_sell_qty": 0,
    "prev_features_for_training": None,
    "prev_spot_for_training": None,
}

WAIT_TIME = 30  # Time in seconds between each cycle (30 reduced for testing)

def _cdf(x):
    'Cumulative distribution function for the standard normal distribution'
    return (1.0 + math.erf(x / math.sqrt(2.0))) / 2.0

def calculate_greeks(option_type, S, K, T, r, sigma):
    """
    Calculates option greeks using the Black-Scholes model.
    S: Spot Price, K: Strike Price, T: Time to Expiry (years),
    r: Risk-free rate, sigma: Implied Volatility
    """
    if T <= 0 or sigma <= 0 or S <= 0: # Avoid math domain errors
        return {'delta': 0, 'gamma': 0, 'theta': 0, 'vega': 0}

    # Handle extreme IV (e.g., > 200%)
    if sigma > 2.0:
        return {'delta': 0, 'gamma': 0, 'theta': 0, 'vega': 0}

    # Pre-calculate to avoid ZeroDivisionError and for reuse
    vol_sqrt_t = sigma * math.sqrt(T)
    if vol_sqrt_t == 0:
        # Simplified delta for expiry, other greeks are irrelevant
        if option_type.upper() == "CE":
            delta = 1.0 if S > K else 0.0
        else:  # PE
            delta = -1.0 if S < K else 0.0
        return {'delta': delta, 'gamma': 0, 'theta': 0, 'vega': 0}

    d1 = (math.log(S / K) + (r + 0.5 * sigma ** 2) * T) / vol_sqrt_t
    d2 = d1 - vol_sqrt_t
    
    pdf_d1 = (1 / (math.sqrt(2 * math.pi))) * math.exp(-d1**2 / 2)

    if option_type.upper() == "CE":
        delta = _cdf(d1)
        theta = -(S * pdf_d1 * sigma) / (2 * math.sqrt(T)) - r * K * math.exp(-r * T) * _cdf(d2)
    elif option_type.upper() == "PE":
        delta = _cdf(d1) - 1
        theta = -(S * pdf_d1 * sigma) / (2 * math.sqrt(T)) + r * K * math.exp(-r * T) * _cdf(-d2)
    else:
        return {}

    gamma = pdf_d1 / (S * vol_sqrt_t)
    vega = S * pdf_d1 * math.sqrt(T)
    
    # Mitigate Gamma/Theta/Vega explosion near expiry by neutralizing them.
    if T < MIN_EXPIRY_FOR_STABLE_GREEKS:
        gamma = 0
        theta = 0
        vega = 0

    # Return Theta per day and Vega for a 1% change in IV
    return {'delta': delta, 'gamma': gamma, 'theta': theta / 365, 'vega': vega / 100}


def generate_dummy_data(symbol, expiry_date):
    """Generates dummy option chain data for testing."""
    # Initialize static spot price
    if not hasattr(generate_dummy_data, "spot_price"):
        generate_dummy_data.spot_price = CONFIG["spot_mean"]

    is_expiry_day = (datetime.strptime(expiry_date, "%d-%b-%Y").date() == date.today())
    
    # Ornstein-Uhlenbeck process (Mean Reverting)
    theta = 0.15  # Speed of reversion
    sigma_vol = 20 # Volatility
    dx = theta * (CONFIG["spot_mean"] - generate_dummy_data.spot_price) + sigma_vol * random.gauss(0, 1)
    generate_dummy_data.spot_price += dx
    spot_price = generate_dummy_data.spot_price

    try:
        expiry_dt = datetime.strptime(expiry_date, "%d-%b-%Y")
        expiry_date_inner = expiry_dt.strftime("%d-%m-%Y")
    except ValueError:
        expiry_date_inner = expiry_date

    atm_strike = round(spot_price / 50) * 50
    
    data = []
    strike_prices = []
    ce_tot_oi = 0
    ce_tot_vol = 0
    pe_tot_oi = 0
    pe_tot_vol = 0

    # Generate strikes around ATM (Expanded range for realism)
    for i in range(-20, 21):
        strike = atm_strike + (i * 50)
        # Simulate option pricing (intrinsic + time value + noise)
        ce_intrinsic = max(0, spot_price - strike)
        pe_intrinsic = max(0, strike - spot_price)
        
        # On expiry day, time value decays to near zero.
        time_value_component = random.uniform(0, 5) if is_expiry_day else random.uniform(40, 60)

        ce_ltp = ce_intrinsic + time_value_component
        pe_ltp = pe_intrinsic + time_value_component
        
        # Dummy OI and IV
        ce_oi = random.randint(10000, 200000)
        pe_oi = random.randint(10000, 200000)
        ce_iv = random.uniform(0.10, 0.30)
        pe_iv = random.uniform(0.10, 0.30)

        # Calculate dummy greeks
        time_to_expiry = max((datetime.strptime(expiry_date, "%d-%b-%Y").date() - date.today()).days, 0) / 365.0
        ce_greeks = calculate_greeks("CE", spot_price, strike, time_to_expiry, RISK_FREE_RATE, ce_iv)
        pe_greeks = calculate_greeks("PE", spot_price, strike, time_to_expiry, RISK_FREE_RATE, pe_iv)

        common_ce = {
            "underlying": symbol,
            "identifier": f"OPTIDX{symbol}{expiry_date_inner}CE{strike:.2f}",
            "expiryDate": expiry_date_inner,
            "changeinOpenInterest": random.randint(-5000, 5000),
            "pchangeinOpenInterest": random.uniform(-10, 10),
            "totalTradedVolume": random.randint(100000, 5000000),
            "change": round(random.uniform(-5, 5), 2),
            "pchange": round(random.uniform(-2, 2), 2),
            "totalBuyQuantity": random.randint(100000, 5000000),
            "totalSellQuantity": random.randint(100000, 5000000),
            "buyPrice1": round(ce_ltp - 0.05, 2),
            "buyQuantity1": random.randint(50, 1000),
            "sellPrice1": round(ce_ltp + 0.05, 2),
            "sellQuantity1": random.randint(50, 1000),
            "underlyingValue": round(spot_price, 2),
            "optionType": "CE"
        }

        common_pe = {
            "underlying": symbol,
            "identifier": f"OPTIDX{symbol}{expiry_date_inner}PE{strike:.2f}",
            "expiryDate": expiry_date_inner,
            "changeinOpenInterest": random.randint(-5000, 5000),
            "pchangeinOpenInterest": random.uniform(-10, 10),
            "totalTradedVolume": random.randint(100000, 5000000),
            "change": round(random.uniform(-5, 5), 2),
            "pchange": round(random.uniform(-2, 2), 2),
            "totalBuyQuantity": random.randint(100000, 5000000),
            "totalSellQuantity": random.randint(100000, 5000000),
            "buyPrice1": round(pe_ltp - 0.05, 2),
            "buyQuantity1": random.randint(50, 1000),
            "sellPrice1": round(pe_ltp + 0.05, 2),
            "sellQuantity1": random.randint(50, 1000),
            "underlyingValue": round(spot_price, 2),
            "optionType": "PE"
        }

        ce_tot_oi += ce_oi
        ce_tot_vol += common_ce["totalTradedVolume"]
        pe_tot_oi += pe_oi
        pe_tot_vol += common_pe["totalTradedVolume"]
        strike_prices.append(strike)

        data.append({
            "strikePrice": strike,
            "expiryDates": expiry_date,
            "CE": {"lastPrice": round(ce_ltp, 2), "openInterest": ce_oi, 
                   "impliedVolatility": round(ce_iv * 100, 2), **ce_greeks, **common_ce},
            "PE": {"lastPrice": round(pe_ltp, 2), "openInterest": pe_oi,
                   "impliedVolatility": round(pe_iv * 100, 2), **pe_greeks, **common_pe}
        })

    # Generate dummy future expiry dates
    expiry_dates_list = [expiry_date]
    try:
        dt = datetime.strptime(expiry_date, "%d-%b-%Y")
        for i in range(1, 5):
            expiry_dates_list.append((dt + timedelta(weeks=i)).strftime("%d-%b-%Y"))
    except ValueError:
        pass
        
    return {
        "records": {
            "underlyingValue": round(spot_price, 2),
            "expiryDates": expiry_dates_list,
            "data": data,
            "timestamp": datetime.now().strftime("%d-%b-%Y %H:%M:%S"),
            "strikePrices": [str(s) for s in strike_prices]
        },
        "filtered": {
            "data": data,
            "CE": {"totOI": ce_tot_oi, "totVol": ce_tot_vol},
            "PE": {"totOI": pe_tot_oi, "totVol": pe_tot_vol}
        }
    }

def get_full_option_chain(symbol, expiry_date):
    """Fetches the entire option chain records for a given symbol and expiry."""
    if USE_DUMMY_DATA:
        return generate_dummy_data(symbol, expiry_date).get('records')

    session = requests.Session()
    r = session.get(base_url, headers=headers, timeout=5)
    cookies = dict(r.cookies)

    endpoint = "Indices" if symbol in ["NIFTY", "BANKNIFTY", "FINNIFTY"] else "Equities"
    url = f"{base_url}/api/option-chain-v3?type={endpoint}&symbol={symbol}&expiry={expiry_date}"
    logging.info(f"Fetching option chain from: {url}")
    response = session.get(url, timeout=5, headers=headers, cookies=cookies)
    if response.status_code != 200:
        logging.error(f"Failed to fetch option chain data. Status code: {response.status_code}. Response: {response.text}")
        return None
    try:
        data = response.json()
        return data.get('records')
    except requests.exceptions.JSONDecodeError:
        logging.error(f"Failed to decode JSON. Response text: {response.text}")
        return None

def extract_features_for_prediction(spot_price, atm_strike, ce_data, pe_data):
    """Extracts features in the correct order for model prediction."""
    if not all([spot_price, ce_data, pe_data]):
        return None

    features = [
        spot_price,
        atm_strike,
        ce_data.get('lastPrice', 0),
        ce_data.get('impliedVolatility', 0),
        ce_data.get('openInterest', 0),
        ce_data.get('pchangeinOpenInterest', 0),
        ce_data.get('delta', 0),
        ce_data.get('gamma', 0),
        ce_data.get('vega', 0),
        ce_data.get('theta', 0),
        pe_data.get('lastPrice', 0),
        pe_data.get('impliedVolatility', 0),
        pe_data.get('openInterest', 0),
        pe_data.get('pchangeinOpenInterest', 0),
        pe_data.get('delta', 0),
        pe_data.get('gamma', 0),
        pe_data.get('vega', 0),
        pe_data.get('theta', 0),
    ]

    feature_names = [
        'spot_price', 'atm_strike',
        'ce_ltp', 'ce_iv', 'ce_oi', 'ce_oi_change_pct', 'ce_delta', 'ce_gamma', 'ce_vega', 'ce_theta',
        'pe_ltp', 'pe_iv', 'pe_oi', 'pe_oi_change_pct', 'pe_delta', 'pe_gamma', 'pe_vega', 'pe_theta'
    ]
    return pd.DataFrame([features], columns=feature_names)

def find_option_data_for_strike(records_data, strike_price):
    """Finds CE and PE data for a specific strike from the option chain data."""
    ce_data = None
    pe_data = None
    for item in records_data.get('data', []):
        if item.get('strikePrice') == strike_price:
            ce_data = item.get('CE')
            pe_data = item.get('PE')
            break
    return ce_data, pe_data

def save_training_data(filepath, features, label):
    """Appends a new row of feature data and a label to a CSV file."""
    feature_names = [
        'spot_price', 'atm_strike',
        'ce_ltp', 'ce_iv', 'ce_oi', 'ce_oi_change_pct', 'ce_delta', 'ce_gamma', 'ce_vega', 'ce_theta',
        'pe_ltp', 'pe_iv', 'pe_oi', 'pe_oi_change_pct', 'pe_delta', 'pe_gamma', 'pe_vega', 'pe_theta'
    ]
    df = pd.DataFrame([features], columns=feature_names)
    df['label'] = label
    
    # Append to CSV, write header only if file doesn't exist
    df.to_csv(filepath, mode='a', header=not os.path.exists(filepath), index=False)
    logging.info(f"💾 Data point saved to {filepath} (Label: {label})")


def place_gtt_order(kite, symbol, trans_type, qty, price, trigger_price):
    """Places a GTT order on Kite."""
    if not LIVE_TRADING:
        logging.info(f"🧪 [DRY RUN] GTT Order placed for {qty} {symbol} {trans_type} at {price}. Trigger: {trigger_price}")
        return "DRY_RUN_ID_123"

    try:
        orders = [{
            "exchange": kite.EXCHANGE_NFO,
            "tradingsymbol": symbol,
            "transaction_type": trans_type.upper(),
            "quantity": qty,
            "order_type": kite.ORDER_TYPE_LIMIT,
            "product": kite.PRODUCT_NRML,
            "price": price
        }]
        trigger_id = kite.place_gtt(
            trigger_type=kite.GTT_TYPE_SINGLE,
            tradingsymbol=symbol,
            exchange=kite.EXCHANGE_NFO,
            trigger_values=[trigger_price],
            last_price=price,
            orders=orders
        )
        logging.info(f"✅ GTT Order placed for {qty} {symbol} {trans_type} at {price}. Trigger ID: {trigger_id}")
        return trigger_id
    except Exception as e:
        logging.error(f"❌ Failed to place GTT order for {symbol}: {e}")
        return None

# --- Configuration ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

def trading_cycle(kite, expiry, model, collect_data_file=None):
    """Main function for a single trading logic cycle."""
    # 1. Fetch full option chain data once
    records = get_full_option_chain("NIFTY", expiry)
    if not records or 'underlyingValue' not in records:
        logging.warning("Could not fetch valid records from NSE.")
        return

    spot_price = records['underlyingValue']
    atm_strike = round(spot_price / 50) * 50
    atm_ce_data, atm_pe_data = find_option_data_for_strike(records, atm_strike)

    if not atm_ce_data or not atm_pe_data:
        logging.warning(f"Could not find ATM ({atm_strike}) CE/PE data.")
        return

    # --- Calculate Greeks if not in Test Mode ---
    if not USE_DUMMY_DATA:
        time_to_expiry = max((datetime.strptime(expiry, "%d-%b-%Y").date() - date.today()).days, 0) / 365.0
        
        # For CE
        ce_iv = atm_ce_data.get('impliedVolatility', 0) / 100 # Convert from %
        atm_ce_data.update(calculate_greeks("CE", spot_price, atm_strike, time_to_expiry, RISK_FREE_RATE, ce_iv))

        # For PE
        pe_iv = atm_pe_data.get('impliedVolatility', 0) / 100 # Convert from %
        atm_pe_data.update(calculate_greeks("PE", spot_price, atm_strike, time_to_expiry, RISK_FREE_RATE, pe_iv))

    # --- Data Collection for Training ---
    if collect_data_file:
        current_features = [
            spot_price,
            atm_strike,
            atm_ce_data.get('lastPrice', 0),
            atm_ce_data.get('impliedVolatility', 0),
            atm_ce_data.get('openInterest', 0),
            atm_ce_data.get('pchangeinOpenInterest', 0),
            atm_ce_data.get('delta', 0),
            atm_ce_data.get('gamma', 0),
            atm_ce_data.get('vega', 0),
            atm_ce_data.get('theta', 0),
            atm_pe_data.get('lastPrice', 0),
            atm_pe_data.get('impliedVolatility', 0),
            atm_pe_data.get('openInterest', 0),
            atm_pe_data.get('pchangeinOpenInterest', 0),
            atm_pe_data.get('delta', 0),
            atm_pe_data.get('gamma', 0),
            atm_pe_data.get('vega', 0),
            atm_pe_data.get('theta', 0),
        ]

        # If we have previous data, we can now determine its label and save it
        if trade_book["prev_features_for_training"] is not None:
            prev_spot = trade_book["prev_spot_for_training"]
            label = 1 if spot_price > prev_spot else 0
            save_training_data(collect_data_file, trade_book["prev_features_for_training"], label)

        # Store current data for the next iteration
        trade_book["prev_features_for_training"] = current_features
        trade_book["prev_spot_for_training"] = spot_price

    # --- Display Data ---
    print("\n" + "═" * 80)
    print(f"📊  NIFTY 50 LIVE TRACKER | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Expiry: {expiry}")
    print("═" * 80)
    print(f"💰  Spot Price: {spot_price:<10.2f} | 🎯  ATM Strike: {atm_strike}")
    print("─" * 80)
    # Header
    print(f"{'Option':<8} | {'LTP':<8} | {'OI':<10} | {'IV':<7} | {'Delta':<8} | {'Theta':<8} | {'Gamma':<8} | {'Vega':<8}")
    print("─" * 80)
    # CE Data
    ce_str = f"🟢 CE    | {atm_ce_data.get('lastPrice', 0):<8.2f} | {atm_ce_data.get('openInterest', 0):<10} | {atm_ce_data.get('impliedVolatility', 0):<6.2f}% | {atm_ce_data.get('delta', 0):<8.3f} | {atm_ce_data.get('theta', 0):<8.3f} | {atm_ce_data.get('gamma', 0):<8.3f} | {atm_ce_data.get('vega', 0):<8.3f}"
    print(ce_str)
    # PE Data
    pe_str = f"🔴 PE    | {atm_pe_data.get('lastPrice', 0):<8.2f} | {atm_pe_data.get('openInterest', 0):<10} | {atm_pe_data.get('impliedVolatility', 0):<6.2f}% | {atm_pe_data.get('delta', 0):<8.3f} | {atm_pe_data.get('theta', 0):<8.3f} | {atm_pe_data.get('gamma', 0):<8.3f} | {atm_pe_data.get('vega', 0):<8.3f}"
    print(pe_str)
    print("═" * 80)

    # --- Trading Logic ---
    if trade_book["active_trade"]:
        # --- EXIT LOGIC ---
        held_strike = trade_book["strike"]
        held_ce_data, held_pe_data = find_option_data_for_strike(records, held_strike)
        
        held_option_data = held_ce_data if trade_book["type"] == "CE" else held_pe_data
        if not held_option_data:
            logging.warning(f"Could not find data for held strike {held_strike}. Skipping exit check.")
            return
        
        # For realistic PnL, use bid price for selling to account for slippage
        exit_price = held_option_data.get('buyPrice1')

        if exit_price is not None and trade_book["buy_price"] > 0:
            pnl_pct = ((exit_price - trade_book["buy_price"]) / trade_book["buy_price"]) * 100
            print(f"ℹ️  Holding {trade_book['symbol']}. Buy: {trade_book['buy_price']:.2f}, Bid: {exit_price:.2f}, PnL: {pnl_pct:.2f}%")

            # Update highest PnL for trailing stop
            if pnl_pct > trade_book["highest_pnl_pct"]:
                trade_book["highest_pnl_pct"] = pnl_pct
            
            trailing_stop_hit = (trade_book["highest_pnl_pct"] > 0 and 
                                 pnl_pct < (trade_book["highest_pnl_pct"] - trade_book["trailing_stop_pct"]))

            if pnl_pct >= trade_book["max_profit_pct"] or pnl_pct <= -trade_book["stop_loss_pct"] or trailing_stop_hit:
                exit_reason = "PROFIT TARGET" if pnl_pct >= trade_book["max_profit_pct"] else ("TRAILING STOP" if trailing_stop_hit else "STOP-LOSS")
                # Calculate PnL based on the actual executable price (bid price)
                pnl_amount = (exit_price - trade_book["buy_price"]) * trade_book["quantity"]
                trade_book["total_pnl"] += pnl_amount
                trade_book["total_sell_qty"] += trade_book["quantity"]
                logging.info(f"💰 {exit_reason} HIT ({pnl_pct:.2f}%). Realized PnL: {pnl_amount:.2f}. Placing SELL order.")
                # Exit at the market bid price
                place_gtt_order(kite, trade_book["symbol"], "SELL", trade_book["quantity"], exit_price, exit_price)
                # Reset trade book after selling
                trade_book.update({"active_trade": False, "symbol": None, "strike": None, "type": None, "buy_price": 0, "highest_pnl_pct": 0.0})
    else:
        # --- ENTRY LOGIC ---
        # Example Strategy: Buy ATM PE if LTP < 100, Delta is between -0.4 and -0.6, and OI > 50k.
        # DO NOT USE THIS IN LIVE TRADING.
        # To account for slippage, we check the ask price for entry
        pe_entry_price = atm_pe_data.get('sellPrice1')
        pe_delta = atm_pe_data.get('delta', 0)
        pe_oi = atm_pe_data.get('openInterest', 0)
        pe_oi_change_pct = atm_pe_data.get('pchangeinOpenInterest', 0)

        # Extract CE Data for analysis
        ce_entry_price = atm_ce_data.get('sellPrice1')
        ce_delta = atm_ce_data.get('delta', 0)
        ce_oi = atm_ce_data.get('openInterest', 0)
        ce_oi_change_pct = atm_ce_data.get('pchangeinOpenInterest', 0)

        # --- ML Model Prediction ---
        prediction = None
        if model:
            features = extract_features_for_prediction(spot_price, atm_strike, atm_ce_data, atm_pe_data)
            if features is not None:
                prediction = model.predict(features)[0]
                logging.info(f"🤖 ML Model Prediction: {'UP' if prediction == 1 else 'DOWN'}")

        # Added OI Change check for stronger signal
        # Entry condition now includes ML model prediction
        if prediction == 0: # --- BEARISH SIGNAL: BUY PE ---
            if pe_entry_price and pe_entry_price < 100 and -0.6 < pe_delta < -0.4 and pe_oi > 50000 and pe_oi_change_pct > 0:
                log_msg = (f"🚨 BEARISH ENTRY SIGNAL: PE Ask Price({pe_entry_price:.2f}) < 100, "
                           f"Delta({pe_delta:.2f}) is favorable, and OI({pe_oi}) is high. "
                           f"ML model confirms DOWN trend. Placing BUY order for PE.")
                logging.info(log_msg)
                
                trading_symbol = f"NIFTY{datetime.strptime(expiry, '%d-%b-%Y').strftime('%y%b').upper()}{atm_strike}PE"
                logging.warning(f"Using generated placeholder trading symbol: {trading_symbol}")

                order_id = place_gtt_order(kite, trading_symbol, "BUY", trade_book["quantity"], pe_entry_price, pe_entry_price)
                if order_id:
                    trade_book.update({
                        "active_trade": True, "symbol": trading_symbol, "strike": atm_strike,
                        "type": "PE", "buy_price": pe_entry_price, "highest_pnl_pct": 0.0
                    })
                    trade_book["total_buy_qty"] += trade_book["quantity"]

        elif prediction == 1: # --- BULLISH SIGNAL: BUY CE ---
            # Define your entry conditions for a CE trade here
            if ce_entry_price and ce_entry_price < 100 and 0.4 < ce_delta < 0.6 and ce_oi > 50000 and ce_oi_change_pct > 0:
                log_msg = (f"🚨 BULLISH ENTRY SIGNAL: CE Ask Price({ce_entry_price:.2f}) < 100, "
                           f"Delta({ce_delta:.2f}) is favorable, and OI({ce_oi}) is high. "
                           f"ML model confirms UP trend. Placing BUY order for CE.")
                logging.info(log_msg)

                trading_symbol = f"NIFTY{datetime.strptime(expiry, '%d-%b-%Y').strftime('%y%b').upper()}{atm_strike}CE"
                logging.warning(f"Using generated placeholder trading symbol: {trading_symbol}")

                order_id = place_gtt_order(kite, trading_symbol, "BUY", trade_book["quantity"], ce_entry_price, ce_entry_price)
                if order_id:
                    trade_book.update({
                        "active_trade": True,
                        "symbol": trading_symbol,
                        "strike": atm_strike,
                        "type": "CE",
                        "buy_price": ce_entry_price,
                        "highest_pnl_pct": 0.0
                    })
                    trade_book["total_buy_qty"] += trade_book["quantity"]

def get_nse_option_info():
    """Gets the list of available expiry dates and strike prices."""
    if USE_DUMMY_DATA:
        return datetime.now().strftime("%d-%b-%Y")

    session = requests.Session()
    r = session.get(base_url, headers=headers, timeout=5)
    cookies = dict(r.cookies)
    symbol = "NIFTY"
    option_chain_contract_info_url = f"{base_url}/api/option-chain-contract-info?symbol={symbol}"
    resp = session.get(option_chain_contract_info_url, timeout=5, headers=headers, cookies=cookies)
    if resp.status_code != 200:
        logging.error(f"Failed to fetch option contract info. Status code: {resp.status_code}. Response: {resp.text}")
        return None, None
    try:
        data = resp.json() 
        # Find the first expiry date that is not in the past
        today = date.today()
        for expiry_str in data.get('expiryDates', []):
            expiry_date_obj = datetime.strptime(expiry_str, "%d-%b-%Y").date()
            if expiry_date_obj >= today:
                return expiry_str
        return None
    except (requests.exceptions.JSONDecodeError, Exception) as e:
        logging.error(f"Failed to parse contract info: {e}")
        return None
    

def ticker_loop(stop_event, kite, model, collect_data_file=None):
    logging.info("Starting ticker loop...")
    nearest_expiry = get_nse_option_info()
    if not nearest_expiry:
        logging.error("Could not determine nearest expiry. Exiting loop.")
        return

    while not stop_event.is_set():
        trading_cycle(kite, nearest_expiry, model, collect_data_file)
        # Politeness delay to avoid rate limiting
        logging.info("⏳ Waiting for 30 seconds for the next cycle...")
        stop_event.wait(USE_DUMMY_DATA and 1 or WAIT_TIME)

def kite_input():
        """Handles Kite Connect login and returns a valid kite object."""
        api_key = input("Enter your API Key: ")
        api_secret = input("Enter your API Secret: ")

        # Initialize KiteConnect to generate the session
        kite = KiteConnect(api_key=api_key)
        print("Login URL:", kite.login_url())
        request_token = input("Login and paste the request_token here: ")

        try:
            data = kite.generate_session(request_token, api_secret=api_secret)
            access_token = data["access_token"]
            kite.set_access_token(access_token)
            # Test if the token is valid by fetching user profile
            kite.profile()
            logging.info("Token is valid.")
            
        except Exception as e:
            logging.error("Error generating session or verifying token: {}".format(e))
            sys.exit(1)

# --- Execution ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Nifty 50 Trading Bot with ML integration.")
    parser.add_argument("--live", action="store_true", help="Enable LIVE trading (Real Money). Default is Dry-Run.")
    parser.add_argument("--dummy-data", action="store_true", help="Use dummy data instead of live NSE/Kite API.")
    parser.add_argument("--collect-data", type=str, help="Collect training data and save to the specified CSV file. python tradingbot.py --collect-data nse_training_data.csv")
    args = parser.parse_args()

    LIVE_TRADING = args.live
    USE_DUMMY_DATA = args.dummy_data
    COLLECT_DATA_FILE = args.collect_data

    # --- DISCLAIMER ---
    print("="*80)
    print("⚠️  DISCLAIMER: This is a sample script for educational purposes only.       ⚠️")
    print("⚠️  Automated trading involves significant risk and can lead to financial loss. ⚠️")
    print("⚠️  You are solely responsible for any trades placed by this script.          ⚠️")

    print("\n" + "▓" * 80)
    print(f"▓  🚀 LIVE TRADING   : {'✅ ENABLED' if LIVE_TRADING else '❌ DISABLED'}")
    print(f"▓  🛠️  DATA SOURCE    : {'📝 DUMMY DATA' if USE_DUMMY_DATA else '📡 LIVE API'}")
    print("▓" * 80 + "\n")

    if not LIVE_TRADING:
        print("🛡️  DRY RUN MODE: No real trades will be placed.")
    else:
        print("🚨  LIVE TRADING ENABLED: Real trades WILL be placed.")

    if COLLECT_DATA_FILE:
        print(f"💾  DATA COLLECTION: Data will be saved to '{COLLECT_DATA_FILE}'")
    print("="*80)

    # Load the trained model
    model = None
    try:
        model = joblib.load('trading_model.joblib')
        logging.info("✅ ML model 'trading_model.joblib' loaded successfully.")
    except FileNotFoundError:
        logging.warning("⚠️ ML model 'trading_model.joblib' not found. Running without ML predictions.")

    kite = None
    if not USE_DUMMY_DATA and LIVE_TRADING:
        kite = kite_input()
        if not kite:
            sys.exit("❌ Exiting: Kite login failed.")

    stop_event = threading.Event()
    t = threading.Thread(target=ticker_loop, args=(stop_event, kite, model, COLLECT_DATA_FILE))
    t.start()

    try:
        input("Monitoring Nifty 50... Press Enter to stop.\n")
    except KeyboardInterrupt:
        pass
    finally:
        logging.info("\n🛑 Stopping ticker...")
        stop_event.set()
        t.join()
        print(f"\n💰 Total Session Profit/Loss: {trade_book['total_pnl']:.2f}")
        print(f"📊 Total Buy Quantity: {trade_book['total_buy_qty']}")
        print(f"📊 Total Sell Quantity: {trade_book['total_sell_qty']}")
        logging.info("Exited.")