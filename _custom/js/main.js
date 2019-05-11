/* Custom cursor */

var FULLSCREEN_POSSIBLE = !!screenfull;

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

var FieldTripReady = false,
	previousLayer,
	currentLayer = undefined,
	activeVideoID = undefined,
	//introTimeout,
	episodeTimings = {},
	timeInterval = null,
	muted = false,
	firstClickPlay = false,
	mapPinHintsInterval = null;

/* Sunrise / Sunset Hours */

var sunsetHours  = [17,18,19,21,21,22,22,21,20,19,17,17],
	sunriseHours = [8,7,6,6,5,5,5,6,6,7,7,8],
	currentMonth = new Date().getMonth();

var sunsetHour = sunsetHours[currentMonth],
	sunriseHour = sunriseHours[currentMonth];

/* Transitions / Links */

var videoLinks = {
	'1': {
		'duration': 408.596,
		'links': [
			{
				'time': 147,
				'target': '#hypervideo=4&t=0',
			},
			{
				'time': 298,
				'target': '#hypervideo=8&t=0',
			},
			{
				'time': 396,
				'target': '#hypervideo=4&t=0',
			}
		]
	},
	'2': {
		'duration': 393.963,
		'links': [
			{
				'time': 243,
				'target': '#hypervideo=3&t=307',
			},
			{
				'time': 337,
				'target': '#hypervideo=6&t=168',
			}
		]
	},
	'3': {
		'duration': 413.995,
		'links': [
			{
				'time': 89,
				'target': '#hypervideo=5&t=293',
			},
			{
				'time': 129,
				'target': '#hypervideo=1&t=104',
			}
		]
	},
	'4': {
		'duration': 311.083,
		'links': [
			{
				'time': 93,
				'target': '#hypervideo=3&t=191',
			},
			{
				'time': 182,
				'target': '#hypervideo=7&t=211',
			}
		]
	},
	'5': {
		'duration': 422.72,
		'links': [
			{
				'time': 256,
				'target': '#hypervideo=9&t=207',
			},
			{
				'time': 383,
				'target': '#hypervideo=3&t=39',
			}
		]
	},
	'6': {
		'duration': 386.453,
		'links': [
			{
				'time': 280,
				'target': '#hypervideo=1&t=157',
			},
			{
				'time': 374,
				'target': '#hypervideo=7&t=211',
			}
		]
	},
	'7': {
		'duration': 325.035,
		'links': [
			{
				'time': 73,
				'target': '#hypervideo=2&t=256',
			},
			{
				'time': 171,
				'target': '#hypervideo=6&t=0',
			},
			{
				'time': 253,
				'target': '#hypervideo=4&t=103',
			}
		]
	},
	'8': {
		'duration': 355.157,
		'links': [
			{
				'time': 200,
				'target': '#hypervideo=5&t=0',
			},
			{
				'time': 282,
				'target': '#hypervideo=9&t=142',
			},
			{
				'time': 341,
				'target': '#hypervideo=2&t=256',
			}
		]
	},
	'9': {
		'duration': 350.165,
		'links': [
			{
				'time': 71,
				'target': '#hypervideo=8&t=0',
			},
			{
				'time': 130,
				'target': '#hypervideo=3&t=0',
			},
			{
				'time': 307,
				'target': '#hypervideo=6&t=57',
			}
		]
	},

}

// Set the name of the hidden property and the change event for visibility
var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

/* Document Ready */

