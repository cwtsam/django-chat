/*
function startConverting()
            {
              document.getElementById("re").style.visibility = "hidden";   
              var r = document.getElementById('result');
              var spr = new webkitSpeechRecognition(); //Initialisation of web Kit
                spr.continuous=false; //True if continous conversion is needed, false to stop transalation when paused 
                spr.interimResults=true;
                spr.lang='en-GB'; // Set Input language
                spr.start(); //Start Recording the voice 
                var ftr=''; //final results
                spr.onresult=function(event){
                    var interimTranscripts='';
                    for(var i = event.resultIndex; i<event.results.length; i++)
                    {
                        var transcript = event.results[i][0].transcript;
                        transcript.replace("\n","<br>")
                        if(event.results[i].isFinal){
                            ftr += transcript;
                        }
                        else
                        interimTranscripts += transcript;
                    }
                    r.innerHTML = ftr + interimTranscripts ;
                };

                spr.onerror=function(event){};
            }
*/



var final_transcript = ''; //final transcript made as global variable
var recognizing = false;
var ignore_onend;
var start_timestamp;


function upgrade() {
  start_button.style.visibility = 'hidden';
  showInfo('info_upgrade');
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

function startButton(event) {
  if (recognizing) {
    recognition.stop();
    return;
  }
  final_transcript = '';
  recognition.lang = 'en-GB';
  recognition.start();
  ignore_onend = false;
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
  start_img.src = '/static/img/mic-slash.gif'; //mic slash image shown (usually for short while). Noticable when Chrome asks user for permission to use mic
  showInfo('info_allow');
  //showButtons('none');
  start_timestamp = event.timeStamp;
}

function showInfo(s) {
  if (s) {
    for (var child = info.firstChild; child; child = child.nextSibling) {
      if (child.style) {
        child.style.display = child.id == s ? 'inline' : 'none';
      }
    }
    info.style.visibility = 'visible';
  } else {
    info.style.visibility = 'hidden';
  }
}


if (!('webkitSpeechRecognition' in window)) { //checks if webkitspeechreg object exists
	upgrade(); //if it does not, check user to upgrade browser
} else {
	var recognition = new webkitSpeechRecognition();
	recognition.continuous = false; //if false, speech recognition will stop when user stops talking
	recognition.interimResults = true; //shows interim results, if false, results from are final

	recognition.onstart = function() { //recognition.start() that is called by pressing mic button calls this onstart event ahndler
		recognizing = true;
		showInfo('info_speak_now');
		start_img.src = '/static/img/mic-animate.gif';
	};

	recognition.onerror = function(event) {
		if (event.error == 'no-speech') {
		  start_img.src = '/static/img/mic.gif';
		  showInfo('info_no_speech');
		  ignore_onend = true;
		}
		if (event.error == 'audio-capture') {
		  start_img.src = '/static/img/mic.gif';
		  showInfo('info_no_microphone');
		  ignore_onend = true;
		}
		if (event.error == 'not-allowed') {
		  if (event.timeStamp - start_timestamp < 100) {
		    showInfo('info_blocked');
		  } else {
		    showInfo('info_denied');
		  }
		  ignore_onend = true;
		}
	};

	recognition.onend = function() {
		recognizing = false;
		if (ignore_onend) {
		  return;
		}
		start_img.src = '/static/img/mic.gif';
		if (!final_transcript) {
		  showInfo('info_start');
		  return;
		}
		showInfo('');
	};
	// could try on end, send the message via POST

	recognition.onresult = function(event) { // for each set of results, it calls this event handler
		var interim_transcript = '';
		for (var i = event.resultIndex; i < event.results.length; ++i) { //appends any new final text
		  if (event.results[i].isFinal) {
		    final_transcript += event.results[i][0].transcript;
		  } else {
		    interim_transcript += event.results[i][0].transcript;
		  }
		}
		final_transcript = capitalize(final_transcript);
		final_span.innerHTML = linebreak(final_transcript); //results might include \n, so linebreak converts these to HTML tags. Then sets string as innerHTML of span elements
		interim_span.innerHTML = linebreak(interim_transcript);
	};
}

//////// Vue and POST 

window.onload = function () {
	showInfo('info_start');
	start_button.style.display = 'inline-block';
	
	var app = new Vue({  // declaring the Vue class instance
	  delimiters: ['[[', ']]'], // uses square brackets to differentiate the Vue js from Django's curly brackets for defining variables
	  el: '#app', // anything that has id called app will be processed by Vue?
	  data: {
	    messages: [],
	    input: '',
	    send_blank: false,
	    placeholder: 'Send a message...', // this is connection to home.html placeholder
	  },
	  created: function() {
	  	
	  },
	  methods: {
	  	send_message: function() { // add_message allows to process the content when user presses the send button
			if (final_transcript.length > 0) { // checks if there is text present
				var message = {
					'text': final_transcript,
					'user': true,
					'chat_bot': false, // gets the text, and indicates that its from user
				};

				// THIS IS WHERE WE SHOULD SEND THE SPEECH TO TEXT, TEXT AT!!!
				this.messages.push(message); // append to a list of messages that comes from system
				//this.input = ''; //clear input field

				//just incase
				//this.send_blank = false;
				//this.placeholder = "Send a message to the chatbot...";

				fetch("/get-response/", { // fetch response to get json string?
			        body: JSON.stringify({'message': message['text']}), // message that you typed
			        cache: 'no-cache', 
			        credentials: 'same-origin', // indicates that it's not csrf attack?
			        headers: {
				        'user-agent': 'Mozilla/4.0 MDN Example', // specifying that browser should be this
				        'content-type': 'application/json' // specifying this is JSON request
			        },
			        method: 'POST',
			        mode: 'cors', 
			        redirect: 'follow',
			        referrer: 'no-referrer',
			        }) // once fetch request has been completed, it will go to .then requests
			        .then(response => response.json()).then((json) => {
			          	this.messages.push(json['message']) // response fom the chatbot, appends message to messages
			    	})
			} else {
				this.send_blank = true; // if text is blank
				this.placeholder = "Please put in some text";
			}

		},
		add_message: function() { // add_message allows to process the content when user presses the send button
			if (this.input.length > 0) { // checks if there is text present
				var message = {
					'text': this.input,
					'user': true,
					'chat_bot': false, // gets the text, and indicates that its from user
				};

				// THIS IS WHERE WE SHOULD SEND THE SPEECH TO TEXT, TEXT AT!!!
				this.messages.push(message); // append to a list of messages that comes from system
				this.input = ''; //clear input field

				//just incase
				this.send_blank = false;
				this.placeholder = "Send a message to the chatbot...";

				fetch("/get-response/", { // fetch response to get json string?
			        body: JSON.stringify({'message': message['text']}), // message that you typed
			        cache: 'no-cache', 
			        credentials: 'same-origin', // indicates that it's not csrf attack?
			        headers: {
				        'user-agent': 'Mozilla/4.0 MDN Example', // specifying that browser should be this
				        'content-type': 'application/json' // specifying this is JSON request
			        },
			        method: 'POST',
			        mode: 'cors', 
			        redirect: 'follow',
			        referrer: 'no-referrer',
			        }) // once fetch request has been completed, it will go to .then requests
			        .then(response => response.json()).then((json) => {
			          	this.messages.push(json['message']) // response fom the chatbot, appends message to messages
			    	})
			} else {
				this.send_blank = true; // if text is blank
				this.placeholder = "Please put in some text";
			}

		},
		check_content: function() {
			if (this.input.length > 0) {
				this.send_blank = false;
				this.placeholder = "Send a message to the chatbot...";
			} else {
				this.send_blank = true;
				this.placeholder = "Please put in some text";
			}
		},
	  }
	});
};

	