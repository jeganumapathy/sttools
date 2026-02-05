import logging
import sys
from kiteconnect import KiteTicker, KiteConnect

logging.basicConfig(level=logging.DEBUG)

api_key = "@"
api_secret = "@"
  # TODO: Replace with your actual API Secret

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

# Initialise
kws = KiteTicker(api_key, access_token)

def on_ticks(ws, ticks):  # noqa
    # Callback to receive ticks.
    logging.info("Ticks: {}".format(ticks))

def on_connect(ws, response):  # noqa
    # Callback on successful connect.
    # Subscribe to a list of instrument_tokens (RELIANCE and ACC here).
    ws.subscribe([738561, 5633])

    # Set RELIANCE to tick in `full` mode.
    ws.set_mode(ws.MODE_FULL, [738561])

def on_order_update(ws, data):
    logging.debug("Order update : {}".format(data))

def on_error(ws, code, reason):
    logging.error("Error: {} - {}".format(code, reason))

def on_close(ws, code, reason):
    logging.info("Connection closed: {} - {}".format(code, reason))

# Assign the callbacks.
kws.on_ticks = on_ticks
kws.on_connect = on_connect
kws.on_order_update = on_order_update
kws.on_error = on_error
kws.on_close = on_close

# Start the ticker in a separate thread.
kws.connect(threaded=True)

print("Press 'Enter' to exit.")
try:
    input()
except KeyboardInterrupt:
    pass

kws.close()