$(document).ready(function() {

	document.documentElement.className +=
    (("ontouchstart" in document.documentElement) ? ' touch' : ' no-touch');

    document.documentElement.className += 
    ((FULLSCREEN_POSSIBLE) ? ' fullscreen-yes' : ' fullscreen-no');

	renderVideoLinkCircles();

	//updateVisitorsNumber();

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
        tagdefinitions:      {},
        config:              null,
        users: {}
	});

  var bgmapReplaced = false;
  function checkBgImg() {
    var bgmap = $('#ftMapBackground');
    var win = $(window);
    if (bgmap.length && !bgmapReplaced && (win.innerWidth() > 700 || win.innerHeight() > 650)) {
      bgmapReplaced = true;
      bgmap.attr('src', bgmap.attr('src').replace('.jpg', '-desktop.jpg'));
    }
  }
  checkBgImg();
  $(window).on('resize', checkBgImg);

  // $(fsdfsdfsdf).click(function () ...);

	FieldTrip.on('timeupdate', function() {
		updatePlayCircle();
	});

	FieldTrip.on('ready', function() {

		FieldTripReady = true;

    checkBgImg();

		// Make sure play circle & transitions are never initialized twice
		if ($('#VideoPlayer #playCircleContainer').length != 0) {
			return;
		}

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
		//window.history.pushState({}, '', '#overview');
		//activateLayer('overview');
	});

	FieldTrip.on('userAction', function(evt) {
		if (evt.detail.action == 'EditEnd') {
			$('.ftNavAbout, .ftNavShare').show();
		}
	});

	initEventListeners();

	//$('.ftLoadingIndicator').removeClass('active').fadeOut(1000);
	//activateLayer('Overview');

	//window.history.replaceState({}, '', '#');

	//$('#ftIntroVideo').load();

	$('#ftIntroVideo').on('timeupdate', updateStatesOfIntroCaptions);

	var introVideoElem = document.getElementById('ftIntroVideo'),
		introVideoSource = 'https://secure.brightcove.com/services/mobile/streaming/index/master.m3u8?videoId=6035479757001&pubId=64007844001&secure=true';

	if (!FULLSCREEN_POSSIBLE) {
		introVideoElem.removeAttribute('playsinline');
		introVideoElem.removeAttribute('webkit-playsinline');
	}
		
	if(Hls.isSupported()) {
		var hls = new Hls();
		hls.loadSource(introVideoSource);
		hls.attachMedia(introVideoElem);
		hls.on(Hls.Events.MANIFEST_PARSED,function() {
			initIntroCaptions();
			$('#ftIntroVideo').load();
			introVideoElem.play();
			introVideoElem.pause();
			introVideoElem.currentTime = 0;
		});
	}
	// hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
	// When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element throught the `src` property.
	// This is using the built-in support of the plain video element, without using hls.js.
	// Note: it would be more normal to wait on the 'canplay' event below however on Safari (where you are most likely to find built-in HLS support) the video.src URL must be on the user-driven
	// white-list before a 'canplay' event will be emitted; the last video event that can be reliably listened-for when the URL is not on the white-list is 'loadedmetadata'.
	else if (introVideoElem.canPlayType('application/vnd.apple.mpegurl')) {
		$(introVideoElem).append('<source src="'+ introVideoSource +'" type="video/mp4">');
		introVideoElem.addEventListener('loadedmetadata',function() {
			initIntroCaptions();
			$('#ftIntroVideo').load();
			introVideoElem.play();
			introVideoElem.pause();
			introVideoElem.currentTime = 0;
		});
	}

	window.setTimeout(function() {

		$('#ftStartButton').click(function() {
      initialLoading = false;
      introVideoPlayed = true;

			$(this).hide();

			$('#ftintro #ftTagline, #ftintro .ftintroLogo').hide();

			toggleNativeFullscreen();

			$('#ftIntroVideo')[0].play();
			$('#ftIntroVideo').on('play', function () {
        $('#ftIntroVideoPoster').hide();
      });

			window.setTimeout(function() {

				window.history.replaceState({}, '', '#intro');
				activateLayer('intro');

			}, 1000);

		});

	}, 2000);

	$('#ftIntroVideo').on('ended', function() {
		updateEpisodeTimings();

		$('#ftSkipIntro').hide();
    $('#ftIntroAudio').hide();

		//if (previousLayer && previousLayer == 'overview') {
			window.history.pushState({}, '', '#overview');
			activateLayer('overview');
		/*
		} else {
			$('#ftoverview').css('opacity', 0);
			var episodes = [1,2,3,4,5,6,7,8,9],
				randomEpisode = episodes[Math.floor(Math.random()*episodes.length)];

			window.location.hash = '#hypervideo='+ randomEpisode;
		}
		*/

	});

	/*
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
	*/
	$.ajax({
        type:   "GET",
        url:    "openweathermap.php",
        cache:  false,
        dataType: "json",
        mimeType: "application/json"
    }).done(function(response){

    	if (response.data.cod == 404) {
    		console.log('Weather Data could not be retrieved. Invalid API Key?');
    		return;
    	}
    	var weatherData = response.data;

    	var currentHours = getLocalTime().getHours();
    	var daylight = 'day';
		if ((currentHours >= sunsetHour) || (currentHours <= sunriseHour)) {
			daylight = 'night';
		}

        $('#ftWeatherTemperature').text(Math.round(weatherData.main.temp) + '°C'),
		$('#ftWeatherIcon').html('<i class="wi wi-owm-'+ daylight +'-'+ weatherData.weather[0].id +'"></i>');

    }).fail(function(error){

        console.log(error.responseText);

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

	window.setTimeout(function() {
		$('body').animate({
			'opacity': 1
		}, 1000);
	}, 3000);

	updateHints();

}); // End Document Ready

