from django.shortcuts import render, render_to_response ## render to response html to response?
from django.http import HttpResponse # http response for AJAX request
import json
from django.views.decorators.csrf import csrf_exempt

from chatterbot import ChatBot

chatbot = ChatBot(
    'Ron Obvious',
    trainer='chatterbot.trainers.ChatterBotCorpusTrainer'
) # setting up chatbot instance, Ron Obvious is a type of pre defined chatbot

# Train based on the english corpus

# Already trained and it's supposed to be persistent, once trained, doesn't need to be trained again
# chatbot.train("chatterbot.corpus.english")

@csrf_exempt #allows json to be passed without needing csrf cookie????
def get_response(request):  # passes json AJAX request
	response = {'status': None}

	if request.method == 'POST':
		data = json.loads(request.body.decode('utf-8'))
		message = data['message'] # message that was typed by user

		chat_response = chatbot.get_response(message).text ## feed text to chatbot
		response['message'] = {'text': chat_response, 'user': False, 'chat_bot': True} ## response from chatbot
		response['status'] = 'ok' ## to indicate that the response was passed successfully

	else:
		response['error'] = 'no post data found'

	return HttpResponse(
		json.dumps(response),
			content_type="application/json"
		)


def home(request, template_name="home.html"):
	context = {'title': 'Chatbot Version 1.0'}
	return render_to_response(template_name, context) ## allow rendering of the home page
