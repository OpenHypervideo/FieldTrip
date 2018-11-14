/* Custom cursor */

document.addEventListener("DOMContentLoaded", function(event) {
  var cursor = document.querySelector(".custom-cursor");
  var links = document.querySelectorAll(".ftEvent");
  var initCursor = true;

  for (var i = 0; i < links.length; i++) {
    var selfLink = links[i];

    selfLink.addEventListener("mouseover", function() {
      cursor.classList.add("custom-cursor-outline");
    });
    selfLink.addEventListener("mouseout", function() {
      cursor.classList.remove("custom-cursor-outline");
    });
  }

   window.onmousemove = function(e) {
    var mouseX = e.clientX;
    var mouseY = e.clientY;

   if (!initCursor) {
      cursor.style.opacity = 1;
      initCursor = true;
    }

    TweenLite.to(cursor, 0, {
      top: mouseY + "px",
      left: mouseX + "px"
    });
  };

});

/* End custom cursor */

var previousLayer,
	currentLayer = undefined,
	activeVideoID = undefined,
	introTimeout,
	episodeTimings = {},
	timeInterval = null,
	muted = false;

/* Transitions / Links */

//var pointerSeconds = [2.25, 4.6, 7, 8.3];

var videoLinks = {
	'9': {
		'duration': 341.48,
		'links': [
			{
				'time': 240.7,
				'target': '#hypervideo=6&t=18',
			}
		]
	},
	'11': {
		'duration': 349.84,
		'links': [
			{
				'time': 330.96,
				'target': '#hypervideo=9&t=245',
			}
		]
	}
}

/* Document Ready */

