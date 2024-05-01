import requests
print('abc123')
response = requests.get('http://18.205.241.120:8000/done', headers={'Content-Type': 'application/json'})
print(response)
text = response.text
print(text)
print('asdfnasdklfjasdklfasdjfl')
# import pyautogui
# pyautogui.FAILSAFE = False
# import time
# from flask import Flask, request
# from flask_cors import CORS
# # import logging
# import base64
# import requests
# import io
# from io import BytesIO

# def get_done():
#     # OpenAI API Key
#     api_key2 = "asdf"

#     # Function to encode the image as base64
#     def encode_image(image):
#         buffered = BytesIO()
#         image.save(buffered, format="PNG")
#         return base64.b64encode(buffered.getvalue()).decode('utf-8')
    
#     # Take a screenshot of the current screen
#     # pyautogui.click(311, 754)
#     screenshot = pyautogui.screenshot()
    
#     # Getting the base64 string
#     base64_image = encode_image(screenshot)

#     headers = {
#     "Content-Type": "application/json",
#     "Authorization": f"Bearer {api_key}"
#     }

#     payload = {
#     "model": "gpt-4-vision-preview",
#     "messages": [
#         {
#         "role": "user",
#         "content": [
#             {
#             "type": "text",
#             "text": '''Answer only with 1 or 0. Your response will be used inside a Python script to set a variable to True or False, so respond only with 1 for True or 0 for False and nothing else. Is the latest message on the terminal screen something like "The task is done" or "The task is impossible"?'''
#             },
#             {
#             "type": "image_url",
#             "image_url": {
#                 "url": f"data:image/jpeg;base64,{base64_image}"
#             }
#             }
#         ]
#         }
#     ],
#     #"seed": 123, 
#     "temperature": 0,
#     "max_tokens": 300
#     }

#     response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

#     print(response.json())

#     done = response.json()['choices'][0]['message']['content']

#     print(done)

#     return done

# app = Flask(__name__)
# CORS(app)

# @app.route('/message', methods=['POST'])
# def handle_message():
#     print('reached')
#     message = request.json['message']
#     pyautogui.click(50, 530)
#     time.sleep(5)
#     pyautogui.typewrite(message)
#     time.sleep(5)
#     pyautogui.press('enter')
#     done = False
#     while not done:
#         # call OpenAI-Vision and ask it to: return True if done else False
#         done = bool(int(get_done()))
#         time.sleep(30)

#     return 'Done'

# @app.route('/test', methods=['GET'])
# def test():
#     return 'live'


# # Start the server
# app.run(host='0.0.0.0', port=8000)

# # Configure logging
# # logging.basicConfig(filename='script.log', level=logging.INFO, format='%(asctime)s - %(message)s')

# # logging.info('Script started')

# def start():
#     try:
#         # Wait for a few seconds for fun
#         #logging.info('Waiting for 5 seconds for fun')
#         time.sleep(5)

#         # Press the Windows key to open the Start menu
#         #logging.info('Opening the Start menu')
#         pyautogui.press('win')

#         # Type "obs" to search for the OBS application
#         #logging.info('Searching for OBS application')
#         pyautogui.typewrite('obs')
#         time.sleep(5)

#         # Press Enter to open OBS
#         #logging.info('Opening OBS')
#         pyautogui.press('enter')

#         # Wait for OBS to load (adjust the delay as needed)
#         #logging.info('Waiting for OBS to load (5 seconds)')
#         time.sleep(30)

#         # Move the mouse to the "Start Streaming" button and click it
#         #logging.info('Clicking the "Start Streaming" button')
#         pyautogui.click(x=1095, y=292)  # Replace x and y with the coordinates of the button

#         #select the primary  monitor, minimize
#         time.sleep(2)
#         pyautogui.click(504, 287)
#         time.sleep(2)
#         pyautogui.click(849, 209)
#         time.sleep(2)
#         pyautogui.click(850, 254)
#         time.sleep(2)
#         pyautogui.click(1098, 10) #minimize OBS

#         # Wait for a few seconds to allow the streaming to start
#         #logging.info('Waiting for streaming to start (2 seconds)')
#         time.sleep(2)

#         # Press the Windows key to open the Start menu again
#         #logging.info('Opening the Start menu again')
#         pyautogui.press('win')
#         time.sleep(2)

#         # Type "terminal" to search for the terminal application
#         #logging.info('Searching for terminal application')
#         pyautogui.typewrite('terminal')
#         time.sleep(2)

#         # Press Enter to open the terminal
#         #logging.info('Opening the terminal')
#         pyautogui.press('enter')

#         # Wait for the terminal to open (adjust the delay as needed)
#         #logging.info('Waiting for the terminal to open (2 seconds)')
#         time.sleep(2)

#         # Type the command "interpreter --os" in the terminal
#         #logging.info('Typing the command "interpreter --os" in the terminal')
#         pyautogui.typewrite('interpreter --os')
#         time.sleep(2)

#         # Press Enter to execute the command
#         #logging.info('Executing the command')
#         pyautogui.press('enter')

#         # Wait for 90 seconds
#         #logging.info('Waiting for 90 seconds')
#         time.sleep(90)

#         # Type the API key
#         #logging.info('Typing the API key')
#         pyautogui.typewrite('asdf')

#         # Press Enter to submit the API key
#         #logging.info('Submitting the API key')
#         pyautogui.press('enter')

#         #logging.info('Script completed successfully')

#     except Exception as e:
#         print(e)
#         #logging.error(f'An error occurred: {str(e)}')

# start()