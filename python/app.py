import websocket
import time
import json
import pyautogui


IS_LOCAL = True


local_endpoint = "ws://localhost:4500"
prod_endpoint = "ws://localhost:4500"

endpoint = local_endpoint if IS_LOCAL else prod_endpoint





def login(registration, username, password):
        time.sleep(2)
        pyautogui.click(1092, 661, button="right")
        time.sleep(2)
        pyautogui.click(1208, 352)
        time.sleep(2)
        pyautogui.click(367, 16)
        time.sleep(2)
        pyautogui.click(1075, 485)
        time.sleep(2)
        pyautogui.click(1195, 455)
        time.sleep(2)
        pyautogui.typewrite(registration)
        time.sleep(2)
        pyautogui.press('enter')
        time.sleep(2)
        pyautogui.click(1060, 514)
        time.sleep(2)
        pyautogui.click(1078, 440)
        time.sleep(2)
        pyautogui.tripleClick(708, 162)
        time.sleep(2)
        pyautogui.press('backspace')
        time.sleep(2)
        pyautogui.typewrite(username)
        time.sleep(2)
        pyautogui.click(705, 204)
        time.sleep(2)
        pyautogui.typewrite(password)
        time.sleep(2)
        pyautogui.click(731, 262)
        time.sleep(4)
        pyautogui.click(585, 310) # click not now for saving password
        time.sleep(2) # wait much longer for startup script to finish
        # close tab
        # maybe just do the whole startup? No, that doesn't scale -- logging in like this may already be unscalable
        # Goal is to launch.







def on_message(ws, message):
    print("Received from server: " + message)
    try:
        jsonParsed = json.loads(message)
        #json parsed should include registration, username, password
        if 'registration' in jsonParsed and 'username' in jsonParsed and 'password' in jsonParsed:
            login(jsonParsed['registration'], jsonParsed['username'], jsonParsed['password'])
        else:
            print("Error: Missing registration, username, or password")
            print(jsonParsed)
    except Exception as e:
        print(f"Error: {e}")
    #parse json from message


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
            ws = websocket.WebSocketApp(endpoint,
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






