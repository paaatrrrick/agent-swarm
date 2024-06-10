"""
Mock RDP workspace for testing purposes.
"""


from queue import Queue
import websocket
import json
import time
from threading import Thread
import requests

from flask import Flask, request

from custom_logger import RadahLogger as Logger
logger = Logger(Logger.LogLevel.DEBUG).get_logger()

# chat message queue
MESSAGE_QUEUE = Queue()


# agent id for one of the agents (create dedicated dummy agent id later maybe)
AGENTID = "665386f24463ceba2c4df08f"
WS_SERVER_URL = "ws://localhost:4500" # assume radah server is running locally on port 4500
HTTP_SERVER_URL = "http://localhost:4500"

# logger = logging.getLogger(__name__)
# logger.setLevel(logging.DEBUG)
# logger.addHandler(logging.StreamHandler(sys.stderr))

# # add logger message format
# # [filename:lineno - funcname - loglevel] message

# class CustomFormatter(logging.Formatter):
#     ANSI_LEVEL_MAP = {
#         'DEBUG': '\033[94mDEBUG\033[0m',
#         'INFO': '\033[92mINFO\033[0m',
#         'WARNING': '\033[93mWARNING\033[0m',
#         'ERROR': '\033[91mERROR\033[0m',
#         'CRITICAL': '\033[91mCRITICAL\033[0m'
#     }
    
#     def format(self, record):
#         loglevel = record.levelname
#         record.levelname = self.ANSI_LEVEL_MAP.get(loglevel, loglevel)
#         return super().format(record)
    
# formatter = CustomFormatter('[%(filename)s:%(lineno)s | %(funcName)s() %(levelname)s] %(message)s')

# # set the formatter for the logger
# logger.handlers[0].setFormatter(formatter)


# endpoint for receiving messages from the radah server
app = Flask(__name__)

@app.route('/message', methods=['POST'])
def handle_message():
    """
    Handle messages from the Radah server
    """
    message = request.json['message']
    logger.info(f"Received message from Radah server: {message}")
    
    
    start = {
        "start": True,
        "type": "message",
        "role": "assistant",
        "content": "",
    }
    message = {
        "role": "assistant",
        "type": "message",
        "content": "[ECHO] " + message,
        "end": True,
        "completed": True
    }
    
    MESSAGE_QUEUE.put(start)
    MESSAGE_QUEUE.put(message)
    
    # send a mock response
    return "Message sent to subprocess"


class MockWorkspace:

    def __init__(self, server_url: str):
        self.server_url = server_url
        self.ws = None
        
    def send_prompt_complete(self):
        """
        Send a prompt complete message to the server
        """
        try:
            url = f"{HTTP_SERVER_URL}/workspace/promptComplete/{AGENTID}"
            response = requests.get(
                url, 
                headers={'Content-Type': 'application/json'}
                )
            logger.info(f"Sent prompt complete message {response.status_code}")
        except Exception as e:
            logger.error(f"Error sending prompt complete message: {str(e)}")  
        
        
    def on_message(self, ws, message):
        """
        Callback for when a message is received from the server
        """
        logger.info(f"Received message")
        message = json.loads(message)
        logger.info(f"Received message from server: {message}")
        
    def on_error(self, ws, error):
        """
        Callback for when an error occurs
        """
        logger.error(f"Error: {error}")
    
    def on_close(self, ws, close_status_code, close_msg):
        """
        Callback for when the connection is closed
        """
        logger.info("Connection closed")
                
    def on_open(self, ws):
        """
        Callback for when the connection is opened
        """
        logger.info("Connection opened")
        logger.error('Connection opened')
        # send a message to the server
        message = {
            "type": "config", 
            "promptRunning": False, 
            "agentID": AGENTID, 
            "connectionType": "workspace"
        }
        ws.send(json.dumps(message))
            

    def run(self):
        
        def send_chat_responses():
            """
            Send chat responses to the server
            """
            while True:
                if MESSAGE_QUEUE.empty():
                    time.sleep(0.1)
                    continue
                message = MESSAGE_QUEUE.get()
                logger.info(f"Sending chat response: {message}")
                self.ws.send(json.dumps(message))
                MESSAGE_QUEUE.task_done()
                
                # hit the prompt complete endpoint
                self.send_prompt_complete()
        
        
        self.ws = websocket.WebSocketApp(
            self.server_url,
            on_message=self.on_message,
            on_error=self.on_error,
            on_close=self.on_close
        )
        self.ws.on_open = self.on_open
        
        Thread(target=send_chat_responses).start()
        self.ws.run_forever(reconnect=10)


if __name__ == "__main__":
    mock_workspace = MockWorkspace(WS_SERVER_URL)
    # spawn a new thread to run the websocket
    Thread(target=mock_workspace.run).start()
    
    # on the main thread, we need to run the flask app
    app.run(port=8000) 
    
    
    
    

