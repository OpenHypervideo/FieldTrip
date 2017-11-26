/**
 * @module Player
 */


/**
 * I am the HypervideoController.
 *
 * I am the central controller module of the application. I control the interactions between the UI elements of the hypervideo and its data model.
 *
 * My two most important jobs are:
 *   * I init the video element, all its UI controls, and my sub-controllers (for annotations, overlays, codeSnippets)
 *   * I control the playback und the update handlers to show time-based contents
 *
 * @class HypervideoController
 * @static
 */


FrameTrail.defineModule('HypervideoController', function(){



	var HypervideoModel        = FrameTrail.module('HypervideoModel'),
		ViewVideo 			   = FrameTrail.module('ViewVideo'),

		AnnotationsController  = FrameTrail.initModule('AnnotationsController'),
		OverlaysController     = FrameTrail.initModule('OverlaysController'),
		CodeSnippetsController = FrameTrail.initModule('CodeSnippetsController'),
		SubtitlesController    = FrameTrail.initModule('SubtitlesController'),
        ViewLayout             = FrameTrail.initModule('ViewLayout'),

		InteractionController  = FrameTrail.initModule('InteractionController'),


		isPlaying              = false,
        isStalled              = false,
        stallRequestedBy       = [],
		currentTime 		   = 0,
		muted 				   = false,
		nullVideoStartDate     = 0,

		highPriorityInterval   = 25,
		lowPriorityInterval    = 150,
		nullVideoInterval      = 25,

		highPriorityIntervalID = null,
		lowPriorityIntervalID  = null,
		nullVideoIntervalID    = null,

		highPriorityUpdater    = null,
		lowPriorityUpdater     = null,

		videoElement           = ViewVideo.Video;




	/**
	 * I initialize the Controller.
	 *
	 * I check, wether there are playable video source files, and append the right &lt;source&gt; nodes to the video element.
	 * Otherwise I prepare the "Null Player", meaning a simulated playback machine, which serves as a timer for update functions.
	 *
	 * After the video has sufficiently loaded (or the "Null Player" is ready), I initalize the UI control (play button and progress bar).
	 *
	 * @method initController
	 * @param {Function} callback
	 * @param {Function} failCallback
	 * @param {Boolean} update
	 */
	function initController(callback, failCallback, update) {

		var RouteNavigation = FrameTrail.module('RouteNavigation'),
			projectID 	    = RouteNavigation.projectID,
			hypervideoID    = RouteNavigation.hypervideoID,
			_video		    = $(videoElement);

		updateDescriptions();

		_video.width(1920).height(1080);

		if (HypervideoModel.hasHTML5Video) {

			highPriorityUpdater = highPriorityUpdater_HTML5;
			lowPriorityUpdater  = lowPriorityUpdater_HTML5;

			FrameTrail.changeState('videoWorking', true);

			// if ( videoElement.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, '') || videoElement.canPlayType('video/webm; codecs="vp9"').replace(/^no$/, '') ) {
			// 	_video.append('<source src="../_data/projects/' + projectID + '/resources/' + HypervideoModel.sourceFiles.webm +'" type="video/webm"></source>');
			// } else {
				_video.append('<source src="../_data/projects/' + projectID + '/resources/' + HypervideoModel.sourceFiles.mp4  +'" type="video/mp4"></source>');
			// }

			_video.on('play',  _play);
			_video.on('pause', _pause);

			_video.on('seeking', function() {
				FrameTrail.changeState('videoWorking', true);
			});

			_video.on('waiting', function() {
				FrameTrail.changeState('videoWorking', true);
			});

			_video.on('canplaythrough', function() {
				FrameTrail.changeState('videoWorking', false);
			});

			_video.on('seeked', function() {
				FrameTrail.changeState('videoWorking', false);
			});

			_video.on('ended', function() {
				if (HypervideoModel.events.onEnded) {
					try {
		            	var endedEvent = new Function(HypervideoModel.events.onEnded);
		            	endedEvent();
		            } catch (exception) {
		                // could not parse and compile JS code!
		                console.warn('Event handler contains errors: '+ exception.message);
		            }
		        }
			});

			_video.attr('preload', 'auto');
			videoElement.load();

			initVideo(
				function(){

					HypervideoModel.duration = videoElement.duration;

					if (update) {
						AnnotationsController.updateController();
					} else {
						AnnotationsController.initController();
					}

					OverlaysController.initController();
					CodeSnippetsController.initController();
					SubtitlesController.initController();

					initPlayButton();
					initProgressBar();

					InteractionController.initController();

					if (HypervideoModel.events.onReady) {
						try {
		                	var readyEvent = new Function(HypervideoModel.events.onReady);
		                	readyEvent();
			            } catch (exception) {
			                // could not parse and compile JS code!
			                console.warn('Event handler contains errors: '+ exception.message);
			            }
					}

					if (RouteNavigation.hashTime) {
						setCurrentTime(RouteNavigation.hashTime);
					} else {
						setCurrentTime(0);
					}

					FrameTrail.changeState('viewSize', FrameTrail.getState('viewSize'));

					callback.call();

				},
				failCallback
			);

		} else {

			highPriorityUpdater = highPriorityUpdater_NullVideo;
			lowPriorityUpdater  = lowPriorityUpdater_NullVideo;

			if (update) {
				AnnotationsController.updateController();
			} else {
				AnnotationsController.initController();
			}

			OverlaysController.initController();
			CodeSnippetsController.initController();
			SubtitlesController.initController();

			initPlayButton();
			initProgressBar();

			InteractionController.initController();

			if (HypervideoModel.events.onReady) {
				try {
                	var readyEvent = new Function(HypervideoModel.events.onReady);
                	readyEvent();
	            } catch (exception) {
	                // could not parse and compile JS code!
	                console.warn('Event handler contains errors: '+ exception.message);
	            }
			}

			if (RouteNavigation.hashTime) {
				setCurrentTime(RouteNavigation.hashTime);
			} else {
				setCurrentTime(0);
			}

			FrameTrail.changeState('viewSize', FrameTrail.getState('viewSize'));

			callback.call();

		}

		FrameTrail.module('RouteNavigation').onHashTimeChange = function() {
			setCurrentTime(RouteNavigation.hashTime);
		};


	};


	/**
	 * I delay the execution of callback until enough data from the video source file has loaded.
	 *
	 * readyState == 0 means, that metadata is loaded. This is needed to know the __duration__ of the video.
	 *
	 * @method initVideo
	 * @param {Function} callback
	 * @param {Function} failCallback
	 * @private
	 */
	function initVideo(callback, failCallback) {

		var waitingInterval = 500, 	// milliseconds
			counter    		= 50; 	// 25 seconds waiting time


		function checkReadyState() {

			if (videoElement.readyState > 0){

				callback();

			} else {

				if (--counter) {

					window.setTimeout(checkReadyState, waitingInterval);

				} else {

					failCallback(
							'VideoPlayer: Received no data within the time limit of '
						+ 	Math.round(waitingInterval * 50 / 1000)
						+	' seconds.'
					);

				}

			}

		}

		checkReadyState();

	};


	/**
	 * I init the UI of the play button and connect it with the play/pause functions.
	 *
	 * @method initPlayButton
	 * @private
	 */
	function initPlayButton(){

		ViewVideo.PlayButton.click(function(){

			if ( isPlaying ) {
				pause();
			} else {
				play();
			}

		});

		ViewVideo.VideoStartOverlay.click(function(){

			if ( !isPlaying ) {
				play();
			}

		})

	};



	/**
	 * I initialize the UI elements of the progress bar.
	 *
	 * This depends on the duration of the video already being known.
	 *
	 * I make the DOM element a jQuery UI Slider, and attach its event listeners.
	 *
	 * @method initProgressBar
	 * @private
	 */
	function initProgressBar() {

		ViewVideo.duration = formatTime(HypervideoModel.duration);

		ViewVideo.PlayerProgress.slider({
			value: 0,
			step: 0.01,
			orientation: "horizontal",
			range: "min",
			max: HypervideoModel.duration,
			animate: false,

			create: function(evt, ui) {

						var circle      = $('<div class="ui-slider-handle-circle"></div>'),
							innerCircle = $('<div class="ui-slider-handle-circle-inner"></div>'),
							_evtTarget  = $(evt.target);

						innerCircle.appendTo(circle);
						_evtTarget.children('.ui-slider-handle').append(circle);

						ViewVideo.adjustLayout();
						ViewVideo.adjustHypervideo();

					},

			slide:  function(evt, ui) {

						setCurrentTime(ui.value);

					},

			start: 	function(evt, ui) {

					},

			stop: 	function(evt, ui) {

					}
		});


	};


	/**
	 * I update the descriptions of the hypervideo and of the current project, which is shown in the UI in the {{#crossLink "Sidebar"}}Sidebar{{/crossLink}}
	 * @method updateDescriptions
	 */
	function updateDescriptions() {

		var created = new Date(HypervideoModel.created).toLocaleString('de-DE', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit'
				}).replace(/\./g, '.'),

			changed = new Date(HypervideoModel.lastchanged).toLocaleString('de-DE', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit'
				}).replace(/\./g, '.');

		FrameTrail.module('Sidebar').ProjectDescription = FrameTrail.module('Database').project.description;

		FrameTrail.module('Sidebar').VideoDescription   = (	'<div>' + HypervideoModel.description + '</div>'
													  +	'<div class="descriptionLabel">Author</div>'
													  +	'<div>' + HypervideoModel.creator + '</div>'
													  + '<div class="descriptionDates">'
													  +	'    <div class="descriptionLabel">Created</div>'
													  +	'    <div>' + created + '</div>'
													  +	'    <div class="descriptionLabel">Last changed</div>'
													  +	'    <div>' + changed + '</div>'
													  + '</div>'

													);

		FrameTrail.module('Titlebar').title = HypervideoModel.hypervideoName;


	};





	/**
	 * I am the high priority update function, when there is a HTML5 video element present.
	 *
	 * I am called from the browser runtime environment via its window.setInterval mechanism. The interval is defined in the
	 * {{#crossLink "HypervideoController/_play:method"}}_play method{{/crossLink}}, and the interval length is set to 40 milliseconds.
	 *
	 * I fetch the currentTime attribute from the video element and store it in {{#crossLink "HypervideoController/currentTime:attribute"}}.
	 *
	 * I update the slider position of the progress bar.
	 *
	 * @method highPriorityUpdater_HTML5
	 * @private
	 */
	function highPriorityUpdater_HTML5() {

		currentTime = videoElement.currentTime;

		ViewVideo.PlayerProgress.slider('value', currentTime);

        OverlaysController.checkMediaSynchronization();


	};

	/**
	 * I am the low priority update function, when there is a HTML5 video element present.
	 *
	 * I am called from the browser runtime environment via its window.setInterval mechanism. The interval is defined in the
	 * {{#crossLink "HypervideoController/_play:method"}}_play method{{/crossLink}}, and the interval length is set to 180 milliseconds.
	 *
	 * I perform the following tasks:
	 *
	 * * Display the currentTime in the UI (numeric display in progress bar)
	 * * Call all sub-controllers ({{#crossLink "OverlaysController"}}OverlaysController{{/crossLink}}, {{#crossLink "VideosController"}}VideosController{{/crossLink}}, {{#crossLink "AnnotationsController"}}AnnotationsController{{/crossLink}}), to update the state for which they are responsible for.
	 *
	 * @method lowPriorityUpdater_HTML5
	 * @private
	 */
	function lowPriorityUpdater_HTML5() {

		ViewVideo.currentTime = formatTime(currentTime);

		OverlaysController.updateStatesOfOverlays(currentTime);
		CodeSnippetsController.updateStatesOfCodeSnippets(currentTime);
		//AnnotationsController.updateStatesOfAnnotations(currentTime);
        ViewLayout.updateTimedStateOfContentViews(currentTime);
		SubtitlesController.updateStatesOfSubtitles(currentTime);

	};



	/**
	 * I am the high priority update function, when there is no HTML5 video element ("Null Player").
	 *
	 * I am called from the browser runtime environment via its window.setInterval mechanism. The interval is defined in the
	 * {{#crossLink "HypervideoController/_play:method"}}_play method{{/crossLink}}, and the interval length is set to 40 milliseconds.
	 *
	 * I update the slider position of the progress bar.
	 *
	 * @method highPriorityUpdater_NullVideo
	 * @private
	 */
	function highPriorityUpdater_NullVideo() {

		ViewVideo.PlayerProgress.slider('value', currentTime);

        OverlaysController.checkMediaSynchronization();

	};

	/**
	 * I am the low priority update function, when there is no HTML5 video element ("Null Player").
	 *
	 * I am called from the browser runtime environment via its window.setInterval mechanism. The interval is defined in the
	 * {{#crossLink "HypervideoController/_play:method"}}_play method{{/crossLink}}, and the interval length is set to 180 milliseconds.
	 *
	 * I perform the following tasks:
	 *
	 * * Display the currentTime in the UI (numeric display in progress bar)
	 * * Call all sub-controllers ({{#crossLink "OverlaysController"}}OverlaysController{{/crossLink}}, {{#crossLink "VideosController"}}VideosController{{/crossLink}}, {{#crossLink "AnnotationsController"}}AnnotationsController{{/crossLink}}), to update the state for which they are responsible for.
	 *
	 * @method lowPriorityUpdater_NullVideo
	 * @private
	 */
	function lowPriorityUpdater_NullVideo() {

		ViewVideo.currentTime = formatTime(currentTime);

		OverlaysController.updateStatesOfOverlays(currentTime);
		CodeSnippetsController.updateStatesOfCodeSnippets(currentTime);
		//AnnotationsController.updateStatesOfAnnotations(currentTime);
        ViewLayout.updateTimedStateOfContentViews(currentTime);
		SubtitlesController.updateStatesOfSubtitles(currentTime);

	};


	/**
	 * I am the update function of the "Null Player", which sets the {{#crossLink "HypervideoController/currentTime:attribute"}}.
	 *
	 * When the currentTime reaches the duration of the null video, I stop playback.
	 *
	 * @method nullVideoUpdater
	 * @private
	 */
	function nullVideoUpdater() {

		currentTime = (Date.now() - nullVideoStartDate) / 1000;

		if (currentTime >= HypervideoModel.duration) {
			currentTime = HypervideoModel.duration;
			pause();
		}

	};



	/**
	 * I am the function, which starts the playback of the hypervideo.
	 *
	 * When there is a HTML5 video present, i simply call its .play() method,
	 * which in turn triggers the "play" event of the &lt;video&gt; element;
	 * The {{#crossLink "HypervideoController/_play:method"}}_play(){{/crossLink}} method is set as event handler for this event.
	 *
	 * When there is no HTML5 video ("Null player"), then I do two things:
	 * * I check if the currentTime reached the end of the "null video", and reset it to 0 if necessary.
	 * * I store the computer's current system clock time in the module var nullVideoStartDate (from this number the {{#crossLink "HypervideoController/nullVideoUpdater:method"}}nullVideoUpdater(){{/crossLink}}) can calculate the new currentTime.
	 *
	 * @method play
	 */
	function play() {

        FrameTrail.changeState('videoWorking', false);

		if (HypervideoModel.hasHTML5Video) {

			var promise = videoElement.play();
            if (promise) {
                promise.catch(function(){});
            }

		} else {

			if (!isPlaying){

				if (currentTime === HypervideoModel.duration) {
					currentTime = 0;
				}

				nullVideoStartDate = Date.now() - (currentTime * 1000)
				_play();

			}

		}

		if ( !ViewVideo.VideoStartOverlay.hasClass('inactive') ) {
			ViewVideo.VideoStartOverlay.addClass('inactive').fadeOut();
		}

		if (HypervideoModel.events.onPlay) {
			try {
            	var playEvent = new Function(HypervideoModel.events.onPlay);
            	playEvent();
            } catch (exception) {
                // could not parse and compile JS code!
                console.warn('Event handler contains errors: '+ exception.message);
            }
		}



	};


	/**
	 * I pause the playback of the hypervideo.
	 *
	 * When there is a HTML5 video present, i call its .pause() method,
	 * which in turn triggers the "pause" event of the &lt;video&gt; element;
	 * The {{#crossLink "HypervideoController/_pause:method"}}_pause(){{/crossLink}} method is set as event handler for the pause event.
	 *
	 * When there is no HTML5 video ("null player") I directly call the {{#crossLink "HypervideoController/_pause:method"}}_pause(){{/crossLink}} method.
	 *
	 * @method pause
	 */
	function pause() {

		if (HypervideoModel.hasHTML5Video) {

			videoElement.pause();

		} else {

			_pause();

		}

		if (HypervideoModel.events.onPause && currentTime !== HypervideoModel.duration) {
			try {
            	var pauseEvent = new Function(HypervideoModel.events.onPause);
            	pauseEvent();
            } catch (exception) {
                // could not parse and compile JS code!
                console.warn('Event handler contains errors: '+ exception.message);
            }
		}

		// Hack to fire ended event in NullVideo
		if (!HypervideoModel.hasHTML5Video && currentTime == HypervideoModel.duration && HypervideoModel.events.onEnded) {
			try {
            	var endedEvent = new Function(HypervideoModel.events.onEnded);
            	endedEvent();
            } catch (exception) {
                // could not parse and compile JS code!
                console.warn('Event handler contains errors: '+ exception.message);
            }
		}

	};


	/**
	 * After playback has started, we need to do several things:
	 * * Register interval functions (highPriorityUpdater and highPriorityInterval; if necessary: nullVideoUpdater)
	 * * Change play button into a pause button
	 * * Tell the {{#crossLink "OverlaysController/syncMedia:method"}}OverlaysController to synchronize media{{/crossLink}}.
	 *
	 * @method _play
	 * @private
	 */
	function _play() {

		highPriorityIntervalID = window.setInterval(highPriorityUpdater, highPriorityInterval);
		lowPriorityIntervalID  = window.setInterval(lowPriorityUpdater,  lowPriorityInterval);

		if (!HypervideoModel.hasHTML5Video) {
			nullVideoIntervalID = window.setInterval(nullVideoUpdater,  nullVideoInterval);
		}

		ViewVideo.PlayButton.addClass('playing');

		isPlaying = true;

		OverlaysController.syncMedia();

	};


	/**
	 * After playback has paused, we need to do several things:
	 * * Clear the interval functions (highPriorityUpdater and highPriorityInterval; if necessary: nullVideoUpdater)
	 * * Change pause button back into play button
	 * * Tell the {{#crossLink "OverlaysController/syncMedia:method"}}OverlaysController to synchronize media{{/crossLink}}
	 *
	 * @method _pause
	 * @private
	 */
	function _pause() {

		window.clearInterval(highPriorityIntervalID);
		window.clearInterval(lowPriorityIntervalID);

		if (!HypervideoModel.hasHTML5Video) {
			window.clearInterval(nullVideoIntervalID);
		}

		ViewVideo.PlayButton.removeClass('playing');

		isPlaying = false;

		OverlaysController.syncMedia();

	};

    /**
	 * Some media types may request to stall the playback of the main video (for buffering, etc.)
	 *
	 * @method _pause
	 * @param {Boolean} aBoolean
     * @param {Overlay} syncMediaRequestingStall
	 */
	function playbackStalled(aBoolean, syncMediaRequestingStall) {

        if (aBoolean) {

            if (stallRequestedBy.indexOf(syncMediaRequestingStall) < 0) {
                stallRequestedBy.push(syncMediaRequestingStall);
            }


            if (!isStalled) {

                FrameTrail.changeState('videoWorking', true);

                if (HypervideoModel.hasHTML5Video) {
                    videoElement.pause();
                } else {
                    window.clearInterval(nullVideoIntervalID);
                }

        		window.clearInterval(highPriorityIntervalID);
        		window.clearInterval(lowPriorityIntervalID);

                isStalled = aBoolean;

            }

        } else {

            var idx = stallRequestedBy.indexOf(syncMediaRequestingStall);
            if (idx >= 0) {
                stallRequestedBy.splice(idx, 1);
            }

            if (stallRequestedBy.length === 0) {

                FrameTrail.changeState('videoWorking', false);

                if (isStalled) {

                    if (HypervideoModel.hasHTML5Video) {
            			var promise = videoElement.play();
                        if (promise) {
                            promise.catch(function(){ videoElement.play() });
                        }
            		} else {
        				if (currentTime === HypervideoModel.duration) {
        					currentTime = 0;
        				}
        				nullVideoStartDate = Date.now() - (currentTime * 1000);
                        nullVideoIntervalID = window.setInterval(nullVideoUpdater,  nullVideoInterval);
            		}

                    highPriorityIntervalID = window.setInterval(highPriorityUpdater, highPriorityInterval);
            		lowPriorityIntervalID  = window.setInterval(lowPriorityUpdater,  lowPriorityInterval);

                }

                isStalled = aBoolean;

            }

        }

	};


	/**
	 * The HypervideoController stores the {{#crossLink "HypervideoController/currentTime:attribute"}}currentTime{{/crossLink}}.
	 * When this property is being set, several things have to happen:
	 * * The currentTime of the &lt;video&gt; element has to be updated...
	 * * or – when there is no video source file – the nullVideoStartDate has to be updated
	 * * The update functions have to be called (highPriorityUpdater and lowPriorityUpdater)
	 * * The OverlaysController has to {{#crossLink "OverlaysController/syncMedia:method"}}synchronize media{{/crossLink}}
	 *
	 * @method setCurrentTime
	 * @param {Number} aNumber
	 * @return Number
	 * @private
	 */
	function setCurrentTime(aNumber) {

        var aNumberAsFloat = parseFloat(aNumber);

		if ( isNaN(aNumberAsFloat) ) {
			return;
		}

		if (HypervideoModel.hasHTML5Video) {

			videoElement.currentTime = currentTime = aNumberAsFloat;

		} else {

			currentTime = aNumberAsFloat;
			nullVideoStartDate = Date.now() - (currentTime * 1000)

		}

		highPriorityUpdater();
		lowPriorityUpdater();

		OverlaysController.syncMedia();


		return aNumberAsFloat;

	};


	/**
	 * The HypervideoController stores the {{#crossLink "HypervideoController/muted:attribute"}}muted{{/crossLink}}.
	 * When this property is being set, the muted attribute of the &lt;video&gt; element has to be updated
	 * (only when there is a video source file)
	 *
	 * @method setMuted
	 * @param {Boolean} muted
	 * @return muted
	 * @private
	 */
	function setMuted(muted) {

		if (HypervideoModel.hasHTML5Video) {

			videoElement.muted = muted;

		}

		OverlaysController.muteMedia(muted);



	};


	/**
	 * I take a number, which represents a time in seconds,
	 * and return a formatted string like HH:MM:SS
	 *
	 * @method formatTime
	 * @param {Number} aNumber
	 * @return String
	 */
	function formatTime(aNumber) {

		var hours, minutes, seconds, hourValue;

		seconds 	= Math.ceil(aNumber);
		hours 		= Math.floor(seconds / (60 * 60));
		hours 		= (hours >= 10) ? hours : '0' + hours;
		minutes 	= Math.floor(seconds % (60*60) / 60);
		minutes 	= (minutes >= 10) ? minutes : '0' + minutes;
		seconds 	= Math.ceil(seconds % (60*60) % 60);
		seconds 	= (seconds >= 10) ? seconds : '0' + seconds;

		if (hours >= 1) {
			hourValue = hours + ':';
		} else {
			hourValue = '';
		}

		return hourValue + minutes + ':' + seconds;

	};


	/**
	 * Cancel all currently running intervals
	 *
	 * @method clearIntervals
	 * @private
	 */
	function clearIntervals() {

		window.clearInterval(highPriorityIntervalID);
		window.clearInterval(lowPriorityIntervalID);

		if (!HypervideoModel.hasHTML5Video) {
			window.clearInterval(nullVideoIntervalID);
		}

	};


	return {

		initController: initController,

		play: play,
		pause: pause,

        playbackStalled: playbackStalled,

		updateDescriptions: updateDescriptions,
		clearIntervals:     clearIntervals,


		/**
		 * This read-only attribute tells if the hypervideo is playing or not.
		 * It is set by {{#crossLink "HypervideoController/_play:method"}}_play(){{/crossLink}} and {{#crossLink "HypervideoController/_pause:method"}}_pause(){{/crossLink}}
		 *
		 * @attribute isPlaying
		 * @readOnly
		 */
		get isPlaying()          { return isPlaying               },



		/**
		 * This attributes stores the currentTime of the hypervideo.
		 *
		 * When this attribute is being read, it returns the value, which was automatically updated by {{#crossLink "HypervideoController/highPriorityUpdater_HTML5:method"}}highPriorityUpdater_HTML5(){{/crossLink}} or respectively {{#crossLink "HypervideoController/nullVideoUpdater:method"}}nullVideoUpdater(){{/crossLink}}.
		 *
		 * When the attribute is being set, like this:
		 *
		 *     FrameTrail.module('HypervideoController').currentTime = 3
		 *
		 * then the {{#crossLink "HypervideoController/setCurrentTime:method"}}setCurrentTime(){{/crossLink}} is called.
		 *
		 * @attribute currentTime
		 */
		get currentTime()        { return currentTime             },
		set currentTime(aNumber) { return setCurrentTime(aNumber) },

		/**
		 * These attributes store the muted state of the hypervideo.
		 *
		 * The muted state is set like this:
		 *
		 *     FrameTrail.module('HypervideoController').muted = true
		 *
		 * then the {{#crossLink "HypervideoController/setMuted:method"}}setMuted(){{/crossLink}} is called.
		 *
		 * @attribute muted
		 */
		get muted() 			 { return muted  				  },
		set muted(aBoolean) 	 { return setMuted(aBoolean)  	  }

	}



});
