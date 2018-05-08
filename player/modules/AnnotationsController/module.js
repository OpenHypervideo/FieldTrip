/**
 * @module Player
 */


/**
 * I am the AnnotationsController who mediates between the data model of
 * all {{#crossLink "Annotation"}}annotations{{/crossLink}} (stored in {{#crossLink "HypervideoModel"}}HypervideoModel{{/crossLink}})
 * and their various User Interface elements (e.g. in {{#crossLink "ViewVideo"}}ViewVideo{{/crossLink}})
 *
 * @class AnnotationsController
 * @static
 */

 FrameTrail.defineModule('AnnotationsController', function(FrameTrail){


    var HypervideoModel   = FrameTrail.module('HypervideoModel'),
        ViewVideo         = FrameTrail.module('ViewVideo'),
        annotationInFocus = null,
        openedAnnotation  = null,

        annotations,
        updateControlsStart      = function(){},
        updateControlsEnd        = function(){};




    /**
     * I initialize the AnnotationsController.
     * My init process has two tasks: connect the annotation menu in the Sidebar
     * with the data model (select current annotation set) and initialize
     * the annotations (instances of type {{#crossLink "Annotation"}}Annotation{{/crossLink}})
     *
     * @method initController
     */
    function initController() {

        annotations = HypervideoModel.annotations;

        initAnnotations();

    }


    /**
     * I update the AnnotationsController during runtime.
     * My update process has two tasks: refresh the annotation menu in the Sidebar
     * with the data model (select current annotation set) and initialize
     * the annotations (instances of type {{#crossLink "Annotation"}}Annotation{{/crossLink}})
     *
     * @method updateController
     */
    function updateController() {

        // update references
        annotations = FrameTrail.module('HypervideoModel').annotations;
        ViewVideo = FrameTrail.module('ViewVideo');

        initAnnotations();

    }


    /**
     * I first empty all DOM elements, and then ask all
     * annotations of the current data model, to append new DOM elements,
     * which I the arrange and prepare for view.
     *
     * @method initAnnotations
     * @private
     */
    function initAnnotations() {

        var annotationColor;

        if (!FrameTrail.module('Database').users[FrameTrail.module('HypervideoModel').annotationSet]) {
            annotationColor = '999999';
        } else {
            annotationColor = FrameTrail.module('Database').users[FrameTrail.module('HypervideoModel').annotationSet].color;
        }

        // update references
        annotations = FrameTrail.module('HypervideoModel').annotations;
        ViewVideo = FrameTrail.module('ViewVideo');

        ViewVideo.AnnotationTimeline.empty();

        for (var i = 0; i < annotations.length; i++) {
            annotations[i].renderInDOM();
        }

    }


    /**
     * When the global state viewSize changes, I re-arrange
     * the annotationElements and tiles, to fit the new
     * width of the browser.
     *
     * @method changeViewSize
     * @private
     */
    function changeViewSize() {

    }


    /**
     * I react to changes in the global state viewSizeChanged.
     * The state changes after a window resize event
     * and is meant to be used for performance-heavy operations.
     *
     * @method onViewSizeChanged
     * @private
     */
    function onViewSizeChanged() {

    }


    /**
     * When we are in the editMode annotations, the timeline should
     * show all timeline elements stacked, which is what I do.
     * @method stackTimelineView
     */
    function stackTimelineView() {

        ViewVideo.AnnotationTimeline.CollisionDetection({spacing:0, includeVerticalMargins:true});
        ViewVideo.adjustLayout();
        ViewVideo.adjustHypervideo();

    }


    /**
     * When we are in the editMode annotations, the timeline should
     * show all timeline elements stacked. After leaving this mode,
     * I have to reset the timelineElements and the timeline to their normal
     * layout.
     * @method resetTimelineView
     * @private
     */
    function resetTimelineView() {

        ViewVideo.AnnotationTimeline.css('height', '');
        ViewVideo.AnnotationTimeline.children('.timelineElement').css({
            top:    '',
            right:  '',
            bottom: '',
            height: ''
        });

    }


    /**
     * I am a central method of the AnnotationsController.
     * I am called from the update functions inside the HypervideoController
     * and I set the activeState of the annotations according to the current time.
     * @method updateStatesOfAnnotations
     * @param {Number} currentTime
     */
    function updateStatesOfAnnotations(currentTime) {

        var annotation;

        for (var idx in annotations) {

            annotation = annotations[idx];

            if (    annotation.data.start <= currentTime
                 && annotation.data.end   >= currentTime) {

                if (!annotation.activeState) {

                    annotation.setActive();

                }

            } else {

                if (annotation.activeState) {

                    annotation.setInactive();

                }

            }

        }

        if (annotationInFocus && !annotationInFocus.activeState) {
            annotationInFocus.setActive();
        }


    }



    /**
     * I open the annotationElement of an annotation in the annotationContainer.
     * if my parameter is null, I close the annotationContainer.
     * Also, I add CSS classes to the opened annotationElement, and to its left and right
     * neighbour.
     * @method setOpenedAnnotation
     * @param {Annotation or null} annotation
     * @private
     */
    function setOpenedAnnotation(annotation) {

        var itemPosition, leftOffset;


        openedAnnotation = annotation;


        for (var idx in annotations) {

            annotations[idx].annotationElement.removeClass('open previous next');
            annotations[idx].timelineElement.removeClass('open');
            annotations[idx].tileElement.removeClass('open');

        }

        if (annotation) {

            annotation.annotationElement.addClass('open');
            annotation.annotationElement.prev().addClass('previous');
            annotation.annotationElement.next().addClass('next');

            updateAnnotationSlider();

            ViewVideo.shownDetails = 'bottom';

            if ( annotation.data.type == 'location' && annotation.annotationElement.children('.resourceDetail').data('map') ) {
                annotation.annotationElement.children('.resourceDetail').data('map').updateSize();
            }

        } else {

            ViewVideo.shownDetails = null;

        }

    }



    /**
     * I find the annotation which is active. If there are more than one active annotations,
     * I return the last one which has been activated. If there is no active annotation, I return null.
     * @method findTopMostActiveAnnotation
     */
    function findTopMostActiveAnnotation() {

        var currentTime = FrameTrail.module('HypervideoController').currentTime,
            annotations = FrameTrail.module('HypervideoModel').annotations;

        return (function(){

            var allActiveAnnotations = [];

            for (var idx in annotations) {

                if (   annotations[idx].data.start <= currentTime
                    && annotations[idx].data.end >= currentTime ) {

                    allActiveAnnotations.push(annotations[idx]);

                }

            }


            if (allActiveAnnotations.length === 0) {
                if (annotations.length === 0) {
                    return null
                } else {
                    return annotations[0]
                }
            } else {

                return allActiveAnnotations.sort(function(a,b){
                    if (a.data.start > b.data.start) {
                        return -1
                    } else {
                        return 1
                    }
                })[0];

            }

        }).call();
    }



    /**
     * When an annotation is set into focus, I have to tell
     * the old annotation in the var annotationInFocus, that it
     * is no longer in focus. Then I store the Annotation (or null)
     * from my parameter in the var annotationInFocus, and inform it
     * about it.
     * @method setAnnotationInFocus
     * @param {Annotation or null} annotation
     * @return Annotation or null
     * @private
     */
    function setAnnotationInFocus(annotation) {


        if (annotationInFocus) {

            annotationInFocus.permanentFocusState = false;
            annotationInFocus.removedFromFocus();

            removePropertiesControls();
        }

        annotationInFocus = annotation;

        if (annotationInFocus) {
            annotationInFocus.gotInFocus();
        }

        updateStatesOfAnnotations(FrameTrail.module('HypervideoController').currentTime);

        return annotation;


    }


    /**
     * When an annotation got "into focus", its {{#crossLink "Annotation/gotInFocus:method"}}gotInFocus method{{/crossLink}}
     * calls this method, to do two jobs:
     * * first, append the properties controls elements to the respective DOM element.
     * * secondly, save references to the update functions of the control interface, so that the textual data values of the controls (like start and end time) can be updated, when they are changed directly by mouse interactions with the timeline element.
     *
     * @method renderPropertiesControls
     * @param {Object} propertiesControlsInterface
     */
    function renderPropertiesControls(propertiesControlsInterface) {

        ViewVideo.EditPropertiesContainer.empty().addClass('active').append( propertiesControlsInterface.controlsContainer );

        updateControlsStart        = propertiesControlsInterface.changeStart;
        updateControlsEnd          = propertiesControlsInterface.changeEnd;

        ViewVideo.EditPropertiesContainer.find('.annotationOptionsTabs').tabs('refresh');

        if ( ViewVideo.EditPropertiesContainer.find('.CodeMirror').length != 0 ) {
            ViewVideo.EditPropertiesContainer.find('.CodeMirror')[0].CodeMirror.refresh();
        }

    }


    /**
     * I am the counterpart of {{#crossLink "AnnotationsController/renderPropertiesControls:method"}}renderPropertiesControls method{{/crossLink}}.
     * I remove the DOM element and the update functions.
     * @method removePropertiesControls
     */
    function removePropertiesControls() {


        updateControlsStart      = function(){};
        updateControlsEnd        = function(){};

        ViewVideo.EditPropertiesContainer.removeClass('active').empty();

    }


    /**
     * Listens to global state 'editMode'.
     * The AnnotationsController has to react on a change of the
     * editMode.
     * First it checks, wether we are entering or leaving the edit mode
     * in general (editMode is false, when not the editor is not active, otherwise
     * it is a String indicating the editMode).
     * If the editor is active, the user's own annotation set has to be selected
     * an the select menu for annotations has to be hidden.
     * Secondly it checks wether the editMode we enter or leave is 'annotations'.
     * If so, we activate or deactivate the editing options for annotations.
     *
     * @method toggleEditMode
     * @param {String or false} editMode
     * @param {String or false} oldEditMode
     */
    function toggleEditMode(editMode, oldEditMode) {

        var HypervideoModel     = FrameTrail.module('HypervideoModel');



        if ( editMode === false && oldEditMode !== false ) {

            //console.log('SHOW SEARCH BUTTON');

        } else if ( editMode && oldEditMode === false ) {

            HypervideoModel.annotationSet = '#myAnnotationSet';

            //console.log('HIDE SEARCH BUTTON');

            window.setTimeout(function() {
                initAnnotations();
            }, 300);

        } else if ( editMode === false ) {

            //console.log('SHOW SEARCH BUTTON');

        } else {

            //console.log('HIDE SEARCH BUTTON');

        }


        if (editMode === 'annotations' && oldEditMode !== 'annotations') {

            annotations = HypervideoModel.annotations;

            for (var idx in annotations) {

                annotations[idx].startEditing();

            }

            stackTimelineView();
            initEditOptions();
            makeTimelineDroppable(true);



        } else if (oldEditMode === 'annotations' && editMode !== 'annotations') {


            for (var idx in annotations) {

                annotations[idx].stopEditing();

            }

            setAnnotationInFocus(null);
            resetTimelineView();
            makeTimelineDroppable(false);
            initAnnotations();

        }

    }




    /**
     * When the editMode 'annotations' was entered, the #EditingOptions area
     * should show two tabs: a ResourcePicker and a tab with the annotation timelines
     * of all other users, drag new items on the annotation timeline.
     * @method initEditOptions
     * @private
     */
    function initEditOptions() {

        ViewVideo.EditingOptions.empty();

        var annotationsEditingOptions = $('<div class="overlayEditingTabs">'
                                  +   '    <ul>'
                                  +   '        <li><a href="#ResourceList">Add Resource</a></li>'
                                  +   '        <li><a href="#CustomAnnotation">Add Custom Annotation</a></li>'
                                  +   '        <li><a href="#OtherUsers">Choose Annotations of other Users</a></li>'
                                  +   '    </ul>'
                                  +   '    <div id="ResourceList"></div>'
                                  +   '    <div id="CustomAnnotation"></div>'
                                  +   '    <div id="OtherUsers">'
                                  +   '        <div class="message active">Drag Annotations from the User Timelines to your Annotation Timeline</div>'
                                  +   '        <div class="timelineList"></div>'
                                  +   '    </div>'
                                  +   '</div>')
                                  .tabs({
                                      heightStyle: "fill"
                                  }),

            timelineList        = annotationsEditingOptions.find('.timelineList')
            annotationAllSets   = FrameTrail.module('HypervideoModel').annotationAllSets;


        ViewVideo.EditingOptions.append(annotationsEditingOptions);

        FrameTrail.module('ResourceManager').renderResourcePicker(
            annotationsEditingOptions.find('#ResourceList')
        );

        /* Append custom text resource to 'Add Custom Annotation' tab */
        // TODO: Move to separate function
        var textElement = $('<div class="resourceThumb" data-type="text">'
                + '                  <div class="resourceOverlay">'
                + '                      <div class="resourceIcon"></div>'
                + '                  </div>'
                + '                  <div class="resourceTitle">Custom Text/HTML</div>'
                + '              </div>');

        textElement.draggable({
            containment:    '.mainContainer',
            helper:         'clone',
            revert:         'invalid',
            revertDuration: 100,
            appendTo:       'body',
            distance:       10,
            zIndex:         1000,

            start: function( event, ui ) {
                ui.helper.css({
                    top: $(event.currentTarget).offset().top + "px",
                    left: $(event.currentTarget).offset().left + "px",
                    width: $(event.currentTarget).width() + "px",
                    height: $(event.currentTarget).height() + "px"
                });
                $(event.currentTarget).addClass('dragPlaceholder');
            },

            stop: function( event, ui ) {
                $(event.target).removeClass('dragPlaceholder');
            }

        });

        annotationsEditingOptions.find('#CustomAnnotation').append(textElement);

        /* Choose Annotations of other users */

        for (var id in annotationAllSets) {

            if (id === FrameTrail.module('UserManagement').userID) {
                continue;
            }

            var otherUsername =  '',
                otherUserColor = '';
            for (var key in HypervideoModel.annotationSets) {
                if (HypervideoModel.annotationSets[key].id === id) {
                    otherUsername  = HypervideoModel.annotationSets[key].name;
                    otherUserColor = HypervideoModel.annotationSets[key].color;
                }
            }

            var userTimelineWrapper = $(    '<div class="userTimelineWrapper">'
                                        +   '    <div class="userLabel" style="color: #'+ otherUserColor +'">'
                                        +   '        <span class="icon-user"></span>'
                                        +   '        <span>'+ otherUsername + '</span>'
                                        +   '    </div>'
                                        +   '    <div class="userTimeline"></div>'
                                        +   '</div>'),
                userTimeline = userTimelineWrapper.find('.userTimeline');

            for (var idx in annotationAllSets[id]) {

                var compareTimelineItem = annotationAllSets[id][idx].renderCompareTimelineItem();
                    compareTimelineItem.css('background-color', '#' + otherUserColor);

                userTimeline.append(compareTimelineItem);

            }

            timelineList.append(userTimelineWrapper);

        }




    }



    /**
     * When the editMode 'annotations' has been entered, the
     * annotation timeline should be droppable for new items
     * (from the ResourcePicker or from other users' timelines).
     * A drop event should trigger the process of creating a new annotation.
     * My parameter is true or false to activate or deactivate this behavior.
     * @method makeTimelineDroppable
     * @param {Boolean} droppable
     */
    function makeTimelineDroppable(droppable) {

        if (droppable) {

            ViewVideo.AnnotationTimeline.droppable({
                accept:         '.resourceThumb, .compareTimelineElement',
                activeClass:    'droppableActive',
                hoverClass:     'droppableHover',
                tolerance:      'touch',

                over: function( event, ui ) {
                    ViewVideo.PlayerProgress.find('.ui-slider-handle').addClass('highlight');
                },

                out: function( event, ui ) {
                    ViewVideo.PlayerProgress.find('.ui-slider-handle').removeClass('highlight');
                },

                drop: function( event, ui ) {

                    var resourceID      = ui.helper.attr('data-resourceID'),
                        videoDuration   = FrameTrail.module('HypervideoModel').duration,
                        startTime,
                        endTime,
                        newAnnotation;

                        if (ui.helper.hasClass('compareTimelineElement')) {

                            startTime   = parseFloat(ui.helper.attr('data-start'));
                            endTime     = parseFloat(ui.helper.attr('data-end'));

                        } else {

                            startTime   = FrameTrail.module('HypervideoController').currentTime;
                            endTime     = (startTime + 4 > videoDuration)
                                            ? videoDuration
                                            : startTime + 4;
                        }

                        if (ui.helper.attr('data-type') == 'text') {

                            newAnnotation = FrameTrail.module('HypervideoModel').newAnnotation({
                                "name":         "Custom Text/HTML",
                                "type":         ui.helper.attr('data-type'),
                                "start":        startTime,
                                "end":          endTime,
                                "attributes":   {
                                    "text":         ""
                                }
                            });

                        } else if (!resourceID) {

                            var resourceData = ui.helper.data('originResourceData');

                            newAnnotation = FrameTrail.module('HypervideoModel').newAnnotation({
                                "name":         resourceData.name,
                                "type":         resourceData.type,
                                "src":          resourceData.src,
                                "thumb":        resourceData.thumb,
                                "start":        startTime,
                                "end":          endTime,
                                "attributes":   resourceData.attributes,
                                "tags":         resourceData.tags
                            });

                        } else {

                            newAnnotation = FrameTrail.module('HypervideoModel').newAnnotation({
                                "start":        startTime,
                                "end":          endTime,
                                "resourceId":   resourceID
                            });

                        }

                    newAnnotation.renderInDOM();
                    newAnnotation.startEditing();
                    updateStatesOfAnnotations(FrameTrail.module('HypervideoController').currentTime);

                    stackTimelineView();


                    ViewVideo.PlayerProgress.find('.ui-slider-handle').removeClass('highlight');

                }


            });

        } else {

            ViewVideo.AnnotationTimeline.droppable('destroy');

        }

    }


    /**
     * I am the starting point for the process of deleting
     * an annotation.
     * @method deleteAnnotation
     * @param {Annotation} annotation
     */
    function deleteAnnotation(annotation) {

        setAnnotationInFocus(null);
        annotation.removeFromDOM();
        //distributeTiles();
        FrameTrail.module('HypervideoModel').removeAnnotation(annotation);

        stackTimelineView();

    }


    /**
     * I react to a change in the global state "userColor"
     * @method changeUserColor
     * @param {String} color
     */
    function changeUserColor(newColor) {

        var annotationSets = HypervideoModel.annotationSets;

        for (var idx in annotationSets) {

            if (annotationSets[idx].id == FrameTrail.module('UserManagement').userID && newColor.length > 1) {
                annotationSets[idx].color = newColor;
            }

        }

        if (newColor.length > 1) {

            // REFRESH COLOR VALUES SOMEWHERE

        }

    }


    return {

        onChange: {
            editMode:        toggleEditMode,
            viewSize:        changeViewSize,
            viewSizeChanged: onViewSizeChanged,
            userColor:       changeUserColor,
        },

        initController:             initController,
        updateController:           updateController,
        updateStatesOfAnnotations:  updateStatesOfAnnotations,
        stackTimelineView:          stackTimelineView,

        deleteAnnotation:           deleteAnnotation,

        findTopMostActiveAnnotation: findTopMostActiveAnnotation,
        renderPropertiesControls:    renderPropertiesControls,

        /**
         * An annotation can be selected to be
         * the annotationInFocus (either by clicking or dragging/resizing).
         * The annotation then displays additional controls in the #EditPropertiesControls
         * element of {{#crossLink "ViewVideo"}}ViewVideo{{/crossLink}}
         * @attribute annotationInFocus
         * @type Annotation or null
         */
        set annotationInFocus(annotation) { return setAnnotationInFocus(annotation) },
        get annotationInFocus()           { return annotationInFocus                },

        /**
         * I hold the callback function for start time (annotation.data.start) of the properties controls interface
         * (see {{#crossLink "AnnotationsController/renderPropertiesControls:method"}}renderPropertiesControls{{/crossLink}}).
         *
         * I am called from the "drag" event handler in {{#crossLink "Annotation/makeTimelineElementDraggable:method"}}Annotation/makeTimelineElementDraggable(){{/crossLink}}
         * and from the "resize" event handler in {{#crossLink "Annotation/makeTimelineElementResizeable:method"}}Annotation/makeTimelineElementResizeable(){{/crossLink}}.
         *
         * @attribute updateControlsStart
         * @type Function
         * @readOnly
         */
        get updateControlsStart()      {  return updateControlsStart     },
        /**
         * I hold the callback function for end time (annotation.data.end) of the properties controls interface
         * (see {{#crossLink "AnnotationsController/renderPropertiesControls:method"}}renderPropertiesControls{{/crossLink}}).
         *
         * I am called from the "drag" event handler in {{#crossLink "Annotation/makeTimelineElementDraggable:method"}}Annotation/makeTimelineElementDraggable(){{/crossLink}}
         * and from the "resize" event handler in {{#crossLink "Annotation/makeTimelineElementResizeable:method"}}Annotation/makeTimelineElementResizeable(){{/crossLink}}.
         *
         * @attribute updateControlsEnd
         * @type Function
         * @readOnly
         */
        get updateControlsEnd()        {  return updateControlsEnd       },


        /**
         * An annotation can be opened.
         * This means it opens the AnnotationsConatiner, where it has
         * already rendered its content (the annotationElement) into.
         * @attribute openedAnnotation
         * @type Annotation or null
         */
        get openedAnnotation()           { return openedAnnotation                },
        set openedAnnotation(annotation) { return setOpenedAnnotation(annotation) }

    };

});