/* End Info Smoothscroll */

$(window).resize(function() {
	rescaleMapCanvas();
});


var initialLoading = true;
var introVideoPlayed = false;

function initEventListeners() {

	if (location.hash.split('#').length == 1) {
		$('#ftintro').addClass('active').show();
		if (!previousLayer) {
			$('#ftStartButton').show();
		}
	}

	// Hash Change Listener
	$(window).on('hashchange', function() {
		if (location.hash.split('#').length == 1) { return; }

		var hash = location.hash.split('#')[1].split('=');
		if (hash[1]) {
			activateLayer(hash[0], hash[1].split('&')[0]);
		} else if (hash) {
			activateLayer(hash[0]);
		}
	});

	$(window).trigger('hashchange');
	
	if (typeof document.addEventListener === "undefined" || hidden === undefined) {
		// browser doesn't support addEventListener or the Page Visibility API
	} else {
		document.addEventListener(visibilityChange, handleVisibilityChange, false);
	}

	handleVisibilityChange();

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
	$('.ftNavUp').click(function(evt) {
		interfaceUp();
		if ( $(evt.target).parents('#fthypervideo').length !== 0 ) {
			localStorage.setItem('fieldtrip-overview-hint', 'hide');
			updateHints();
		}
	});
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

  var infoImagesLoaded = false;
	$('.ftNavAbout').click(function() {
    // lazy load images on info page
    if (!infoImagesLoaded) {
      $('#fthyperInfo').find('img[data-src]').each(function () {
        var t = $(this);
        t.attr('src', t.attr('data-src'));
      });
      infoImagesLoaded = true;
    }
	  $('#fthyperInfo').toggleClass('is-open');
	});

	$('#ftCloseInfo').click(function() {
	  $('#fthyperInfo').removeClass('is-open');
	});

	/* Deine Vision Tooltip */

  /*
	$( ".ftNavVision .btn" ).mouseover(function() {
		$('.tooltip').addClass("is-visible");
	}).mouseout(function() {
		$('.tooltip').removeClass("is-visible");
	});
  */

	$( ".ftNavVision .btn" ).click(function() {
		$('.ftNavVision .tooltip').toggleClass("is-visible");
  });
	$( ".ftNavVision a" ).click(function(e) {
    e.stopPropagation();
  });
	$( ".ftNavVision .tooltip" ).click(function(e) {
		$('.ftNavVision .tooltip').removeClass("is-visible");
  });
	$( "#ftMapCanvas" ).click(function(e) {
		$('.ftNavVision .tooltip').removeClass("is-visible");
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

	var currentHours = getLocalTime().getHours();
	if ((currentHours >= sunsetHour) || (currentHours <= sunriseHour)) {
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
	    //console.log(evt);

	    if (!FULLSCREEN_POSSIBLE) {
	    	window.history.replaceState({}, '', '#overview');
			activateLayer('overview');
	    }

	    if ($(evt.target).attr('id') == 'ftMapContainer' || $(evt.target).attr('id') == 'ftMap' || $(evt.target).attr('id') == 'ftMapCanvas') {
	    	$('.ftMapPin').removeClass('pinOpen');
	    	$('.ftMapPinDescription').removeClass('is-visible');
	    }
	    //hide = true;

	    // Attempt to deal with autoplay issues
	    if (!firstClickPlay) {
	    	$('#audioAtmoDay')[0].play();
			$('#audioAtmoDay').stop(true, false).animate({
				volume: 1
			}, 7000);
			firstClickPlay = true;
	    }
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

		$('.ftMapPin').removeClass('pinOpen');
		$(this).addClass('pinOpen');
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

		localStorage.setItem('fieldtrip-map-hints', 'hide');
		updateHints();

	});

	$('#VideoPlayer').on('click', '.overlayElement', function() {
		localStorage.setItem('fieldtrip-overlay-hints', 'hide');
		updateHints();
	});

	/* Fullscreen Button */

	$('.ftScreen').click(function() {
		toggleNativeFullscreen();
	});
  
	if (FULLSCREEN_POSSIBLE) screenfull.on('change', toggleFullscreen);

	$('#ftSkipIntro').click(function() {
    $('ftIntroVideoPoster').hide();
		window.history.pushState({}, '', '#overview');
		activateLayer('overview');
	});

}

function activateLayer(layerName, videoID) {

	if (layerName == 'ueber-uns' || layerName == 'team' || layerName == 'abspann' || layerName == 'resourcen' || layerName == 'impressum' || layerName == 'datenschutz') {
		$('.ftInfoLink').removeClass('is-active');
		$('.ftInfoLink[href="#'+layerName+'"]').addClass('is-active');
		return;
	}

	updateTime();
	//updateVisitorsNumber();

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

      if (!initialLoading || !introVideoPlayed) {
        $('#ftintro #ftTagline, #ftintro .ftintroLogo').hide();
      } else {
        $('#ftStartButton').show();
        initialLoading = false;
      }

			$('#ftSkipIntro').show();
      		$('#ftIntroAudio').show();

			if (previousLayer) {
				$('#ftIntroVideo')[0].currentTime = 0;
			}

			$('#ftIntroVideo')[0].play();

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
      $('#ftIntroVideoPoster').hide();
			$('#ftStartButton').hide();
			$('#ftoverview').css('opacity', '');
			if (FieldTrip.pause) {
				$('.hypervideo .video').stop(true, false).animate({
					volume: 0
				}, 1000, function() {
					FieldTrip.pause();
				});
			}
			$('#ftIntroVideo')[0].pause();
			//window.clearTimeout(introTimeout);

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
      		$('#ftIntroVideoPoster').hide();
			$('#ftStartButton').hide();
			$('.hypervideo .video').prop('volume', 0);
			if (FieldTripReady) {
				initTransitions('.mainContainer');
			}
			updateMuted();
			renderPlayCircleLinks();

			$('#audioAtmoDay').stop(true, false).animate({
				volume: 0
			}, 4000, function() {
				$('#audioAtmoDay')[0].pause();
			});

			//console.log(activeVideoID, videoID);
			if (!activeVideoID && FieldTripReady) {
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
			} else if (activeVideoID != videoID && FieldTripReady) {
				playTransitionLoading();
			} else {
				window.setTimeout(function() {
					$(window).resize();
					window.setTimeout(function() {
						$(window).resize();
						updateMuted();
						renderPlayCircleLinks();
						if (currentLayer == 'hypervideo') FieldTrip.play();
						$('.hypervideo .video').stop(true, false).animate({
							volume: 1
						}, 2000);
					}, 800);
				}, 1600);
			}

			$('#fthypervideo #VideoPlayer').addClass('active');

			$('#ftIntroVideo')[0].pause();
			//window.clearTimeout(introTimeout);

			$('.ftLayer#ftintro').fadeOut(1000);
			if (FULLSCREEN_POSSIBLE) $('.ftLayer#ftoverview').fadeOut(1000);
			$('.ftLayer#ftoverview').removeClass('zoomOut');
			$('.ftLayer#fthypervideo').removeClass('zoomOut');

			// TODO: Replace with parsed Video ID
			$('.ftMapPin').removeClass('pinOpen');
			$('.ftMapPin#ftMapPin'+ videoID).addClass('pinOpen');
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

	if (!FULLSCREEN_POSSIBLE && layerName == 'hypervideo') {
		$('.ftLayer#ftoverview').addClass('active').show();
		$('.ftLayer#fthypervideo').removeClass('active zoomOut').hide();
	} else {
		$('.ftLayer#ft'+ layerName).addClass('active').fadeIn(1000);
	}
	
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
		for (var i=0; i<videoLinks[hypervideoID]['links'].length; i++) {
			var videoLink = videoLinks[hypervideoID]['links'][i];
			if (videoLink.time >= FieldTrip.currentTime) {
				nextTimeStep = videoLink.time - 3;
				FieldTrip.currentTime = nextTimeStep;
				break;
			}
		}
	}

	FieldTrip.currentTime = nextTimeStep;
}

