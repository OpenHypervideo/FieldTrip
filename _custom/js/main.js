var previousLayer,
	currentLayer = undefined,
	activeVideoID = undefined,
	introTimeout;

$(document).ready(function() {

	// Check Setup
	if (!!document.location.host) {
		$.ajax({
			"type": "POST",
			url: "_server/ajaxServer.php",
			data: {"a":"setupCheck"},
			dataType: "json",
			success: function(ret) {
				if (ret["code"] != "1") {
					var setupUrl = window.location.href.replace('index.html', '') + 'setup.html';
					window.location.replace(setupUrl);
				}
			}
		});
	}

	window.FieldTrip = FrameTrail.init('PlayerLauncher', {

		target:             '#VideoPlayer',
		contentTargets:     {},
		contents:           {
								hypervideo: '',
								annotationsIndex: '',
								annotations: [],
								resources: [],
								users: ''
							},

		loggedIn:           false,
		username:           '',
		viewMode:           'video',
		editMode:           false,
		slidePosition:      'middle',
		sidebarOpen:        false,
		fullscreen:         false,
		viewSize:           [0,0],
		unsavedChanges:     false

	});

	FieldTrip.on('ready', function() {
		if (FieldTrip.play) {
			$('.hypervideo .video').css('transition-duration', '0ms').addClass('nocolor');
			FieldTrip.play();
		}
	});

	FieldTrip.on('play', function() {
		window.setTimeout(function() {
			$('.hypervideo .video').css('transition-duration', '').removeClass('nocolor');
		}, 600);
	});

	FieldTrip.on('ended', function() {
		window.history.pushState({}, '', '#overview');
		activateLayer('overview');
	});

	initEventListeners();

	//$('.ftLoadingIndicator').removeClass('active').fadeOut(1000);
	//activateLayer('Overview');

	window.history.replaceState({}, '', '#');

	//$('#ftIntroVideo').load();

	$('#ftIntroVideo').on('loadedmetadata', function() {
		$('#ftIntroVideo')[0].play();
		$('#ftIntroVideo')[0].pause();
		$('#ftIntroVideo')[0].currentTime = 0;
	});

	$('#ftIntroVideo').one('canplay', function() {

		$('#ftStartButton').show().click(function() {

			$(this).hide();

			startFullscreen();

			// Fake Loading Routine
			window.setTimeout(function() {
				
				$('.ftLoadingIndicator').removeClass('active').fadeOut(1000);
				
				window.history.replaceState({}, '', '#intro');
				activateLayer('intro');

			}, 5000);

		});

	});

	$('#ftIntroVideo').on('ended', function() {
		window.history.pushState({}, '', '#overview');
		activateLayer('overview');
	});

	$.getScript("https://cdnjs.cloudflare.com/ajax/libs/jquery.simpleWeather/3.1.0/jquery.simpleWeather.min.js").then( function() {
		
		$.simpleWeather({
			location: 'Berlin, DE',
			woeid: '20065632',
			unit: 'c',
			success: function(weather) {
				console.log(weather);
				$('#ftWeatherTemperature').text(weather.temp + ' °C');
				
			},
			error: function(error) {
				
			}
		});
	  
	});

	updateTime();
	window.setInterval(function() {
		updateTime();
	}, 3000);

}); // End Document Ready

$(window).resize(function() {
	rescaleMapCanvas();
});

function initEventListeners() {

	// Hash Change Listener
	$(window).on('popstate', function() {
		var hash = location.hash.split('#')[1].split('=')[0];
		if (hash) {
			activateLayer(hash);
		}
	});

	// Map Pins
	$('.ftMapPin').click(function(evt) {
		$('#fthypervideo #VideoPlayer').addClass('active');
	});

	// Navigation
	$('.ftNavUp').click(interfaceUp);
	$('.ftNavDown').click(interfaceDown);

	// Key Listeners
	$(document).keydown(function(evt){

		switch (evt.keyCode) {
			case 38:
				interfaceUp();
				break;
			case 40:
				interfaceDown();
				break;
			case 37:
				interfaceLeft();
				break;
			case 39:
				interfaceRight();
				break;
			default:
				// default
		}

	});

}

function activateLayer(layerName) {

	previousLayer = (currentLayer) ? currentLayer : false;
	currentLayer = layerName;
	
	$('.ftLayer').removeClass('active');
	
	switch (layerName) {
		case 'intro':
			// Intro
			introTimeout = window.setTimeout(function() {
				$('#ftIntroVideo')[0].currentTime = 0;
				$('#ftIntroVideo')[0].play();
			}, 2000);
			
			$('.ftLayer#ftoverview').addClass('zoomOut');
			$('.ftLayer#fthypervideo').addClass('zoomOut');
			break;
		case 'overview':
			// Overview
			$('#ftIntroVideo')[0].pause();
			window.clearTimeout(introTimeout);

			$('.ftLayer#ftintro').fadeOut(1000);
			$('.ftLayer#ftoverview').removeClass('zoomOut');
			$('.ftLayer#fthypervideo').addClass('zoomOut');
			break;
		case 'hypervideo':
			// Video
			$('#ftIntroVideo')[0].pause();
			window.clearTimeout(introTimeout);
			
			$('.ftLayer#ftintro').fadeOut(1000);
			$('.ftLayer#ftoverview').fadeOut(1000);
			$('.ftLayer#ftoverview').removeClass('zoomOut');
			$('.ftLayer#fthypervideo').removeClass('zoomOut');

			// TODO: Replace with parsed Video ID
			activeVideoID = 1;

			break;
		default:
			// Default
			break;
	}

	$('.ftLayer#ft'+ layerName).addClass('active').fadeIn(1000);
	rescaleMapCanvas();
	updateButtonStates();

}

function interfaceDown() {
	if (currentLayer == 'intro') {
		window.history.replaceState({}, '', '#overview');
		activateLayer('overview');
	} else if (currentLayer == 'overview' && activeVideoID) {
		window.history.replaceState({}, '', '#hypervideo');
		activateLayer('hypervideo');
	}
}

function interfaceUp() {
	if (currentLayer == 'hypervideo') {
		window.history.replaceState({}, '', '#overview');
		activateLayer('overview');
	} else if (currentLayer == 'overview') {
		window.history.replaceState({}, '', '#intro');
		activateLayer('intro');
	}
}

function interfaceLeft() {
	// left key pressed
}

function interfaceRight() {
	// right key pressed
}

function updateButtonStates() {
	$('.ftNavIconContainer').removeClass('inactive');

	if (currentLayer == 'hypervideo') {
		$('.ftNavIconContainer.ftNavDown').addClass('inactive');
	} else if (currentLayer == 'overview' && !activeVideoID) {
		$('.ftNavIconContainer.ftNavDown').addClass('inactive');
	} else if (currentLayer == 'intro') {
		$('.ftNavIconContainer.ftNavUp').addClass('inactive');
	}
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

function updateTime() {
	var d = new Date(),
		utc = d.getTime() + (d.getTimezoneOffset() * 60000),
		newDate = new Date(utc + (3600000*1)).toLocaleString('de-DE', {
			hour: '2-digit',
			minute: '2-digit'
		});
	$('#ftWeatherTime').text(newDate);
}