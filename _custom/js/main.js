
/* Bg Image Size*/
var image = { width: 2500, height: 1700 };

/* Pointers */
var target = new Array();
target[0] = { x: 184, y: 88 };
target[1] = { x: 284, y: 10 };
target[2] = { x: 384, y: 188 };

var pointer = new Array();
pointer[0] = $('#pointer1');
pointer[1] = $('#pointer2');
pointer[2] = $('#pointer3');

$(document).ready(updatePointer);
$(window).resize(updatePointer);

function updatePointer() {
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    
    // Get largest dimension increase
    var xScale = windowWidth / image.width;
    var yScale = windowHeight / image.height;
    var scale;
    var yOffset = 0;
    var xOffset = 0;
    
    if (xScale > yScale) {
        scale = xScale;
        yOffset = (windowHeight - (image.height * scale)) / 2;
    } else {
        scale = yScale;
        xOffset = (windowWidth - (image.width * scale)) / 2;
    }
    
    var arrayLength = target.length;

    for (var i = 0; i < arrayLength; i++) {
        pointer[i].css('top', (target[i].y) * scale + yOffset);
        pointer[i].css('left', (target[i].x) * scale + xOffset);
    }
}

// end map pointers

var previousLayer,
	introTimeout;

$(document).ready(function() {

	initEventListeners();

	//$('#ftIntroVideo').load();

	$('#ftIntroVideo').on('loadedmetadata', function() {
		$('#ftIntroVideo')[0].pause();
		$('#ftIntroVideo')[0].currentTime = 0;
	});

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

} // End Document Ready