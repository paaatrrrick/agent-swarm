import websocket
import time
import json
import pyautogui


endpoint = "ws://localhost:4500"


def on_message(ws, message):
    print("Received from server: " + message)

    #parse json from message
    jsonParsed = json.loads(message)
    print(jsonParsed)


def on_error(ws, error):
    print("Error: " + str(error))

def on_close(ws, close_status_code, close_msg):
    print("### closed ###")
    # Attempt to reconnect with an exponential backoff strategy
    reconnect_delay = 1  # Start with a 1 second delay
    max_delay = 100  # Maximum delay between reconnect attempts
    while True: 
        print(f"Attempting to reconnect in {reconnect_delay} seconds...")
        time.sleep(reconnect_delay)
        try:
            # Attempt to create a new connection
            ws = websocket.WebSocketApp("ws://localhost:4500",
                                         on_message=on_message,
                                         on_error=on_error,
                                         on_close=on_close)
            ws.run_forever()
            reconnect_delay = min(reconnect_delay * 2, max_delay)  # Exponential backoff
            break  # Successfully reconnected, exit the loop
        except Exception as e:
            print(f"Reconnect failed: {e}")
            reconnect_delay = min(reconnect_delay * 2, max_delay)  # Exponential backoff

if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("ws://localhost:4500",
                                on_message=on_message,
                                on_error=on_error,
                                on_close=on_close)
    # ws.on_open = on_open
    ws.run_forever()
