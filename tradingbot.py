import logging
import threading
import requests
import sys
import random
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

# --- Trade State Management ---
trade_book = {
    "active_trade": False,
    "symbol": None,
    "strike": None,
    "type": None,  # "CE" or "PE"
    "buy_price": 0,
    "quantity": 25,  # Realistic quantity (Nifty lot size)
    "min_profit_pct": 3,
    "max_profit_pct": 8,
    "stop_loss_pct": 5,  # Stop loss percentage
    "total_pnl": 0.0,
    "total_buy_qty": 0,
    "total_sell_qty": 0,
}

TEST_MODE = True  # Set to True to use dummy data and random LTPs

def generate_dummy_data(symbol, expiry_date):
    """Generates dummy option chain data for testing."""
    is_expiry_day = (datetime.strptime(expiry_date, "%d-%b-%Y").date() == date.today())
    # Simulate a spot price around 22000 with some random movement
    spot_price = 25642 + random.uniform(-50, 50)
    atm_strike = round(spot_price / 50) * 50
    
    data = []
    # Generate strikes around ATM
    for i in range(-10, 11):
        strike = atm_strike + (i * 50)
        # Simulate option pricing (intrinsic + time value + noise)
        ce_intrinsic = max(0, spot_price - strike)
        pe_intrinsic = max(0, strike - spot_price)
        
        # On expiry day, time value decays to near zero.
        time_value_component = random.uniform(0, 5) if is_expiry_day else random.uniform(20, 100)

        ce_ltp = ce_intrinsic + time_value_component
        pe_ltp = pe_intrinsic + time_value_component
        
        data.append({
            "strikePrice": strike,
            "expiryDate": expiry_date,
            "CE": {"lastPrice": round(ce_ltp, 2)},
            "PE": {"lastPrice": round(pe_ltp, 2)}
        })
        
    return {
        "underlyingValue": round(spot_price, 2),
        "expiryDates": [expiry_date],
        "data": data,
        "timestamp": datetime.now().strftime("%d-%b-%Y %H:%M:%S")
    }

def get_full_option_chain(symbol, expiry_date):
    """Fetches the entire option chain records for a given symbol and expiry."""
    if TEST_MODE:
        return generate_dummy_data(symbol, expiry_date)

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

def find_ltps_for_strike(records_data, strike_price):
    """Finds CE and PE LTP for a specific strike from the option chain data."""
    ce_ltp = None
    pe_ltp = None
    for item in records_data.get('data', []):
        if item.get('strikePrice') == strike_price:
            if item.get('CE'):
                ce_ltp = item.get('CE').get('lastPrice')
            if item.get('PE'):
                pe_ltp = item.get('PE').get('lastPrice')
            break
    return ce_ltp, pe_ltp

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
    atm_ce_ltp, atm_pe_ltp = find_ltps_for_strike(records, atm_strike)

    # --- Display Data ---
    print("\n" + "═" * 50)
    print(f"📊  NIFTY 50 LIVE TRACKER")
    print(f"🕒  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("═" * 50)
    print(f"💰  Spot Price   :  {spot_price:.2f}")
    print(f"📅  Expiry       :  {expiry}")
    print(f"🎯  ATM Strike   :  {atm_strike}")
    print("─" * 50)
    print(f"🟢  ATM CE LTP   :  {atm_ce_ltp}")
    print(f"🔴  ATM PE LTP   :  {atm_pe_ltp}")
    print("═" * 50)

    # --- Trading Logic ---
    if trade_book["active_trade"]:
        # --- EXIT LOGIC ---
        held_strike = trade_book["strike"]
        held_ce_ltp, held_pe_ltp = find_ltps_for_strike(records, held_strike)
        
        current_ltp = held_ce_ltp if trade_book["type"] == "CE" else held_pe_ltp

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
        # This is a placeholder for your entry strategy.
        # Example: Buy a Put option if its LTP is below 100. DO NOT USE THIS IN LIVE TRADING.
        if atm_pe_ltp and atm_pe_ltp < 100:
            logging.info(f"🚨 ENTRY SIGNAL: ATM PE LTP ({atm_pe_ltp}) is below 100. Placing BUY order.")
            
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
                    "buy_price": atm_pe_ltp, # Approximation, ideally get from order execution details
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
        stop_event.wait(30)

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