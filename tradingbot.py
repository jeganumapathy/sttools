import logging
import threading
import requests
import sys
import random
import math
from datetime import date, datetime
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

# --- Trade State Management ---
trade_book = {
    "active_trade": False,
    "symbol": None,
    "strike": None,
    "type": None,  # "CE" or "PE"
    "buy_price": 0,
    "quantity": 65,  # Realistic quantity (Nifty lot size)
    "min_profit_pct": 3,
    "max_profit_pct": 8,
    "stop_loss_pct": 5,  # Stop loss percentage
    "total_pnl": 0.0,
    "total_buy_qty": 0,
    "total_sell_qty": 0,
}

TEST_MODE = True  # Set to True to use dummy data and random LTPs
WAIT_TIME = 1  # Time in seconds between each cycle (30 reduced for testing)

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

    d1 = (math.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    
    pdf_d1 = (1 / (math.sqrt(2 * math.pi))) * math.exp(-d1**2 / 2)

    if option_type.upper() == "CE":
        delta = _cdf(d1)
        theta = -(S * pdf_d1 * sigma) / (2 * math.sqrt(T)) - r * K * math.exp(-r * T) * _cdf(d2)
    elif option_type.upper() == "PE":
        delta = _cdf(d1) - 1
        theta = -(S * pdf_d1 * sigma) / (2 * math.sqrt(T)) + r * K * math.exp(-r * T) * _cdf(-d2)
    else:
        return {}

    gamma = pdf_d1 / (S * sigma * math.sqrt(T))
    vega = S * pdf_d1 * math.sqrt(T)
    
    # Return Theta per day and Vega for a 1% change in IV
    return {'delta': delta, 'gamma': gamma, 'theta': theta / 365, 'vega': vega / 100}


def generate_dummy_data(symbol, expiry_date):
    """Generates dummy option chain data for testing."""
    # Initialize static spot price for random walk behavior
    if not hasattr(generate_dummy_data, "spot_price"):
        generate_dummy_data.spot_price = 25642

    is_expiry_day = (datetime.strptime(expiry_date, "%d-%b-%Y").date() == date.today())
    
    # Simulate volatility regimes: 30% chance of High Volatility, 70% Low Volatility
    volatility = 40 if random.random() < 0.3 else 5
    generate_dummy_data.spot_price += random.uniform(-volatility, volatility)
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

    # Generate strikes around ATM
    for i in range(-10, 11):
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
        
    return {
        "records": {
            "underlyingValue": round(spot_price, 2),
            "expiryDates": [expiry_date],
            "data": data,
            "timestamp": datetime.now().strftime("%d-%b-%Y %H:%M:%S"),
            "strikePrices": strike_prices
        },
        "filtered": {
            "data": data,
            "CE": {"totOI": ce_tot_oi, "totVol": ce_tot_vol},
            "PE": {"totOI": pe_tot_oi, "totVol": pe_tot_vol}
        }
    }

def get_full_option_chain(symbol, expiry_date):
    """Fetches the entire option chain records for a given symbol and expiry."""
    if TEST_MODE:
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

def place_gtt_order(kite, symbol, trans_type, qty, price, trigger_price):
    """Places a GTT order on Kite."""
    if TEST_MODE:
        logging.info(f"🧪 [TEST MODE] GTT Order placed for {qty} {symbol} {trans_type} at {price}. Trigger: {trigger_price}")
        return "TEST_TRIGGER_ID_123"

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

def trading_cycle(kite, expiry):
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
    if not TEST_MODE:
        time_to_expiry = max((datetime.strptime(expiry, "%d-%b-%Y").date() - date.today()).days, 0) / 365.0
        
        # For CE
        ce_iv = atm_ce_data.get('impliedVolatility', 0) / 100 # Convert from %
        atm_ce_data.update(calculate_greeks("CE", spot_price, atm_strike, time_to_expiry, RISK_FREE_RATE, ce_iv))

        # For PE
        pe_iv = atm_pe_data.get('impliedVolatility', 0) / 100 # Convert from %
        atm_pe_data.update(calculate_greeks("PE", spot_price, atm_strike, time_to_expiry, RISK_FREE_RATE, pe_iv))

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
        current_ltp = held_option_data.get('lastPrice')

        if current_ltp is not None and trade_book["buy_price"] > 0:
            pnl_pct = ((current_ltp - trade_book["buy_price"]) / trade_book["buy_price"]) * 100
            print(f"ℹ️  Holding {trade_book['symbol']}. Buy: {trade_book['buy_price']}, LTP: {current_ltp}, PnL: {pnl_pct:.2f}%")

            # Check for profit target or stop-loss
            if pnl_pct >= trade_book["min_profit_pct"] or pnl_pct <= -trade_book["stop_loss_pct"]:
                exit_reason = "PROFIT TARGET" if pnl_pct >= 0 else "STOP-LOSS"
                pnl_amount = (current_ltp - trade_book["buy_price"]) * trade_book["quantity"]
                trade_book["total_pnl"] += pnl_amount
                trade_book["total_sell_qty"] += trade_book["quantity"]
                logging.info(f"💰 {exit_reason} HIT ({pnl_pct:.2f}%). Realized PnL: {pnl_amount:.2f}. Placing SELL order.")
                place_gtt_order(kite, trade_book["symbol"], "SELL", trade_book["quantity"], current_ltp, current_ltp)
                # Reset trade book after selling
                trade_book.update({"active_trade": False, "symbol": None, "strike": None, "type": None, "buy_price": 0})
    else:
        # --- ENTRY LOGIC ---
        # Example Strategy: Buy ATM PE if LTP < 100, Delta is between -0.4 and -0.6, and OI > 50k.
        # DO NOT USE THIS IN LIVE TRADING.
        atm_pe_ltp = atm_pe_data.get('lastPrice')
        pe_delta = atm_pe_data.get('delta', 0)
        pe_oi = atm_pe_data.get('openInterest', 0)

        if atm_pe_ltp and atm_pe_ltp < 100 and -0.6 < pe_delta < -0.4 and pe_oi > 50000:
            log_msg = (f"🚨 ENTRY SIGNAL: PE LTP({atm_pe_ltp}) < 100, "
                       f"Delta({pe_delta:.2f}) is favorable, and OI({pe_oi}) is high. "
                       f"Placing BUY order.")
            logging.info(log_msg)
            
            # IMPORTANT: You need a reliable way to get the Kite 'tradingsymbol'.
            # The NSE 'identifier' is different. A robust solution uses the Kite instrument dump.
            # This is a placeholder and will likely fail if the expiry/strike changes.
            trading_symbol = f"NFO:NIFTY{datetime.strptime(expiry, '%d-%b-%Y').strftime('%y%b').upper()}{atm_strike}PE"
            logging.warning(f"Using generated placeholder trading symbol: {trading_symbol}")

            order_id = place_gtt_order(kite, trading_symbol, "BUY", trade_book["quantity"], atm_pe_ltp, atm_pe_ltp)
            if order_id:
                # Update trade book with the new position
                trade_book.update({
                    "active_trade": True,
                    "symbol": trading_symbol,
                    "strike": atm_strike,
                    "type": "PE",
                    "buy_price": atm_pe_ltp,  # Approximation, ideally get from order execution details
                })
                trade_book["total_buy_qty"] += trade_book["quantity"]

def get_nse_option_info():
    """Gets the list of available expiry dates and strike prices."""
    if TEST_MODE:
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
    

def ticker_loop(stop_event, kite):
    logging.info("Starting ticker loop...")
    nearest_expiry = get_nse_option_info()
    if not nearest_expiry:
        logging.error("Could not determine nearest expiry. Exiting loop.")
        return

    while not stop_event.is_set():
        trading_cycle(kite, nearest_expiry)
        # Politeness delay to avoid rate limiting
        logging.info("⏳ Waiting for 30 seconds for the next cycle...")
        stop_event.wait(WAIT_TIME)

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
    # --- DISCLAIMER ---
    print("="*80)
    print("⚠️  DISCLAIMER: This is a sample script for educational purposes only.       ⚠️")
    print("⚠️  Automated trading involves significant risk and can lead to financial loss. ⚠️")
    print("⚠️  You are solely responsible for any trades placed by this script.          ⚠️")
    print("="*80)
    kite = None
    if not TEST_MODE:
        kite = kite_input()
        if not kite:
            sys.exit("❌ Exiting: Kite login failed.")

    stop_event = threading.Event()
    t = threading.Thread(target=ticker_loop, args=(stop_event, kite))
    t.start()

    try:
        input("Monitoring Nifty 50... Press Enter to stop.\n")
    except KeyboardInterrupt:
        pass
    finally:
        logging.info("\n🛑 Stopping ticker...")
        stop_event.set()
        t.join()
        print(f"📊 Total Buy Quantity: {trade_book['total_buy_qty']}")
        print(f"📊 Total Sell Quantity: {trade_book['total_sell_qty']}")
        print(f"\n💰 Total Session Profit/Loss: {trade_book['total_pnl']:.2f}")
        logging.info("Exited.")