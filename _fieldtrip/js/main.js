var previousLayer,
	introTimeout;

$(document).ready(function() {

	initEventListeners();

	$('#ftIntroVideo').one('canplaythrough', function() {

		$('#ftStartButton').show().click(function() {

			$(this).hide();

			startFullscreen();

			// Fake Loading Routine
			window.setTimeout(function() {
				
				$('.ftLoadingIndicator').removeClass('active').fadeOut(1000);
				window.history.replaceState({}, '', '#Intro');
				activateLayer('Intro');

			}, 3000);

		});

	});

	$('#ftIntroVideo').on('ended', function() {
		window.history.pushState({}, '', '#Overview');
		activateLayer('Overview');
	});

});

function initEventListeners() {

	// Hash Change Listener
	$(window).on('popstate', function() {
		activateLayer(location.hash.split('#')[1]);
	});

	// Map Pins
	$('.ftMapPin').click(function() {

	});

}

function activateLayer(layerName) {

	previousLayer = layerName;
	
	$('.ftLayer').removeClass('active');
	
	switch (layerName) {
		case 'Intro':
			// Intro
			introTimeout = window.setTimeout(function() {
				$('#ftIntroVideo')[0].currentTime = 0;
				$('#ftIntroVideo')[0].play();
			}, 1000);
			
			$('.ftLayer#ftOverview').addClass('zoomOut');
			$('.ftLayer#ftVideo').addClass('zoomOut');
			break;
		case 'Overview':
			// Overview
			$('#ftIntroVideo')[0].pause();
			window.clearTimeout(introTimeout);

			$('.ftLayer#ftIntro').fadeOut(1000);
			$('.ftLayer#ftOverview').removeClass('zoomOut');
			$('.ftLayer#ftVideo').addClass('zoomOut');
			break;
		case 'Video':
			// Video
			$('#ftIntroVideo')[0].pause();
			window.clearTimeout(introTimeout);
			
			$('.ftLayer#ftIntro').fadeOut(1000);
			$('.ftLayer#ftOverview').fadeOut(1000);
			$('.ftLayer#ftOverview').removeClass('zoomOut');
			$('.ftLayer#ftVideo').removeClass('zoomOut');
			break;
		default:
			// Default
			break;
	}

	$('.ftLayer#ft'+ layerName).addClass('active').fadeIn(1000);

}

function startFullscreen() {

	var element = $('body')[0];

	if (element.requestFullScreen) {
        if (!document.fullScreen) {
            element.requestFullscreen();
        } else {
            //document.exitFullScreen();
        }
    } else if (element.mozRequestFullScreen) {
        if (!document.mozFullScreen) {
            element.mozRequestFullScreen();
        } else {
            //document.mozCancelFullScreen();
        }
    } else if (element.webkitRequestFullScreen) {
        if (!document.webkitIsFullScreen) {
            element.webkitRequestFullScreen();
        } else {
            //document.webkitCancelFullScreen();
        }
    }

}