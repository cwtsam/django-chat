window.onload = function () {
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
		add_message: function() { // add_message allows to process the content when user presses the send button
			if (this.input.length > 0) { // checks if there is text present
				var message = {
					'text': this.input,
					'user': true,
					'chat_bot': false, // gets the text, and indicates that its from user
				};

				// THIS IS WHERE WE SHOULD SEND THE SPEECH TO TEXT, TEXT AT!!!
				this.messages.push(message); // append to a list of messages that comes from system
				this.input = '';

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

	