$(document).ready(function() {
	
	renderVideoLinkCircles();

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

	window.FieldTrip = FrameTrail.init({
		target:             '#VideoPlayer',
		contentTargets:     {},
		contents:           null,
        startID:            null,
        resources:          [{
            label: "Choose Resources",
            data: "_data/resources/_index.json",
            type: "frametrail"
        }],
        tagdefinitions:      null,
        config:              null
	});

	
	FieldTrip.on('timeupdate', function() {
		updatePlayCircle();
	});

	FieldTrip.on('ready', function() {
				
		initPlayCircle();
		initTransitions('.mainContainer');
		/*
		if (FieldTrip.play && previousLayer) {
			FieldTrip.play();
		}
		*/
		$('.hypervideo .video').prop('volume', 0);
		
		if (FieldTrip.play && previousLayer) {
			window.setTimeout(function() {
				$(window).resize();
				window.setTimeout(function() {
					$(window).resize();
					window.transitionLoading.addEventListener('loopComplete', function() {
						transitionLoading.stop();
						audioLoading.pause();
						audioLoading.currentTime = 0;
						playTransitionOut();
						window.transitionLoading.removeEventListener('loopComplete');
					});
				}, 800);
			}, 1600);
		}

	});
  	
	FieldTrip.on('play', function() {
		$('#playCircleContainer').addClass('playing');
	});

	FieldTrip.on('pause', function() {
		$('#playCircleContainer').removeClass('playing');
	});

	FieldTrip.on('ended', function() {
		FieldTrip.play();
		/*
		window.history.pushState({}, '', '#overview');
		activateLayer('overview');
		*/
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

	window.setTimeout(function() {

		$('#ftStartButton').show().click(function() {

			$(this).hide();

			toggleNativeFullscreen();

			// Fake Loading Routine
			window.setTimeout(function() {
				
				$('.ftLoadingIndicator').removeClass('active').fadeOut(1000);
				
				window.history.replaceState({}, '', '#intro');
				activateLayer('intro');

			}, 1000);

		});

	}, 2000);

	$('#ftIntroVideo').on('ended', function() {
		updateEpisodeTimings();

		window.history.pushState({}, '', '#overview');
		activateLayer('overview');
	});

	$.getScript("https://cdnjs.cloudflare.com/ajax/libs/jquery.simpleWeather/3.1.0/jquery.simpleWeather.min.js").then( function() {
		
		$.simpleWeather({
			location: 'Berlin, DE',
			woeid: '20065632',
			unit: 'c',
			success: function(weather) {
				//console.log(weather);
				$('#ftWeatherTemperature').text(weather.temp + '°C'),
				$('#ftWeatherIcon').html('<i class="weathericon-'+weather.code+'"></i>');	
			},
			error: function(error) {
				
			}
		});
	  
	});

	updateTime();

	episodeTimings = JSON.parse(localStorage.getItem('fieldtrip-episode-timings'));

	if (!episodeTimings || Object.keys(episodeTimings).length == 0) {
		episodeTimings = {};

		$('.ftMapPinDescription').each(function() {
			
			var thisID = $(this).attr('href').split('hypervideo=')[1].split('&')[0];

			episodeTimings[thisID] = {
				'lastTime': 0,
				'duration': null
			};

		});
	}
	updateEpisodeTimings();

	FieldTrip.on('pause', function(evt) {
		updateEpisodeTimings();
	});
	
}); // End Document Ready

/* End Info Smoothscroll */

$(window).resize(function() {
	rescaleMapCanvas();
});

function initEventListeners() {

	// Hash Change Listener
	$(window).on('popstate', function() {
		var hash = location.hash.split('#')[1].split('=');
		if (hash[1]) {
			activateLayer(hash[0], hash[1].split('&')[0]);
		} else if (hash) {
			activateLayer(hash[0]);
		}
	});

	// Edit Button
	$('.ftEdit').click(function() {
		if ($('#VideoPlayer').hasClass('editActive')) {
			FieldTrip.stopEditing();
			$('.ftNavAbout, .ftNavShare').show();
		} else {
			FieldTrip.startEditing();
			$('.ftNavAbout, .ftNavShare').hide();
		}
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

	/* Info: open/close */
	
	$('.ftNavAbout').click(function() {
	    $('#fthyperInfo').toggleClass('is-open');
	});   
	
	$('#ftCloseInfo').click(function() {
	    $('#fthyperInfo').removeClass('is-open');
	}); 
	
	/* Social Network */
	
	$('.ftSocialTrigger').click(function() {
	    $('.ftSocialNav').toggleClass('is-open');
	});
  
  /* Info: Go to Sections */
  
  $('#ueber-uns-link').click(function() {
      document.getElementById('ueber-uns').scrollIntoView(true);
  }); 

  $('#team-link').click(function() {
    document.getElementById('team').scrollIntoView(true);
  }); 
  
  $('#abspann-link').click(function() {
    document.getElementById('abspann').scrollIntoView(true);
  }); 
  
  $('#resourcen-link').click(function() {
    document.getElementById('resourcen').scrollIntoView(true);
  }); 
  
  $('#impressum-link').click(function() {
    document.getElementById('impressum').scrollIntoView(true);
  }); 
  
  $('#datenschutz-link').click(function() {
    document.getElementById('datenschutz').scrollIntoView(true);
  }); 
  
	/* Toogle Mute */

	$('.ftSound').click(function() {
		if (muted) {
			soundOn();
			muted = false;
		} else {
			soundOff();
			muted = true;
		}
	});
	
	/* Switch Button / Night Mode */
	
	var currentHours = new Date().getHours();  
	if (currentHours >= 17) {
		$('#ftSwitchCheckbox input:checkbox').prop('checked', true);
		$('body').addClass("night");
	}

	$('#ftSwitchCheckbox input:checkbox').change(function(){
	    if ($(this).is(':checked')) {
	        $('body').addClass("night");
	    }
	    else {
	        $('body').removeClass("night");
	    }
	});

	/* Thumbnails appears on click*/

	//hide = true;
	$('#ftoverview').on("click", function (evt) {
	    
	    if ($(evt.target).attr('id') == 'ftMapContainer' || $(evt.target).attr('id') == 'ftMap') {
	    	$('.ftMapPinDescription').removeClass('is-visible');
	    }
	    //hide = true;
	});

	$('.ftMapPin').click(function(evt){
	  	
	  	if ($(evt.target).parent().hasClass('ftMapPin')) {
	  		resetEpisodeCircles();
	  	}

		$('#fthypervideo #VideoPlayer').addClass('active');

		var description = $(this).find('.ftMapPinDescription');
		var circle = $(this).find('.circle');
		var player = $(this).find('.ftMapPinDescriptionContent')
		description.addClass('is-visible');
	  	//hide = false;

		setTimeout(function(){
			circle.addClass('outer');
			updateEpisodeCircles();
		}, 500); 
		setTimeout(function(){
			player.addClass('is-visible');
		}, 1000); 

	  $(".ftMapPinDescription").not($(this).find(".ftMapPinDescription")).removeClass('is-visible');
		$(".circle").not($(this).find(".circle")).removeClass('outer');
		$(".ftMapPinDescriptionContent").not($(this).find(".ftMapPinDescriptionContent")).removeClass('is-visible');
	});

	/* Fullscreen Button */

	$('.ftScreen').click(function() {
		toggleNativeFullscreen();
	});
  
	document.addEventListener("fullscreenchange", toggleFullscreen, false);
  document.addEventListener("webkitfullscreenchange", toggleFullscreen, false);
	document.addEventListener("mozfullscreenchange", toggleFullscreen, false);

}

function activateLayer(layerName, videoID) {

	if (layerName == 'ueber-uns' || layerName == 'team' || layerName == 'abspann' || layerName == 'resourcen' || layerName == 'impressum' || layerName == 'datenschutz') {
		$('.ftInfoLink').removeClass('is-active');
		$('.ftInfoLink[href="#'+layerName+'"]').addClass('is-active');
		return;
	}

	updateTime();

	previousLayer = (currentLayer) ? currentLayer : false;
	currentLayer = layerName;
	
	$('.ftLayer').removeClass('active');
	
	switch (layerName) {
		case 'intro':
			// Intro
			if (FieldTrip.pause) {
				$('.hypervideo .video').stop(true, false).animate({
					volume: 0
				}, 1000, function() {
					FieldTrip.pause();
				});
			}
			introTimeout = window.setTimeout(function() {
				$('#ftIntroVideo')[0].currentTime = 0;
				$('#ftIntroVideo')[0].play();
			}, 2000);

			$('#audioAtmoDay').stop(true, false).animate({
				volume: 0
			}, 4000, function() {
				$('#audioAtmoDay')[0].pause();
			});
			
			$('.ftLayer#ftoverview').addClass('zoomOut');
			$('.ftLayer#fthypervideo').addClass('zoomOut');
			break;
		case 'overview':
			// Overview
			if (FieldTrip.pause) {
				$('.hypervideo .video').stop(true, false).animate({
					volume: 0
				}, 1000, function() {
					FieldTrip.pause();
				});
			}
			$('#ftIntroVideo')[0].pause();
			window.clearTimeout(introTimeout);

			$('#audioAtmoDay')[0].play();
			$('#audioAtmoDay').stop(true, false).animate({
				volume: 1
			}, 7000);


			$('.ftLayer#ftintro').fadeOut(1000);
			$('.ftLayer#ftoverview').removeClass('zoomOut');
			$('.ftLayer#fthypervideo').addClass('zoomOut');
			break;
		case 'hypervideo':
			// Video
			
			$('.hypervideo .video').prop('volume', 0);
			initTransitions('.mainContainer');
			updateMuted();
			renderPlayCircleLinks();

			$('#audioAtmoDay').stop(true, false).animate({
				volume: 0
			}, 4000, function() {
				$('#audioAtmoDay')[0].pause();
			});
			
			//console.log(activeVideoID, videoID);
			if (!activeVideoID) {
				playTransitionLoading();
				window.setTimeout(function() {
					$(window).resize();
					window.setTimeout(function() {
						$(window).resize();
						window.transitionLoading.addEventListener('loopComplete', function() {
							transitionLoading.stop();
							audioLoading.pause();
							audioLoading.currentTime = 0;
							playTransitionOut();
							window.transitionLoading.removeEventListener('loopComplete');
						});
					}, 800);
				}, 1600);
			} else if (activeVideoID != videoID) {
				playTransitionLoading();
			} else {
				window.setTimeout(function() {
					$(window).resize();
					window.setTimeout(function() {
						$(window).resize();
						updateMuted();
						renderPlayCircleLinks();
						FieldTrip.play();
						$('.hypervideo .video').stop(true, false).animate({
							volume: 1
						}, 2000);
					}, 800);
				}, 1600);
			}
			
			$('#ftIntroVideo')[0].pause();
			window.clearTimeout(introTimeout);
			
			$('.ftLayer#ftintro').fadeOut(1000);
			$('.ftLayer#ftoverview').fadeOut(1000);
			$('.ftLayer#ftoverview').removeClass('zoomOut');
			$('.ftLayer#fthypervideo').removeClass('zoomOut');

			// TODO: Replace with parsed Video ID
			$('.ftMapPin .ftMapPinDescription').removeClass('is-visible');
			$('.ftMapPin .ftMapPinDescription[href^="#hypervideo='+ videoID +'"]').addClass('is-visible');
			$('.ftMapPin .ftMapPinDescription[href^="#hypervideo='+ videoID +'"] .circle').addClass('outer');
			$('.ftMapPin .ftMapPinDescription[href^="#hypervideo='+ videoID +'"] .ftMapPinDescriptionContent').addClass('is-visible');
			
			activeVideoID = videoID;

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
		window.history.replaceState({}, '', '#hypervideo='+ activeVideoID);
		activateLayer('hypervideo', activeVideoID);
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
	if (currentLayer != 'hypervideo') { return; }

	$(document).trigger('mousemove');
	
	var previousTimeStep = 0;
	var hypervideoID = location.href.split('#hypervideo=')[1].split('&')[0];

	if (videoLinks[hypervideoID]) {
		videoLinks[hypervideoID]['links'].forEach(function(videoLink){
			if (videoLink.time <= FieldTrip.currentTime) {
				previousTimeStep = videoLink.time - 3;
			}
		});
	}

	FieldTrip.currentTime = previousTimeStep;
}

function interfaceRight() {
	// right key pressed
	if (currentLayer != 'hypervideo') { return; }

	$(document).trigger('mousemove');

	var nextTimeStep = FieldTrip.duration - 3;
	var hypervideoID = location.href.split('#hypervideo=')[1].split('&')[0];

	if (videoLinks[hypervideoID]) {
		videoLinks[hypervideoID]['links'].forEach(function(videoLink){
			if (videoLink.time >= FieldTrip.currentTime) {
				nextTimeStep = videoLink.time - 3;
				FieldTrip.currentTime = nextTimeStep;
				return;
			}
		});
	}

	FieldTrip.currentTime = nextTimeStep;
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

function toggleNativeFullscreen() {

	var element = $('body')[0];

	if (element.requestFullScreen) {
		if (!document.fullScreen) {
			element.requestFullscreen();
		} else {
			document.exitFullScreen();
		}
	} else if (element.mozRequestFullScreen) {
		if (!document.mozFullScreen) {
			element.mozRequestFullScreen();
		} else {
			document.mozCancelFullScreen();
		}
	} else if (element.webkitRequestFullScreen) {
		if (!document.webkitIsFullScreen) {
			element.webkitRequestFullScreen();
		} else {
			document.webkitCancelFullScreen();
		}
	}

}

function toggleFullscreen() {

	var element = $('body')[0];

	if (element.requestFullScreen) {
		if (document.fullScreen) {
			$('.ftScreen').removeClass('ftScreenEnlarge').addClass('ftScreenReduce');
			$('.ftScreen > i').removeClass('fticon-enlarge').addClass('fticon-reduce');
		} else {
			$('.ftScreen').removeClass('ftScreenReduce').addClass('ftScreenEnlarge');
			$('.ftScreen > i').removeClass('fticon-reduce').addClass('fticon-enlarge');
		}
	} else if (element.mozRequestFullScreen) {
		if (document.mozFullScreen) {
			$('.ftScreen').removeClass('ftScreenEnlarge').addClass('ftScreenReduce');
			$('.ftScreen > i').removeClass('fticon-enlarge').addClass('fticon-reduce');
		} else {
			$('.ftScreen').removeClass('ftScreenReduce').addClass('ftScreenEnlarge');
			$('.ftScreen > i').removeClass('fticon-reduce').addClass('fticon-enlarge');
		}
	} else if (element.webkitRequestFullScreen) {
		if (document.webkitIsFullScreen) {
			$('.ftScreen').removeClass('ftScreenEnlarge').addClass('ftScreenReduce');
			$('.ftScreen > i').removeClass('fticon-enlarge').addClass('fticon-reduce');
		} else {
			$('.ftScreen').removeClass('ftScreenReduce').addClass('ftScreenEnlarge');
			$('.ftScreen > i').removeClass('fticon-reduce').addClass('fticon-enlarge');
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
	if (!timeInterval) {
		var daylightSavingsOffset = (isDST(new Date()) ? 2 : 1),
		d = new Date(),
		utc = d.getTime() + (d.getTimezoneOffset() * 60000),
		newDate = new Date(utc + (3600000*daylightSavingsOffset)).toLocaleString('de-DE', {
			hour: '2-digit',
			minute: '2-digit'
		});
		$('#ftWeatherTime').text(newDate);

		//console.log('UPDATING TIME');

		timeInterval = window.setInterval(function() {
			updateTime();
		}, 3000);
	} else {
		window.clearInterval(timeInterval);
		timeInterval = null;
		updateTime();
	}
}

 function isDST(t) {
    var jan = new Date(t.getFullYear(),0,1);
    var jul = new Date(t.getFullYear(),6,1);
    return Math.min(jan.getTimezoneOffset(),jul.getTimezoneOffset()) == t.getTimezoneOffset();  
}

function updateEpisodeTimings() {
	
	if (activeVideoID) {
		episodeTimings[activeVideoID] = {
			'lastTime': FieldTrip.currentTime,
			'duration': FieldTrip.duration
		}
	}

	localStorage.setItem('fieldtrip-episode-timings', JSON.stringify(episodeTimings));

	//console.log(episodeTimings);

	updateEpisodeCircles();
	
}

function resetEpisodeCircles() {
	$('.ftMapPinDescription svg > circle').css('transition-duration', '0ms');
	
	var circleLength = Math.PI * (2 * parseInt($('.ftMapPinDescription svg > circle').eq(0).attr('r')));

	$('.ftMapPinDescription svg > circle').css({
		strokeDasharray: - circleLength,
		strokeDashoffset: - circleLength
	});
	$('.ftMapPinDescription svg > circle').css('transition-duration', '');
}

function updateEpisodeCircles() {
	$.each(episodeTimings, function(key, value) {
		
		var mapElement = $('.ftMapPinDescription[href^="#hypervideo='+ key +'&"]');

		if (mapElement.length == 0) {
			return;
		}
		var mapElementCircle = mapElement.find('.chart').find('svg').children('circle');

		mapElement.attr('href', '#hypervideo='+ key +'&t='+ value.lastTime);
		
		var length = Math.PI * 2 * parseInt(mapElementCircle.attr('r'));
		var offset = - length - length * value.lastTime / (value.duration);
		
		mapElementCircle[0].style.strokeDasharray = length;
		mapElementCircle[0].style.strokeDashoffset = offset; 

		//mapElement.find('.chart').find('circle')[0].style.transform = `rotate(${360 * value.lastTime / (value.duration)}deg)`;

		
		var pointerElements = mapElement.find('svg').find('.pointer-group');

		pointerElements.each(function(){
			
			var pointerTime = parseFloat($(this).attr('data-time'));

			if (value.lastTime >= pointerTime) {
				$(this).addClass('active');
			} else {
				$(this).removeClass('active');
			}
		});

    });
}

function initPlayCircle() {

	var playCircleContainer = $('<figure id="playCircleContainer" class="chart ftEvent"></figure>');

	playCircleContainer.click(function() {
		if ($(this).hasClass('playing')) {
			FieldTrip.pause();
		} else {
			FieldTrip.play();
		}
	});

	playCircleContainer.on("mouseover", function() {
      $('.custom-cursor').addClass("custom-cursor-outline");
    });
    playCircleContainer.on("mouseout", function() {
      $('.custom-cursor').removeClass("custom-cursor-outline");
    });

	var ns = 'http://www.w3.org/2000/svg';
	var playCircleSVG = document.createElementNS(ns, 'svg');
	playCircleSVG.setAttribute('width', '180');
	playCircleSVG.setAttribute('height', '180');
	
	var playCircleBG = document.createElementNS(ns, 'circle');
	playCircleBG.classList.add('circle-bg');
	playCircleBG.setAttribute('cx', '90');
	playCircleBG.setAttribute('cy', '90');
	playCircleBG.setAttribute('r', '88');

	var playCircle = document.createElementNS(ns, 'circle');
	playCircle.classList.add('circle');
	playCircle.classList.add('outer');
	playCircle.setAttribute('cx', '90');
	playCircle.setAttribute('cy', '90');
	playCircle.setAttribute('r', '88');

	playCircleSVG.appendChild(playCircleBG);
	playCircleSVG.appendChild(playCircle);
	
	playCircleContainer[0].appendChild(playCircleSVG);

	$('.playerContainer').append(playCircleContainer);

	renderPlayCircleLinks();

}

function updatePlayCircle() {

	var parentSVG = document.querySelector('.playerContainer #playCircleContainer svg');

	if (!parentSVG) {
		return;
	}
	var svgCircle = parentSVG.querySelector('.chart svg > .circle');
		
	var length = Math.PI * 2 * parseInt(svgCircle.getAttribute('r'));
	var offset = - length - length * FieldTrip.currentTime / (FieldTrip.duration);
	
	svgCircle.style.strokeDasharray = length;
	svgCircle.style.strokeDashoffset = offset; 
	
	var pointerElements = parentSVG.querySelectorAll('.pointer-group-player');

	pointerElements.forEach(function(pointerElem){
				
		var pointerTime = parseFloat(pointerElem.getAttribute('data-time'));

		if (FieldTrip.currentTime >= pointerTime) {
			pointerElem.classList.add('active');
		} else {
			pointerElem.classList.remove('active');
		}
	});
}

function renderPlayCircleLinks() {

	if (location.hash.split('#hypervideo=').length <= 1) {
		return;
	}

	var hypervideoID = location.href.split('#hypervideo=')[1].split('&')[0],
		parentSVG = document.querySelector('.playerContainer #playCircleContainer svg');

	if (videoLinks[hypervideoID] && parentSVG) {
		
		var hypervideoDuration = FieldTrip.duration;

		videoLinks[hypervideoID]['links'].forEach(function(videoLink){
      
			var newPointerGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');
			var newPointerCircle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');

			newPointerGroup.classList.add('pointer-group-player');
			newPointerGroup.setAttribute('data-time', videoLink.time);

			newPointerCircle.setAttribute('cx', '88');
			newPointerCircle.setAttribute('cy', '0');
			newPointerCircle.setAttribute('r', '8');
			newPointerCircle.classList.add('linkPointer');

			newPointerGroup.appendChild(newPointerCircle);

			if (!parentSVG.querySelector('.pointer-group-player[data-time="'+ videoLink.time +'"]')) {
				parentSVG.appendChild(newPointerGroup);
			}
			
			newPointerGroup.style.transform = `translate(88px, 88px) rotate(${(360 * parseFloat(videoLink.time) / (hypervideoDuration)) - 90}deg)`; 

		});
		
	}
}

function renderVideoLinkCircles() {

	$('.ftMapPin .ftMapPinDescription').each(function() {
		if ($(this).attr('href').split('#hypervideo=').length > 0) {

			var hypervideoID = $(this).attr('href').split('#hypervideo=')[1].split('&')[0],
				parentSVG = document.querySelectorAll('.ftMapPinDescription[href^="#hypervideo='+ hypervideoID +'"]')[0].querySelector('svg');

			if (videoLinks[hypervideoID]) {
				
				var hypervideoDuration = videoLinks[hypervideoID].duration;

				videoLinks[hypervideoID]['links'].forEach(function(videoLink){
		      
					var newPointerGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');
					var newPointerCircle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');

					newPointerGroup.classList.add('pointer-group');
					newPointerGroup.setAttribute('data-time', videoLink.time);

					newPointerCircle.setAttribute('cx', '143');
					newPointerCircle.setAttribute('cy', '0');
					newPointerCircle.setAttribute('r', '8');
					newPointerCircle.classList.add('linkPointer');

					newPointerGroup.appendChild(newPointerCircle);
					parentSVG.appendChild(newPointerGroup);

					newPointerGroup.style.transform = `translate(143px, 143px) rotate(${(360 * parseFloat(videoLink.time) / (hypervideoDuration)) - 90}deg)`; 

				});
				
			}
		}
	});

}

function soundOn() {
	$('.ftSoundOff').hide();
	$('.ftSoundOn').show();
	$('audio, video').each(function() {
		$(this)[0].muted = false;
	});
}

function soundOff() {
	$('.ftSoundOn').hide();
	$('.ftSoundOff').show();
	$('audio, video').each(function() {
		$(this)[0].muted = true;
	});
}

function updateMuted() {
	if (muted) {
		soundOff();
	} else {
		soundOn();
	}
}