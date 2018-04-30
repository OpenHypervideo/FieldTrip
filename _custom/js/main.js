/* */


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

	/*
	FieldTrip.on('ready', function() {
		if (FieldTrip.play && previousLayer) {
			FieldTrip.play();
		}
	});

	FieldTrip.on('play', function() {
		window.setTimeout(function() {
			$('.hypervideo .video').css('transition-duration', '').removeClass('nocolor');
		}, 600);
	});
	*/

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

			toggleNativeFullscreen();

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
				//console.log(weather);
				$('#ftWeatherTemperature').text(weather.temp + '°C'),
				$('#ftWeatherIcon').html('<i class="weathericon-'+weather.code+'"></i>');	
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


/* Credits AutoScroll */
/*function autoScroll() {
  var $el = $(".autoscroll");
  function anim() {
    var st = $el.scrollTop();
    var sb = $el.prop("scrollHeight")-$el.innerHeight();
    $el.animate({scrollTop: st<sb/2 ? sb : 0}, 10000, anim);
  }
  function stop(){
    $el.stop();
  }
  anim();
  $el.hover(stop, anim);
}*/
/* End AutoScroll */


/* Info Smoothscroll */

/*
$(document).ready(function() {
	$(document).on("scroll", onScroll);
  $('.ftInfoLink[href^="#"], .ftNextSection').on('click', function(e) {
		e.preventDefault();
		$(document).off("scroll");

		$('.ftInfoLink').each(function() {
			$(this).removeClass('is-active');
		})
		$(this).addClass('is-active');

		var target = this.hash,
			menu = target;
		$target = $(target);
		$('#autoscroll').stop().animate({
			'scrollTop': $target.offset().top + 2
		}, 500, 'swing', function() {
			window.location.hash = target;
			$(document).on("scroll", onScroll);
		});
	});
});

function onScroll(event) {
	var scrollPos = $(document).scrollTop();
	$('.ftInfoLink, .ftNextSection').each(function() {
		var currLink = $(this);
		var refElement = $(currLink.attr("href"));
		if (refElement.position().top <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
			$('.ftInfoLink').removeClass("is-active");
			currLink.addClass("is-active");
		} else {
			currLink.removeClass("is-active");
		}
	});
} 
*/


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
	    $('#fthyperInfo').addClass('is-open');
	});   
	
	$('#ftCloseInfo').click(function() {
	    $('#fthyperInfo').removeClass('is-open');
	}); 
	
	/* Social Network */
	
	$('.ftSocialTrigger').click(function() {
	    $('.ftSocialNav').toggleClass('is-open');
	}); 	
	
	/* Switch Button / Night Mode */
		  
	$('#ftSwitchCheckbox input:checkbox').change(function(){
	    if ($(this).is(':checked')) {
	        $('body').addClass("night");
	    }
	    else {
	        $('body').removeClass("night");
	    }
	});
	

	/* Thumbnails appears on click*/
	

	$('.ftMapPin').click(function(){
	  
	  $('#fthypervideo #VideoPlayer').addClass('active');

	  var description = $(this).find('.ftMapPinDescription');
	  var circle = $(this).find('.circle');
	  var player = $(this).find('.ftMapPinDescriptionContent')
	  description.addClass('is-visible');
	  setTimeout(function(){
	   circle.addClass('outer');
	  }, 500); 
	  setTimeout(function(){
	   player.addClass('is-visible');
	  }, 2350); 

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

	if (layerName == 'about' || layerName == 'resources' || layerName == 'credits' || layerName == 'imprint') {
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

			$('.ftLayer#ftintro').fadeOut(1000);
			$('.ftLayer#ftoverview').removeClass('zoomOut');
			$('.ftLayer#fthypervideo').addClass('zoomOut');
			break;
		case 'hypervideo':
			// Video
			if (FieldTrip.play && previousLayer) {
				window.setTimeout(function() {
					$(window).resize();
					window.setTimeout(function() {
						$(window).resize();
						FieldTrip.play();
						$('.hypervideo .video').stop(true, false).animate({
							volume: 1
						}, 600);
					}, 800);
				}, 1100);
			}
			
			$('#ftIntroVideo')[0].pause();
			window.clearTimeout(introTimeout);
			
			$('.ftLayer#ftintro').fadeOut(1000);
			$('.ftLayer#ftoverview').fadeOut(1000);
			$('.ftLayer#ftoverview').removeClass('zoomOut');
			$('.ftLayer#fthypervideo').removeClass('zoomOut');

			// TODO: Replace with parsed Video ID
			$('.ftMapPin .ftMapPinDescription').removeClass('is-visible');
			$('.ftMapPin .ftMapPinDescription[href="#hypervideo='+ videoID +'"]').addClass('is-visible');
			$('.ftMapPin .ftMapPinDescription[href="#hypervideo='+ videoID +'"] circle').addClass('outer');
			$('.ftMapPin .ftMapPinDescription[href="#hypervideo='+ videoID +'"] .ftMapPinDescriptionContent').addClass('is-visible');
			
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
	var daylightSavingsOffset = (isDST(new Date()) ? 2 : 1),
		d = new Date(),
		utc = d.getTime() + (d.getTimezoneOffset() * 60000),
		newDate = new Date(utc + (3600000*daylightSavingsOffset)).toLocaleString('de-DE', {
			hour: '2-digit',
			minute: '2-digit'
		});
	$('#ftWeatherTime').text(newDate);
}

 function isDST(t) {
    var jan = new Date(t.getFullYear(),0,1);
    var jul = new Date(t.getFullYear(),6,1);
    return Math.min(jan.getTimezoneOffset(),jul.getTimezoneOffset()) == t.getTimezoneOffset();  
}