function updateButtonStates() {
	$('.ftNavIconContainer').removeClass('inactive');

	if (currentLayer == 'hypervideo') {
		$('.ftNavIconContainer.ftNavDown').addClass('inactive');
	} else if (currentLayer == 'overview') {
		$('.ftNavIconContainer.ftNavUp').addClass('inactive');
		if (!activeVideoID) {
			$('.ftNavIconContainer.ftNavDown').addClass('inactive');
		}
	} else if (currentLayer == 'intro') {
		$('.ftNavIconContainer.ftNavUp').addClass('inactive');
	}
}

function toggleNativeFullscreen() {
  if (FULLSCREEN_POSSIBLE) screenfull.toggle();
}

function toggleFullscreen() {
  if (FULLSCREEN_POSSIBLE) {
    if (screenfull.isFullscreen) {
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
		var newDate = getLocalTime().toLocaleString('de-DE', {
			hour: '2-digit',
			minute: '2-digit'
		});;
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

function getLocalTime() {
	var daylightSavingsOffset = (isDST(new Date()) ? 2 : 1),
		d = new Date(),
		utc = d.getTime() + (d.getTimezoneOffset() * 60000);

	var dateObj = new Date(utc + (3600000*daylightSavingsOffset));
	return dateObj;
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

		//mapElement.find('.chart').find('circle')[0].style.transform = "rotate(" + (360 * value.lastTime / (value.duration)) + "deg)";


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

	playCircleContainer.click(function(evt) {
    evt.stopPropagation();


		if ($(evt.target).hasClass('linkPointer')) {

			var linkElemTime = $(evt.target).parent().attr('data-time');

			if (linkElemTime) {
				FieldTrip.currentTime = linkElemTime-3;
			}
		} else if ($(evt.target).hasClass('inner')) {
			if ($(this).hasClass('playing')) {
				FieldTrip.pause();
			} else {
				FieldTrip.play();
			}
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

  var playCircleProgressMove = document.createElementNS(ns, 'circle');
	playCircleProgressMove.classList.add('circle');
	playCircleProgressMove.classList.add('progress-move');
	playCircleProgressMove.setAttribute('cx', '90');
	playCircleProgressMove.setAttribute('cy', '90');
	playCircleProgressMove.setAttribute('r', '88');

	var playCircleProgress = document.createElementNS(ns, 'circle');
	playCircleProgress.classList.add('circle');
	playCircleProgress.classList.add('progress');
	playCircleProgress.setAttribute('cx', '90');
	playCircleProgress.setAttribute('cy', '90');
	playCircleProgress.setAttribute('r', '88');

	var playCircleProgressInteraction = document.createElementNS(ns, 'circle');
	playCircleProgressInteraction.classList.add('circle');
	playCircleProgressInteraction.classList.add('progress-interaction');
	playCircleProgressInteraction.setAttribute('cx', '90');
	playCircleProgressInteraction.setAttribute('cy', '90');
	playCircleProgressInteraction.setAttribute('r', '98');

	var playCircle = document.createElementNS(ns, 'circle');
	playCircle.classList.add('circle');
	playCircle.classList.add('inner');
	playCircle.setAttribute('cx', '90');
	playCircle.setAttribute('cy', '90');
	playCircle.setAttribute('r', '78');

	playCircleSVG.appendChild(playCircleBG);
	playCircleSVG.appendChild(playCircleProgressMove);
	playCircleSVG.appendChild(playCircleProgress);
	playCircleSVG.appendChild(playCircleProgressInteraction);
	playCircleSVG.appendChild(playCircle);

	playCircleContainer[0].appendChild(playCircleSVG);

	$('.playerContainer').append(playCircleContainer);

	renderPlayCircleLinks();

  $(playCircleProgressInteraction).on('click', function (evt) {
    evt.stopPropagation();
    console.log('SKIPPING');
    var posX = $(this).offset().left;
    var posY = $(this).offset().top;
    var x = evt.pageX - posX - 90;
    var y = evt.pageY - posY - 90;
    var d =  (1 - Math.atan2(x, y) / Math.PI) / 2;
    FieldTrip.currentTime = FieldTrip.duration * d;
  });
  
  $(playCircleProgressInteraction).on('mouseenter', function (evt) {
    TweenLite.to(playCircleProgress, 0.17, { 'stroke-width': 6 });
    TweenLite.to(playCircleProgressMove, 0.17, { 'opacity': 0.45 });
  });
  
  $(playCircleProgressInteraction).on('mouseleave', function (evt) {
    TweenLite.to(playCircleProgress, 0.5, { 'stroke-width': 3 });
    TweenLite.to(playCircleProgressMove, 0.3, { 'opacity': 0 });
  });

  $(playCircleProgressInteraction).on('mousemove', function (evt) {
    var posX = $(this).offset().left;
    var posY = $(this).offset().top;
    var x = evt.pageX - posX - 90;
    var y = evt.pageY - posY - 90;
    var d =  (1 - Math.atan2(x, y) / Math.PI) / 2;
    var length = Math.PI * 2 * parseInt(playCircleProgressMove.getAttribute('r'));
	  var offset = - length - length * d;
    playCircleProgressMove.style.strokeDasharray = length;
	  playCircleProgressMove.style.strokeDashoffset = offset;
  });
}

function updatePlayCircle() {

	var parentSVG = document.querySelector('.playerContainer #playCircleContainer svg');

	if (!parentSVG) {
		return;
	}
	var svgCircle = parentSVG.querySelector('.chart svg > .circle.progress');

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
			newPointerCircle.setAttribute('r', '16');
			newPointerCircle.classList.add('linkPointer');

			newPointerGroup.appendChild(newPointerCircle);

			if (!parentSVG.querySelector('.pointer-group-player[data-time="'+ videoLink.time +'"]')) {
				parentSVG.appendChild(newPointerGroup);
			}

			newPointerGroup.style.transform = "translate(88px, 88px) rotate(" + ((360 * parseFloat(videoLink.time) / (hypervideoDuration)) - 90) + "deg)";

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

					newPointerGroup.style.transform = "translate(143px, 143px) rotate(" + ((360 * parseFloat(videoLink.time) / (hypervideoDuration)) - 90) + "deg)";
				});

			}
		}
	});

}

