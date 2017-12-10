var previousLayer,
	introTimeout;

$(document).ready(function() {

	initEventListeners();

	//$('.ftLoadingIndicator').removeClass('active').fadeOut(1000);
	//activateLayer('Overview');

	
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

}); // End Document Ready

$(window).resize(function() {
	rescaleMapCanvas();
});

function initEventListeners() {

	// Hash Change Listener
	$(window).on('popstate', function() {
		activateLayer(location.hash.split('#')[1].split('/')[0]);
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
	rescaleMapCanvas();

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

function getScaleOffsets(containerElement, targetImage) {

	var containerWidth = containerElement.width(),
		containerHeight = containerElement.height(),
		imageWidth = targetImage.width(),
		imageHeight = targetImage.height(),
		imageNaturalWidth = targetImage[0].naturalWidth,
		imageNaturalHeight = targetImage[0].naturalHeight,
		aspectRatio = imageNaturalWidth / imageNaturalHeight;
    
    var xScale = containerWidth / imageNaturalWidth,
    	yScale = containerHeight / imageNaturalHeight;

    var	actualImageWidth,
		actualImageHeight;
    
    if (xScale > yScale) {
        actualImageWidth = containerWidth;
        actualImageHeight = containerWidth / aspectRatio;
    } else {
        actualImageWidth = containerHeight * aspectRatio;
        actualImageHeight = containerHeight;
    }

    //console.log(containerWidth, imageWidth, actualImageWidth);
    //console.log(containerHeight, imageHeight, actualImageHeight);

    var actualScaleX = actualImageWidth / containerWidth,
		actualScaleY = actualImageHeight / containerHeight,
		actualOffsetX = (containerWidth - actualImageWidth) / 2,
		actualOffsetY = (containerHeight - actualImageHeight) / 2;

	var scaleOffsets = {
		scaleX: actualScaleX,
		scaleY: actualScaleY,
		offsetX: actualOffsetX,
		offsetY: actualOffsetY,
	}

	return scaleOffsets;
	
}

function rescaleMapCanvas() {
	var scaleOffsets = getScaleOffsets($(window), $('#ftMapBackground')),
		newElementWidth = $(window).width() * scaleOffsets.scaleX,
		newElementHeight = $(window).height() * scaleOffsets.scaleY,
		topOffset = scaleOffsets.offsetY,
		leftOffset = scaleOffsets.offsetX;

	$('#ftMapCanvas').css({
		top: topOffset + 'px',
		left: leftOffset + 'px',
		width: newElementWidth + 'px',
		height: newElementHeight + 'px',
	});
}