/**
 * @module Shared
 */


/**
 * I am the type definition of a Resource.
 *
 * I am an abstract type, I should not be instantiated directly but rather my sub-types:
 * * {{#crossLink "ResourceImage"}}ResourceImage{{/crossLink}}
 * * {{#crossLink "ResourceLocation"}}ResourceLocation{{/crossLink}}
 * * {{#crossLink "ResourceVideo"}}ResourceVideo{{/crossLink}}
 * * {{#crossLink "ResourceVimeo"}}ResourceVimeo{{/crossLink}}
 * * {{#crossLink "ResourceWebpage"}}ResourceWebpage{{/crossLink}}
 * * {{#crossLink "ResourceWikipedia"}}ResourceWikipedia{{/crossLink}}
 * * {{#crossLink "ResourceYoutube"}}ResourceYoutube{{/crossLink}}
 * * {{#crossLink "ResourceText"}}ResourceText{{/crossLink}}
 *
 * @class Resource
 * @category TypeDefinition
 * @abstract
 */



FrameTrail.defineType(

    'Resource',

    function(resourceData){



    },

    {
        
        /**
         * I create a preview dialog, call the .renderContent method of a given resource
         * (e.g. {{#crossLink "ResourceImage/renderContent:method"}}ResourceImage/renderContent{{/crossLink}})
         * and append the returned element to the dialog.
         *
         * @method openPreview
         * @param {HTMLElement} elementOrigin
         */
        openPreview: function(elementOrigin) {

            var animationDiv = elementOrigin.clone(),
                originOffset = elementOrigin.offset(),
                finalTop = ($(window).height()/2) - 200,
                finalLeft = ($(window).width()/2) - 320,
                self = this;

            animationDiv.addClass('resourceAnimationDiv').css({
                position: 'absolute',
                top: originOffset.top + 'px',
                left: originOffset.left + 'px',
                width: elementOrigin.width(),
                height: elementOrigin.height(),
                zIndex: 101
            }).appendTo('body');

            animationDiv.animate({
                top: finalTop + 'px',
                left: finalLeft + 'px',
                width: 640 + 'px',
                height: 400 + 'px'
            }, 300, function() {
                var previewDialog   = $('<div class="resourcePreviewDialog" title="'+ self.resourceData.name +'"></div>')
                    .append(self.renderContent());

                previewDialog.dialog({
                    resizable: true,
                    width: 640,
                    height: 400,
                    modal: true,
                    close: function() {
                        $(this).dialog('close');
                        $(this).remove();
                        animationDiv.animate({
                            top: originOffset.top + 'px',
                            left: originOffset.left + 'px',
                            width: elementOrigin.width(),
                            height: elementOrigin.height()
                        }, 300, function() {
                            $('.resourceAnimationDiv').remove();
                        });
                    },
                    closeOnEscape: true,
                    open: function( event, ui ) {
                        if ($(this).find('.resourceDetail').data().map) {
                            $(this).find('.resourceDetail').data().map.updateSize();
                        }
                        $('.ui-widget-overlay').click(function() {
                            previewDialog.dialog('close');
                        });

                    }
                });
            });

        },


        /**
         * When an {{#crossLink "Overlay/gotInFocus:method"}}Overlay got into Focus{{/crossLink}}, its properties and some additional controls to edit the overlay's attributes 
         * should be shown in the right window of the player.
         *
         * I provide a basic method, which can be extended by my sub-types.
         *
         * I render properities controls for the UI for the overlay's following attributes:
         *
         * * overlay.data.start
         * * overlay.data.end
         * * overlay.data.position.top
         * * overlay.data.position.left
         * * overlay.data.position.width
         * * overlay.data.position.height
         * 
         * __Why__ is this function a method of Resource and not Overlay? --> Because there is only one type of Overlay, but this can hold in its resourceData attribute different types of Resources.
         * And because the properties controls can depend on resourceData, the method is placed here and in the sub-types of Resource.
         * 
         * @method renderBasicPropertiesControls
         * @param {Overlay} overlay
         * @return &#123; controlsContainer: HTMLElement, changeStart: Function, changeEnd: Function, changeDimensions: Function &#125;
         */
        renderBasicPropertiesControls: function(overlay) {

            var controlsContainer = $('<div class="controlsWrapper"></div>'),
                manualInputMode   = true,
                defaultControls   = $('<div id="TimeControls">'
                					+ '    <div class="propertiesTypeIcon" data-type="' + overlay.data.type + '"><span class="icon-doc-inv"></span></div>'
                                    + '    <button id="DeleteOverlay">Delete</button>'
                                    + '    <label for="TimeStart">Start</label>'
                                    + '    <input id="TimeStart" value="' + overlay.data.start + '">'
                                    + '    <label for="TimeEnd">End</label>'
                                    + '    <input id="TimeEnd" value="' + overlay.data.end + '">'
                                    + '</div>'
                                    + '<div id="PositionControls">'
                                    + '    <input id="PositionTop" value="' + overlay.data.position.top + '">'
                                    + '    <input id="PositionLeft" value="' + overlay.data.position.left + '">'
                                    + '    <input id="PositionWidth" value="' + overlay.data.position.width + '">'
                                    + '    <input id="PositionHeight" value="' + overlay.data.position.height + '">'
                                    + '</div>'
                                    + '<div id="OverlayOptionsTabs">'
                                    + '    <ul>'
                                    + '        <li><a href="#OverlayOptions">Options</a></li>'
                                    + '        <li><a href="#OverlayAppearance">Appearance</a></li>'
                                    + '        <li class="ui-tabs-right"><a href="#ActionOnEnd">onEnd</a></li>'
                                    + '        <li class="ui-tabs-right"><a href="#ActionOnStart">onStart</a></li>'
                                    + '        <li class="ui-tabs-right"><a href="#ActionOnClick">onClick</a></li>'
                                    + '        <li class="ui-tabs-right"><a href="#ActionOnReady">onReady</a></li>'
                                    + '        <li class="ui-tabs-right tab-label">Actions: </li>'
                                    + '    </ul>'
                                    + '    <div id="OverlayOptions"></div>'
                                    + '    <div id="OverlayAppearance">'
                                    + '        <div style="clear: both;">Opacity</div>'
                                    + '        <div id="OpacitySlider"></div>'
                                    //+ '        <div>Arrange</div>'
                                    //+ '        <button id="ArrangeTop">Move to top</button>'
                                    //+ '        <button id="ArrangeBottom">Move to bottom</button>'
                                    + '    </div>'
                                    + '    <div id="ActionOnReady">'
                                    + '        <textarea id="OnReadyAction" class="codeTextarea" data-eventname="onReady">' + (overlay.data.events.onReady ? overlay.data.events.onReady : '') + '</textarea>'
                                    + '        <button class="executeActionCode">Run Code</button>'
                                    + '        <div class="message active">"this" contains the current overlay object (data, ui elements & states). Example: console.log(this.overlayElement).</div>'
                                    + '    </div>'
                                    + '    <div id="ActionOnClick">'
                                    + '        <textarea id="OnClickAction" class="codeTextarea" data-eventname="onClick">' + (overlay.data.events.onClick ? overlay.data.events.onClick : '') + '</textarea>'
                                    + '        <button class="executeActionCode">Run Code</button>'
                                    + '        <div class="message active">"this" contains the current overlay object (data, ui elements & states). Example: console.log(this.overlayElement).</div>'
                                    + '    </div>'
                                    + '    <div id="ActionOnStart">'
                                    + '        <textarea id="OnStartAction" class="codeTextarea" data-eventname="onStart">' + (overlay.data.events.onStart ? overlay.data.events.onStart : '') + '</textarea>'
                                    + '        <button class="executeActionCode">Run Code</button>'
                                    + '        <div class="message active">"this" contains the current overlay object (data, ui elements & states). Example: console.log(this.overlayElement).</div>'
                                    + '    </div>'
                                    + '    <div id="ActionOnEnd">'
                                    + '        <textarea id="OnEndAction" class="codeTextarea" data-eventname="onEnd">' + (overlay.data.events.onEnd ? overlay.data.events.onEnd : '') + '</textarea>'
                                    + '        <button class="executeActionCode">Run Code</button>'
                                    + '        <div class="message active">"this" contains the current overlay object (data, ui elements & states). Example: console.log(this.overlayElement).</div>'
                                    + '    </div>'
                                    + '</div>');
                                  
            controlsContainer.append(defaultControls);

            controlsContainer.find('#OverlayOptionsTabs').tabs({
                heightStyle: 'auto',
                activate: function(event, ui) {
                    if (ui.newPanel.find('.CodeMirror').length != 0) {
                        ui.newPanel.find('.CodeMirror')[0].CodeMirror.refresh();
                    }
                }
            });

            controlsContainer.find('#TimeStart').spinner({
                step: 0.1,
                min: 0,
                max: FrameTrail.module('HypervideoModel').duration,
                numberFormat: 'n',
                icons: { down: "icon-angle-down", up: "icon-angle-up" },
                create: function(evt, ui) {
                	$(evt.target).parent().attr('data-input-id', $(evt.target).attr('id'));
                },
                spin: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.start = ui.value;
                        overlay.updateTimelineElement();
                        FrameTrail.module('HypervideoController').currentTime = overlay.data.start;
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    }

                    

                },
                change: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.start = $(evt.target).val();
                        overlay.updateTimelineElement();
                        FrameTrail.module('HypervideoController').currentTime = overlay.data.start;
                        FrameTrail.module('OverlaysController').stackTimelineView();
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    } 

                }
            });

            controlsContainer.find('#TimeEnd').spinner({
                step: 0.1,
                min: 0,
                max: FrameTrail.module('HypervideoModel').duration,
                numberFormat: 'n',
                icons: { down: "icon-angle-down", up: "icon-angle-up" },
                create: function(evt, ui) {
                	$(evt.target).parent().attr('data-input-id', $(evt.target).attr('id'));
                },
                spin: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.end = ui.value;
                        overlay.updateTimelineElement();
                        FrameTrail.module('HypervideoController').currentTime = overlay.data.end; 
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    }

                },
                change: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.end = $(evt.target).val();
                        overlay.updateTimelineElement();  
                        FrameTrail.module('HypervideoController').currentTime = overlay.data.end;
                        FrameTrail.module('OverlaysController').stackTimelineView();
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    } 

                }
            });

            controlsContainer.find('#PositionTop').spinner({
                step: 0.1,
                numberFormat: 'n',
                icons: { down: "icon-angle-down", up: "icon-angle-up" },
                create: function(evt, ui) {
                	$(evt.target).parent().attr('data-input-id', $(evt.target).attr('id'));
                },
                spin: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.position.top = ui.value;
                        overlay.updateOverlayElement();
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    }

                },
                change: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.position.top = $(evt.target).val();
                        overlay.updateOverlayElement();  
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    } 

                }
            });

            controlsContainer.find('#PositionLeft').spinner({
                step: 0.1,
                numberFormat: 'n',
                icons: { down: "icon-angle-down", up: "icon-angle-up" },
                create: function(evt, ui) {
                	$(evt.target).parent().attr('data-input-id', $(evt.target).attr('id'));
                },
                spin: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.position.left = ui.value;
                        overlay.updateOverlayElement();
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    }

                },
                change: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.position.left = $(evt.target).val();
                        overlay.updateOverlayElement();  
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    } 

                }
            });

            controlsContainer.find('#PositionWidth').spinner({
                step: 0.1,
                numberFormat: 'n',
                icons: { down: "icon-angle-down", up: "icon-angle-up" },
                create: function(evt, ui) {
                	$(evt.target).parent().attr('data-input-id', $(evt.target).attr('id'));
                },
                spin: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.position.width = ui.value;
                        overlay.updateOverlayElement();
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    }

                },
                change: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.position.width = $(evt.target).val();
                        overlay.updateOverlayElement();  
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    } 

                }
            });

            controlsContainer.find('#PositionHeight').spinner({
                step: 0.1,
                numberFormat: 'n',
                icons: { down: "icon-angle-down", up: "icon-angle-up" },
                create: function(evt, ui) {
                	$(evt.target).parent().attr('data-input-id', $(evt.target).attr('id'));
                },
                spin: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.position.height = ui.value;
                        overlay.updateOverlayElement();
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    }

                },
                change: function(evt, ui) {

                    if(manualInputMode){
                        overlay.data.position.height = $(evt.target).val();
                        overlay.updateOverlayElement();  
                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                    } 

                }
            });

            controlsContainer.find('#OpacitySlider').slider({
                value: (overlay.data.attributes.opacity || 1),
                step: 0.01,
                orientation: "horizontal",
                range: "min",
                min: 0,
                max: 1,
                animate: false,
                create: function() {
                    if ($.isArray(overlay.data.attributes) && overlay.data.attributes.length < 1) {
                        overlay.data.attributes = {};
                    }
                },
                slide:  function(evt, ui) {

                    overlay.data.attributes.opacity = ui.value;

                    overlay.updateOverlayElement();

                    FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');

                }
            });

            controlsContainer.find('#ArrangeTop').click( function() {
                // Move to top
                FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
            });

            controlsContainer.find('#ArrangeBottom').click( function() {
                // Move to bottom
                FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
            });
            
            controlsContainer.find('#DeleteOverlay').click(function(){

                FrameTrail.module('OverlaysController').deleteOverlay(overlay);

            });

            // Init CodeMirror for Actions / Events
            var codeTextareas = controlsContainer.find('.codeTextarea');

            for (var i=0; i<codeTextareas.length; i++) {
                var textarea = codeTextareas.eq(i),
                    codeEditor = CodeMirror.fromTextArea(textarea[0], {
                        value: textarea[0].value,
                        lineNumbers: true,
                        mode:  'javascript',
                        gutters: ['CodeMirror-lint-markers'],
                        lint: true,
                        lineWrapping: true,
                        tabSize: 2,
                        theme: 'hopscotch'
                    });
                codeEditor.on('change', function(instance, changeObj) {
                    
                    var thisTextarea = $(instance.getTextArea());
                    
                    overlay.data.events[thisTextarea.data('eventname')] = instance.getValue();
                    thisTextarea.val(instance.getValue());
                    
                    FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                });
                codeEditor.setSize(null, 124);
            }

            controlsContainer.find('.executeActionCode').click(function(evt) {
                var textarea = $(evt.currentTarget).siblings('textarea');
                try {
                    var testRun = new Function(textarea.val());
                    testRun.call(overlay);
                } catch (exception) {
                    alert('Code contains errors: '+ exception.message);
                }
            });


            var PropertiesControlsInterface = {

                controlsContainer: controlsContainer,
                
                changeStart:  function(val) { 
                    manualInputMode = false;
                    controlsContainer.find('#TimeStart').spinner('value', val);
                    manualInputMode = true;
                },

                changeEnd: function(val) { 
                    manualInputMode = false;
                    controlsContainer.find('#TimeEnd').spinner('value', val);
                    manualInputMode = true;
                },

                changeDimensions: function(val) {
                    manualInputMode = false;
                    controlsContainer.find('#PositionTop').spinner('value', val.top);
                    controlsContainer.find('#PositionLeft').spinner('value', val.left);
                    controlsContainer.find('#PositionWidth').spinner('value', val.width);
                    controlsContainer.find('#PositionHeight').spinner('value', val.height);
                    manualInputMode = true;
                }

            }




            return PropertiesControlsInterface;

        },

        /**
         * When an {{#crossLink "Annotation/gotInFocus:method"}}Annotation got into Focus{{/crossLink}}, its properties and some additional controls attributes 
         * should be shown in the right window of the player.
         *
         * I provide a basic method, which can be extended by my sub-types.
         *
         * I render properities controls for the UI for the annotations's following attributes:
         *
         * * annotation.data.start
         * * annotation.data.end
         * 
         * __Why__ is this function a method of Resource and not Annotation? --> Because there is only one type of Annotation, but this can hold in its resourceData attribute different types of Resources.
         * And because the properties controls can depend on resourceData, the method is placed here and in the sub-types of Resource.
         * 
         * @method renderBasicTimeControls
         * @param {Annotation} annotation
         * @return &#123; controlsContainer: HTMLElement, changeStart: Function, changeEnd: Function &#125;
         */
        renderBasicTimeControls: function(annotation) {

            var controlsContainer = $('<div class="controlsWrapper"></div>'),
                manualInputMode   = true,
                defaultControls   = $('<div id="TimeControls">'
                                    + '    <div class="propertiesTypeIcon" data-type="' + annotation.data.type + '"><span class="icon-doc-inv"></span></div>'
                                    + '    <button id="DeleteAnnotation">Delete</button>'
                                    + '    <label for="TimeStart">Start</label>'
                                    + '    <input id="TimeStart" value="' + annotation.data.start + '">'
                                    + '    <label for="TimeEnd">End</label>'
                                    + '    <input id="TimeEnd" value="' + annotation.data.end + '">'
                                    + '</div>'),
                thumbContainer    = $('<div id="PreviewThumbContainer"></div>'),
                tagManagementUI   = $('<div class="tagManagementUI">'
                                    + '    <hr>'
                                    + '    <label>Manage Tags:</label>'
                                    + '    <div class="existingTags"></div>'
                                    + '    <div class="button small contextSelectButton newTagButton">'
                                    + '        <span class="icon-plus">Add</span>'
                                    + '        <div class="contextSelectList"></div>'
                                    + '    </div>'
                                    + '</div>');

            thumbContainer.append(annotation.resourceItem.renderThumb());
                                  
            controlsContainer.append(defaultControls, thumbContainer, tagManagementUI);

            // Tag Management

            updateExistingTags();

            tagManagementUI.find('.newTagButton').click(function() {
                tagManagementUI.find('.contextSelectButton').not($(this)).removeClass('active');

                updateTagSelectContainer();
                $(this).toggleClass('active');
            });

            function updateExistingTags() {
                tagManagementUI.find('.existingTags').empty();

                for (var i=0; i<annotation.data.tags.length; i++) {
                    
                    var tagLabel = FrameTrail.module('TagModel').getTagLabelAndDescription(annotation.data.tags[i], 'de').label,
                        tagItem = $('<div class="tagItem" data-tag="'+ annotation.data.tags[i] +'">'+ tagLabel +'</div>');
                    var deleteButton = $('<div class="deleteItem"><span class="icon-cancel"></span></div>')
                    deleteButton.click(function() {
                        
                        // Delete tag
                        annotation.data.tags.splice(annotation.data.tags.indexOf($(this).parent().attr('data-tag')), 1);
                        updateExistingTags();
                        FrameTrail.module('HypervideoModel').newUnsavedChange('annotations');
                        
                        FrameTrail.module('ViewLayout').updateManagedContent();
                        FrameTrail.module('ViewLayout').updateContentInContentViews();

                    });
                    tagItem.append(deleteButton);
                    tagManagementUI.find('.existingTags').append(tagItem);

                }
            }

            function updateTagSelectContainer() {
                
                tagManagementUI.find('.newTagButton .contextSelectList').empty();
                
                var allTags = FrameTrail.module('TagModel').getAllTagLabelsAndDescriptions('de');
                for (var tagID in allTags) {
                    if ( annotation.data.tags.indexOf(tagID) != -1 ) {
                        continue;
                    }
                    var tagLabel = allTags[tagID].label,
                        tagItem = $('<div class="tagItem" data-tag="'+ tagID +'">'+ tagLabel +'</div>');
                    tagItem.click(function() {
                        
                        // Add tag
                        annotation.data.tags.push( $(this).attr('data-tag') );
                        updateExistingTags();
                        FrameTrail.module('HypervideoModel').newUnsavedChange('annotations');

                        FrameTrail.module('ViewLayout').updateManagedContent();
                        FrameTrail.module('ViewLayout').updateContentInContentViews();

                    });
                    tagManagementUI.find('.newTagButton .contextSelectList').append(tagItem);
                }

            }

            // Timing

            controlsContainer.find('#TimeStart').spinner({
                step: 0.1,
                min: 0,
                max: FrameTrail.module('HypervideoModel').duration,
                numberFormat: 'n',
                icons: { down: "icon-angle-down", up: "icon-angle-up" },
                create: function(evt, ui) {
                    $(evt.target).parent().attr('data-input-id', $(evt.target).attr('id'));
                },
                spin: function(evt, ui) {

                    if(manualInputMode){
                        annotation.data.start = ui.value;
                        annotation.updateTimelineElement();
                        FrameTrail.module('HypervideoController').currentTime = annotation.data.start;
                        FrameTrail.module('HypervideoModel').newUnsavedChange('annotations');
                    }

                    

                },
                change: function(evt, ui) {

                    if(manualInputMode){
                        annotation.data.start = $(evt.target).val();
                        annotation.updateTimelineElement();
                        FrameTrail.module('HypervideoController').currentTime = annotation.data.start;
                        FrameTrail.module('AnnotationsController').stackTimelineView();
                        FrameTrail.module('HypervideoModel').newUnsavedChange('annotations');
                    } 

                }
            });

            controlsContainer.find('#TimeEnd').spinner({
                step: 0.1,
                min: 0,
                max: FrameTrail.module('HypervideoModel').duration,
                numberFormat: 'n',
                icons: { down: "icon-angle-down", up: "icon-angle-up" },
                create: function(evt, ui) {
                    $(evt.target).parent().attr('data-input-id', $(evt.target).attr('id'));
                },
                spin: function(evt, ui) {

                    if(manualInputMode){
                        annotation.data.end = ui.value;
                        annotation.updateTimelineElement();
                        FrameTrail.module('HypervideoController').currentTime = annotation.data.end; 
                        FrameTrail.module('HypervideoModel').newUnsavedChange('annotations');
                    }

                },
                change: function(evt, ui) {

                    if(manualInputMode){
                        annotation.data.end = $(evt.target).val();
                        annotation.updateTimelineElement();  
                        FrameTrail.module('HypervideoController').currentTime = annotation.data.end;
                        FrameTrail.module('AnnotationsController').stackTimelineView();
                        FrameTrail.module('HypervideoModel').newUnsavedChange('annotations');
                    } 

                }
            });

            controlsContainer.find('#DeleteAnnotation').click(function(){

                FrameTrail.module('AnnotationsController').deleteAnnotation(annotation);

            });

            var PropertiesControlsInterface = {

                controlsContainer: controlsContainer,
                
                changeStart:  function(val) { 
                    manualInputMode = false;
                    controlsContainer.find('#TimeStart').spinner('value', val);
                    manualInputMode = true;
                },

                changeEnd: function(val) { 
                    manualInputMode = false;
                    controlsContainer.find('#TimeEnd').spinner('value', val);
                    manualInputMode = true;
                }

            }




            return PropertiesControlsInterface;

        }

        



    }

);