/*
function updateVisitorsNumber() {
	$.ajax({
        type:   "GET",
        url:    "visitorcount.php",
        cache:  false,
        dataType: "json",
        mimeType: "application/json"
    }).done(function(data){

        if (data.visitors) {
            $(".ftNavVisitorsNumber").text(data.visitors);
        }

    }).fail(function(error){

        console.log(error.responseText);

    });
}
*/

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

function handleVisibilityChange() {
	if (document[hidden]) {
		soundOff();
	} else if (!muted) {
		soundOn();
	}
}

function updateHints() {

	/*
	* hidden via
	* localStorage.setItem('fieldtrip-overlay-hints', 'hide'); updateHints();
	* localStorage.setItem('fieldtrip-map-hints', 'hide'); updateHints();
	* localStorage.setItem('fieldtrip-overview-hint', 'hide'); updateHints();
	*/

	var lsOverlayHints = localStorage.getItem('fieldtrip-overlay-hints');

	if (!lsOverlayHints || lsOverlayHints.length == 0 || lsOverlayHints == 'show') {
		$('body').addClass('overlayHints');
	} else if (lsOverlayHints == 'hide') {
		$('body').removeClass('overlayHints');
	}

	var lsMapHints = localStorage.getItem('fieldtrip-map-hints');

	if (!lsMapHints || lsMapHints.length == 0 || lsMapHints == 'show') {

		$('.ftPulsingHint').addClass('is-visible');

		if (mapPinHintsInterval) {
			window.clearInterval(mapPinHintsInterval);
		}

		mapPinHintsInterval = window.setInterval(function() {
			var episodes = [1,2,3,4,5,6,7,8,9],
				randomEpisode = episodes[Math.floor(Math.random()*episodes.length)];

			highlightInteractiveElement('.ftMapPin#ftMapPin'+ randomEpisode, 2);
		}, 8000);

	} else if (lsMapHints == 'hide') {
		window.clearInterval(mapPinHintsInterval);
		$('.ftPulsingHint').removeClass('is-visible');
	}

	var lsOverviewHint = localStorage.getItem('fieldtrip-overview-hint');

	if (!lsOverviewHint || lsOverviewHint.length == 0 || lsOverviewHint == 'show') {
		$('.ftLayer#fthypervideo .ftNavUp .tooltip').addClass('is-visible');
	} else if (lsOverviewHint == 'hide') {
		$('.ftLayer#fthypervideo .ftNavUp .tooltip').removeClass('is-visible');
	}

}

