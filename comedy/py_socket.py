import asyncio
import websockets
import json

from chatterbot import ChatBot

chatbot = ChatBot(
    'Ron Obvious',
    trainer='chatterbot.trainers.ChatterBotCorpusTrainer'
)

# Train based on the english corpus

#Already trained and it's supposed to be persistent
#chatbot.train("chatterbot.corpus.english")

async def chat_receiver(websocket, path):
    async for message in websocket: # handles requests from websocket, websockets pass json file here
        message = json.loads(message)
        text = message['text']

        chat_response = chatbot.get_response(text).text
        print(chat_response)
        await websocket.send(json.dumps({'response': chat_response})) # sends back as json response, await nmeans its always open and waits for any input


async def router(websocket, path):
	if path == "/":
		await chat_receiver(websocket, path)

    #the code below is how you add other path's
    
	# elif path == "/shade-area":
	# 	await get_shaded_area(websocket, path)
	# elif path == '/render':
	# 	await render(websocket, path)

asyncio.get_event_loop().run_until_complete(websockets.serve(router, '0.0.0.0', 8765)) # same server that was listed on the javascript file , script.js websocket

asyncio.get_event_loop().run_forever()