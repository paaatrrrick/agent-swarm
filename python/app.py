import websocket
import time
import json

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

def on_open(ws):
    print("### connected ###")
    ws.send(json.dumps({ "type": "config", "promptRunning": False, "agentID": "6608de44e258f1dae436c7c2", "connectionType": "workspace"}))
    #every 5 seconds send a message to the Client
    count = 0
    while True:
        sendMessageToClient(ws, {"messages": [{"message": count}]})
        time.sleep(30)
        count += 1

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


if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp(ENDPOINT, on_message=on_message, on_close=on_close, on_open=on_open)
    # ws.on_open = on_open
    ws.run_forever()






