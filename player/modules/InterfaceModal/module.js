/**
 * @module Player
 */


/**
 * I am the InterfaceModal module.
 *
 * I provide the most basic UI:
 * * display status messages
 * * display loading indicators
 * * display user dialogs
 *
 * @class InterfaceModal
 * @static
 */


FrameTrail.defineModule('InterfaceModal', function(){


	var loadingScreen = $('<div id="loadingScreen">'
						+ '    <div id="LoadingTitle"></div>'
						+ '    <div class="workingSpinner"></div>'
						+ '</div>'),
		statusMessage = $('<div id="statusMessage" class="message"></div>');

	$('body').append(loadingScreen);
   	$('body').append(statusMessage);



	/**
	 * I show a status message.
	 * @method showStatusMessage
	 * @param {String} msg
	 */
	function showStatusMessage(msg){
		statusMessage.text(msg).addClass('active').removeClass('error success');
	}

	/**
	 * I show a error message.
	 * @method showErrorMessage
	 * @param {String} msg
	 */
	function showErrorMessage(msg){
		statusMessage.text(msg).addClass('active error').removeClass('success');
	}

	/**
	 * I show a success message.
	 * @method showSuccessMessage
	 * @param {String} msg
	 */
	function showSuccessMessage(msg){
		statusMessage.text(msg).addClass('active success').removeClass('error');
	}


	/**
	 * I hide all messages. I do this immediatly, unless a delay is set, in which case I remove the messages after the delay in milliseconds.
	 * @method hideMessage
	 * @param {Number} delay (optional)
	 */
	function hideMessage(delay){

		if (typeof delay === 'number') {

			window.setTimeout(function() {
				statusMessage.text('').removeClass('active');
			}, delay);

		} else {

			statusMessage.text('').removeClass('active');

		}

	}

	/**
	 * I show the loading screen.
	 * @method showLoadingScreen
	 */
	function showLoadingScreen() {

		loadingScreen.fadeIn(300, 'swing', function() {
			$(this).addClass('active');
		});

	}

	/**
	 * I hide the loading screen.
	 * @method hideLoadingScreen
	 */
	function hideLoadingScreen() {

		loadingScreen.delay( 1300 ).animate({
			top: - 100 + '%',
			backgroundColor: 'rgba(47, 50, 58,0)'
		}, 400, function() {
			$(this).hide().removeClass('active').css({
				top: '',
				backgroundColor: ''
			});
		}).children('#LoadingTitle').delay( 1000 ).animate({
			top: 20 + 'px',
			fontSize: 10 + 'px'
		}, 600, function() {
			$(this).css({
				top: '',
				fontSize: ''
			});
		});

	}

	/**
	 * I set the loading screen title to either the hypervideo name or the project name.
	 * @method setLoadingTitle
	 * @param {String} title
	 */
	function setLoadingTitle(title) {

		loadingScreen.children('#LoadingTitle').text(title);

	}

   	return {

   		showStatusMessage: showStatusMessage,
   		showErrorMessage: showErrorMessage,
   		showSuccessMessage: showSuccessMessage,
   		hideMessage: hideMessage,
   		showLoadingScreen: showLoadingScreen,
   		hideLoadingScreen: hideLoadingScreen,
   		setLoadingTitle: setLoadingTitle

   	};

});