function highlightInteractiveElement(selector, iterations) {

	var interactiveElement = $(selector);

	interactiveElement.addClass("active");

	setTimeout(function() {
		interactiveElement.removeClass("active");
	}, iterations * 3000);

}

function initIntroCaptions() {

	var VTTsource = '_custom/intro-video-captions.vtt';
	
	if (!!screenfull) {
    	
    	$('#ftIntroCaptionsContainer').empty();

        $.ajax({
            type: "GET",
            url: VTTsource,
            cache: true
        }).done(function(data){
	        // parse webvtt contents
	        var parser = new WebVTT.Parser(window, WebVTT.StringDecoder());
	        parser.onregion = function(region) {};
	        parser.oncue = function(cue) {
	            var cueElem = '<div class="ftIntroCaption" data-start="'+ cue.startTime +'" data-end="'+ cue.endTime +'">'+ cue.text +'</div>';
	            $('#ftIntroCaptionsContainer').append(cueElem);
	        };
	        parser.onparsingerror = function(e) {
	            console.log(e);
	        };
	        parser.parse(data);
	        parser.flush();
	    });

    } else {
        
        $('#ftIntroCaptionsContainer').empty();
        
        var videoElement = $('#ftIntroVideo')[0];

        console.log(videoElement);
                
        var track = document.createElement('track');
        track.kind = 'captions';
        track.label = 'Deutsch';
        track.srclang = 'de';
        track.src = VTTsource;
		track.setAttribute('default', '');

        track.addEventListener('load', function() {
           this.mode = 'showing';
           videoElement.textTracks[0].mode = 'showing';
        });

        videoElement.appendChild(track);
    }
}

function updateStatesOfIntroCaptions() {

	var currentTime = ($('#ftIntroVideo')[0].currentTime) ? $('#ftIntroVideo')[0].currentTime : 0;

	$('#ftIntroCaptionsContainer .ftIntroCaption').each(function() {
		var startTime = $(this).data('start'),
			endTime = $(this).data('end');

		if (    startTime <= currentTime
             && endTime   >= currentTime) {
            if (!$(this).hasClass('active')) {
                $(this).addClass('active')
            }
        } else {

            if ($(this).hasClass('active')) {
                $(this).removeClass('active')
            }

        }
	});

}
