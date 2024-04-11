import websocket
import threading
import json
import time
from queue import Queue



message_queue = Queue()

from interpreter import interpreter
interpreter.llm.api_key = "NA"



#CONSTANTS
IS_LOCAL = True
local_endpoint = "ws://localhost:4500"
prod_endpoint = "wss://agent-swarm-production.up.railway.app"
ENDPOINT = local_endpoint if IS_LOCAL else prod_endpoint

def on_message(ws, message):
    print("Received from server: " + message)
    data = json.loads(message)

def sendMessageToClient(ws, message):
    ws.send(json.dumps(message))

def on_error(ws, error):
    print("Error: ", error)

def on_close(ws, close_status_code, close_msg):
    print("### closed ###")
    reconnect_delay = 1
    max_delay = 100
    while True: 
        print(f"Attempting to reconnect in {reconnect_delay} seconds...")
        time.sleep(reconnect_delay)
        try:
            ws = websocket.WebSocketApp(ENDPOINT, on_message=on_message, on_close=on_close, on_open=on_open)
            ws.run_forever()
            reconnect_delay = min(reconnect_delay * 2, max_delay)
            break
        except Exception as e:
            reconnect_delay = min(reconnect_delay * 2, max_delay)

def on_open(ws):
    print("### connected ###")
    ws.send(json.dumps({ "type": "config", "promptRunning": False, "agentID": "6608de44e258f1dae436c7c2", "connectionType": "workspace"}))
    #every 5 seconds send a message to the Client
    i = 1
    while True:
        time.sleep(1)
        if i == 1:
            sendMessageToClient(ws, {"role": "assistant", "content": ""})

        sendMessageToClient(ws, {"role": [{"message": count}]})
        count += 1
    # print('going to send')
    # for chunk in interpreter.chat("What's 2 + 2", stream=True, display=False):
    #     print(chunk)
    #     sendMessageToClient(ws, {"content" : chunk, "type": "message"})

def websocket_thread(queue):
    def run(*args):
        while True:
            # Check if there are messages in the queue
            if not queue.empty():
                message = queue.get()
                ws.send(message)
            time.sleep(0.1)  # Prevent tight loop, adjust as necessary


    ws = websocket.WebSocketApp(ENDPOINT,
                                on_message=on_message,
                                on_error=on_error,
                                on_close=on_close)
    ws.on_open = on_open
    wst = threading.Thread(target=run)
    wst.start()
    ws.run_forever()

# Start WebSocket client in a separate thread
thread = threading.Thread(target=websocket_thread, args=(message_queue,))
thread.start()


