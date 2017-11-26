/**
 * @module Player
 */


/**
 * I am the HypervideoModel which stores all data which make up the hypervideo.
 *
 * @class HypervideoModel
 * @static
 */

 FrameTrail.defineModule('HypervideoModel', function(){


    var hasHTML5Video           = true,
        duration                = 0,
        sourceFiles             = {
                                    mp4:  ''
                                  },

        hypervideoName          = '',
        description             = '',
        creator                 = '',
        creatorId               = '',
        created                 = 0,
        lastchanged             = 0,
        hidden                  = false,

        subtitleFiles           = [],
        subtitles               = [],
        selectedLang            = '',

        overlays                = [],

        codeSnippets            = [],
        events                  = {},
        customCSS               = '',

        annotationSets          = {},
        selectedAnnotationSet   = '',
        mainAnnotationSet       = '',

        unsavedSettings         = false;
        unsavedOverlays         = false,
        unsavedCodeSnippets     = false,
        unsavedEvents           = false,
        unsavedCustomCSS        = false,
        unsavedAnnotations      = false;
        unsavedLayout           = false;




    /**
     * The data model is initialized after the {{#crossLink "Database"}}Database{{/crossLink}} is ready
     * and before the different views (like {{#crossLink "ViewVideo"}}ViewVideo{{/crossLink}}) are created.
     *
     * I do the following jobs:
     * * I read in the {{#crossLink "Database/hypervideo:attribute"}}hypervideo metadata{{/crossLink}}, and store them in my attributes (like name, description, creator)
     * * I read in the {{#crossLink "Database/hypervideo:attribute"}}configuration of the hypervideo{{/crossLink}} (hypervideo.config) and set the key-value-pairs as global state (FrameTrail.changeState())
     * * I read in the sequence data of the hypervideo, and set the video source file (mp4), or – when their is no resourceId for a video – I set the {{#crossLink "HypervideoModel/duration:attribute"}}duration{{/crossLink}} attribute for a "null video".
     * * I call {{#crossLink "HypervideoModel/initModelOfOverlays:method"}}initModelOfOverlays{{/crossLink}}, {{#crossLink "HypervideoModel/initModelOfCodeSnippets:method"}}initModelOfCodeSnippets{{/crossLink}} and {{#crossLink "HypervideoModel/initModelOfAnnotations:method"}}initModelOfAnnotations{{/crossLink}}.
     * * I return control to the callback.
     *
     * @method initModel
     * @param {Function} callback
     */
    function initModel(callback) {


        var database   = FrameTrail.module('Database'),
            hypervideo = database.hypervideo,
            sequence   = database.sequence,
            videoData  = sequence.clips[0];


        // Read in metadata
        hypervideoName = hypervideo.name;
        description    = hypervideo.description;
        creator        = hypervideo.creator;
        creatorId      = hypervideo.creatorId;
        created        = hypervideo.created;
        lastchanged    = hypervideo.lastchanged;
        hidden         = hypervideo.hidden;

        // Read in config of Hypervideo
        for (var key in hypervideo.config) {

            if (key === 'layoutArea' || key === 'theme') { continue; }

            FrameTrail.changeState('hv_config_' + key, hypervideo.config[key]);
        }

        // Set video source or NullVideo
        if (!videoData.resourceId) {

            hasHTML5Video = false;
            duration      = videoData.duration;


        } else {

            sourceFiles.mp4  = database.resources[videoData.resourceId].src;

        }

        // Set subtitle files
        subtitleFiles        = hypervideo.subtitles;

        initModelOfOverlays(database);
        initModelOfCodeSnippets(database);
        initModelOfAnnotations(database);
        initModelOfSubtitles(database);


        // Show warning if user tries to leave the page without having saved changes
        $(window).on('beforeunload', function(e) {
            if ( FrameTrail.getState('unsavedChanges') ) {
                // This message is not actually shown to the user in most cases, but the browser needs a return value
                var message = "You have not saved your changes. Are you sure you want to leave the page?";
                return message;
            }
        });


        callback.call()


    };


    /**
     * I create the {{#crossLink "Overlay"}}Overlay{{/crossLink}} objects from the data in the {{#crossLink "Database"}}Database{{/crossLink}} and store them
     * in my {{#crossLink "HypervideoModel/overlays:attribute"}}overlays{{/crossLink}} attribute.
     *
     * @method initModelOfOverlays
     * @param {Database} database
     * @private
     */
    function initModelOfOverlays(database) {

        for (var idx in database.overlays) {

            overlays.push(
                FrameTrail.newObject('Overlay',
                    database.overlays[idx]
                )
            );

        }


    };

    /**
     * I create the {{#crossLink "CodeSnippet"}}CodeSnippet{{/crossLink}} objects from the data in the {{#crossLink "Database"}}Database{{/crossLink}} and store them
     * in my {{#crossLink "HypervideoModel/codeSnippets:attribute"}}codeSnippets{{/crossLink}} attribute.
     *
     * @method initModelOfCodeSnippets
     * @param {Database} database
     * @private
     */
    function initModelOfCodeSnippets(database) {

        for (var idx in database.codeSnippets.timebasedEvents) {

            codeSnippets.push(
                FrameTrail.newObject('CodeSnippet',
                    database.codeSnippets.timebasedEvents[idx]
                )
            );
        }

        events = database.codeSnippets.globalEvents;

        customCSS = database.codeSnippets.customCSS;


    };

    /**
     * I create the {{#crossLink "Annotation"}}Annotation{{/crossLink}} objects from the data in the {{#crossLink "Database"}}Database{{/crossLink}} and store them
     * in my {{#crossLink "HypervideoModel/annotations:attribute"}}annotations{{/crossLink}} attribute.
     *
     * Also I select the the main annotation set (from the user who created the hypervideo) as the current one.
     *
     * @method initModelOfAnnotations
     * @param {Database} database
     * @private
     */
    function initModelOfAnnotations(database) {

        // clear previous data
        annotationSets = {};

        for (var ownerId in database.annotations) {

            annotationSets[ownerId] = [];

            for (var idx in database.annotations[ownerId]) {

                annotationSets[ownerId].push(
                    FrameTrail.newObject('Annotation',
                        database.annotations[ownerId][idx]
                    )
                );

            }

        }


        for (var ownerId in database.annotationfileIDs) {
            if (database.annotationfileIDs[ownerId] === FrameTrail.module('Database').hypervideo.mainAnnotation) {
                selectedAnnotationSet = mainAnnotationSet = ownerId;
            }
        }


    };


    /**
     * I create the {{#crossLink "Subtitle"}}Subtitle{{/crossLink}} objects from the data in the {{#crossLink "Database"}}Database{{/crossLink}} and store them
     * in my {{#crossLink "HypervideoModel/subtitles:attribute"}}subtitles{{/crossLink}} attribute.
     *
     * @method initModelOfSubtitles
     * @param {Database} database
     */
    function initModelOfSubtitles(database) {

        for (var lang in database.subtitles) {

            subtitles[lang] = [];

            for (var idx in database.subtitles[lang].cues) {

                subtitles[lang].push(
                    FrameTrail.newObject('Subtitle',
                        database.subtitles[lang].cues[idx]
                    )
                );


            }
        }

        if (subtitles['en']) {
            selectedLang = 'en';
        } else if ( !$.isEmptyObject(database.subtitles) ) {
            for (first in database.subtitles) break;
                selectedLang = first;
        }


    };



    /**
     * I remove all data of an overlay from the model and from the database.
     *
     * I am called from {{#crossLink "OverlaysController/deleteOverlay:method"}}OverlaysController/deleteOverlay{{/crossLink}}.
     *
     * @method removeOverlay
     * @param {Overlay} overlay
     */
    function removeOverlay(overlay) {

        var idx;

        idx = overlays.indexOf(overlay);
        overlays.splice(idx, 1);

        idx = FrameTrail.module('Database').overlays.indexOf(overlay.data);
        FrameTrail.module('Database').overlays.splice(idx, 1);

        newUnsavedChange('overlays');

    };

    /**
     * I remove all data of a code snippet from the model and from the database.
     *
     * I am called from {{#crossLink "CodeSnippetsController/deleteCodeSnippet:method"}}CodeSnippetsController/deleteCodeSnippet{{/crossLink}}.
     *
     * @method removeCodeSnippet
     * @param {CodeSnippet} codeSnippet
     */
    function removeCodeSnippet(codeSnippet) {

        var idx;

        idx = codeSnippets.indexOf(codeSnippet);
        codeSnippets.splice(idx, 1);

        idx = FrameTrail.module('Database').codeSnippets.timebasedEvents.indexOf(codeSnippet.data);
        FrameTrail.module('Database').codeSnippets.timebasedEvents.splice(idx, 1);

        newUnsavedChange('codeSnippets');

    };


    /**
     * I remove all data of an annotation from the model and from the database.
     *
     * I am called from {{#crossLink "AnnotationsController/deleteAnnotation:method"}}AnnotationsController/deleteAnnotation{{/crossLink}}.
     *
     * @method removeAnnotation
     * @param {Annotation} annotation
     */
    function removeAnnotation(annotation) {

        var database = FrameTrail.module('Database'),
            idx;

        idx = annotationSets[selectedAnnotationSet].indexOf(annotation);
        annotationSets[selectedAnnotationSet].splice(idx, 1);

        if (database.annotations[selectedAnnotationSet]) {
            idx = database.annotations[selectedAnnotationSet].indexOf(annotation.data);
            database.annotations[selectedAnnotationSet].splice(idx, 1);
        }

        newUnsavedChange('annotations');

    };


    /**
     * I create a new {{#crossLink "Overlay"}}overlay{{/crossLink}}.
     *
     * I am called from {{#crossLink "OverlaysController/makeTimelineDroppable:method"}}OverlaysController{{/crossLink}}.
     *
     * @method newOverlay
     * @param {} protoData
     * @return Overlay
     */
    function newOverlay(protoData) {

        var resourceDatabase = FrameTrail.module('Database').resources,
            newOverlay,
            newData;

            // TODO: clean code
            if ( protoData.type == 'text' ) {
                newData = {
                    "name":         protoData.name,
                    "creator":      FrameTrail.getState('username'),
                    "creatorId":    FrameTrail.module('UserManagement').userID,
                    "created":      Date.now(),
                    "type":         protoData.type,
                    "src":          '',
                    "start":        protoData.start,
                    "end":          protoData.end,
                    "attributes":   protoData.attributes,
                    "position": {
                        "top":      protoData.position.top,
                        "left":     protoData.position.left,
                        "width":    30,
                        "height":   30
                    }
                }
            } else {
                newData = {
                    "name":         resourceDatabase[protoData.resourceId].name,
                    "creator":      FrameTrail.getState('username'),
                    "creatorId":    FrameTrail.module('UserManagement').userID,
                    "created":      Date.now(),
                    "type":         resourceDatabase[protoData.resourceId].type,
                    "src":          resourceDatabase[protoData.resourceId].src,
                    "thumb":        resourceDatabase[protoData.resourceId].thumb,
                    "start":        protoData.start,
                    "end":          protoData.end,
                    "startOffset":  0,
                    "endOffset":    0,
                    "resourceId":   protoData.resourceId,
                    "attributes":   resourceDatabase[protoData.resourceId].attributes,
                    "position": {
                        "top":      protoData.position.top,
                        "left":     protoData.position.left,
                        "width":    30,
                        "height":   30
                    }
                }
            }

            FrameTrail.module('Database').overlays.push(newData);
            newOverlay = FrameTrail.newObject('Overlay', newData)
            overlays.push(newOverlay);

            newUnsavedChange('overlays');

            return newOverlay;

    };

    /**
     * I create a new {{#crossLink "CodeSnippet"}}code snippet{{/crossLink}}.
     *
     * I am called from {{#crossLink "CodeSnippetsController/makeTimelineDroppable:method"}}CodeSnippetsController{{/crossLink}}.
     *
     * @method newCodeSnippet
     * @param {} protoData
     * @return CodeSnippet
     */
    function newCodeSnippet(protoData) {

        var newCodeSnippet,

            newData = {
                            "name":         protoData.name,
                            "creator":      FrameTrail.getState('username'),
                            "creatorId":    FrameTrail.module('UserManagement').userID,
                            "created":      Date.now(),
                            "snippet":      protoData.snippet,
                            "start":        protoData.start,
                            "attributes":   {}
                        };


            FrameTrail.module('Database').codeSnippets.timebasedEvents.push(newData);
            newCodeSnippet = FrameTrail.newObject('CodeSnippet', newData)
            codeSnippets.push(newCodeSnippet);

            newUnsavedChange('codeSnippets');

            return newCodeSnippet;

    };


    /**
     * I create a new {{#crossLink "Annotation"}}annotation{{/crossLink}}.
     *
     * I am called from {{#crossLink "AnnotationsController/makeTimelineDroppable:method"}}AnnotationsController{{/crossLink}}.
     *
     * @method newAnnotation
     * @param {} protoData
     * @return Annotation
     */
    function newAnnotation(protoData) {

        var newAnnotation,
            database         = FrameTrail.module('Database'),
            resourceDatabase = database.resources,
            ownerId          = FrameTrail.module('UserManagement').userID,

            newData = {
                            "name":         resourceDatabase[protoData.resourceId].name,
                            "creator":      FrameTrail.getState('username'),
                            "creatorId":    FrameTrail.module('UserManagement').userID,
                            "created":      Date.now(),
                            "type":         resourceDatabase[protoData.resourceId].type,
                            "src":          resourceDatabase[protoData.resourceId].src,
                            "thumb":        resourceDatabase[protoData.resourceId].thumb,
                            "start":        protoData.start,
                            "end":          protoData.end,
                            "resourceId":   protoData.resourceId,
                            "attributes":   resourceDatabase[protoData.resourceId].attributes,
                            "tags":         []
                        };

            if (!database.annotations[ownerId]) {
                database.annotations[ownerId] = []
            }
            FrameTrail.module('Database').annotations[ownerId].push(newData);


            if (!annotationSets[ownerId]) {
                annotationSets[ownerId] = []
            }
            newAnnotation = FrameTrail.newObject('Annotation', newData);
            annotationSets[ownerId].push(newAnnotation);

            newUnsavedChange('annotations');

            return newAnnotation;

    };


    /**
     * When the {{#crossLinks "HypervideoModel/codeSnippets:attribute"}}attribute codeSnippets{{/crossLinks}} is accessed,
     * it needs to return the code snippet objects in an array, which is sorted by the start time. This is what I do.
     *
     * @method getCodeSnippets
     * @return Array of CodeSnippets
     * @private
     */
    function getCodeSnippets() {

        return codeSnippets.sort(function(a, b){

            if(a.data.start > b.data.start) {
                return 1;
            } else if(a.data.start < b.data.start) {
                return -1;
            } else {
                return 0;
            }

        });

    };


    /**
     * Updates the {{#crossLinks "HypervideoModel/events:attribute"}}attribute events{{/crossLinks}}
     * and the respective Database value.
     * I am called from {{#crossLink "CodeSnippetsController/initEditOptions:method"}}CodeSnippetsController{{/crossLink}}.
     *
     * @method updateEvents
     * @return Object of Events
     * @private
     */
    function updateEvents(eventObject) {

        var database = FrameTrail.module('Database');

        database.codeSnippets.globalEvents = eventObject;
        events = eventObject;

        newUnsavedChange('events');

        return events;

    };


    /**
     * Updates the {{#crossLinks "HypervideoModel/customCSS:attribute"}}attribute customCSS{{/crossLinks}}
     * and the respective Database value.
     * I am called from {{#crossLink "CodeSnippetsController/initEditOptions:method"}}CodeSnippetsController{{/crossLink}}.
     *
     * @method updateCustomCSS
     * @return String
     * @private
     */
    function updateCustomCSS(cssString) {

        var database = FrameTrail.module('Database');

        database.codeSnippets.customCSS = cssString;
        customCSS = cssString;

        newUnsavedChange('customCSS');

        return cssString;

    };



    /**
     * Needed for the {{#crossLinks "HypervideoModel/annotationSets:attribute"}}annotationSets attribute{{/crossLinks}}.
     * This attribute' purpose is to tell, what users have an annotationfile for the current hypervideo.
     *
     * I return an array of maps in the format
     *
     *     [ { id: ownerid, name: ownerName }, ... ]
     *
     *
     * @method getAnnotationSets
     * @return Array of { id: ownerId, name: ownerName}
     * @private
     */
    function getAnnotationSets() {

        var database = FrameTrail.module('Database'),
            ids = [],
            ownerName,
            ownerColor,
            hypervideoIndexItem,
            annotationfileId;

        for (var ownerId in annotationSets) {

            annotationfileId    = database.annotationfileIDs[ownerId];
            hypervideoIndexItem = database.hypervideo.annotationfiles[annotationfileId];

            if (hypervideoIndexItem) {

                ownerName  = hypervideoIndexItem.owner;
                ownerColor = FrameTrail.module('Database').users[ownerId].color;

            } else if (ownerId === FrameTrail.module('UserManagement').userID) {

                ownerName  = FrameTrail.getState('username');
                ownerColor = FrameTrail.getState('userColor');

            } else {

                ownerName  = 'unknown';
                ownerColor = 'FFFFFF';

            }


            ids.push({
                id:      ownerId,
                name:    ownerName,
                color:   ownerColor
            });

        }

        return ids;

    };



    /**
     * When the {{#crossLinks "HypervideoModel/annotations:attribute"}}attribute annotations{{/crossLinks}} is accessed,
     * it needs to return an array of the currently selected annotation set (choosen by assigning the annotation's ownerId to {{#crossLinks "HypervideoModel/annotationSet:attribute"}}annotationSet{{/crossLinks}}).
     * The array needs to be sorted by the start time.
     *
     * @method getAnnotations
     * @return Array of Annotations
     * @private
     */
    function getAnnotations() {

        return annotationSets[selectedAnnotationSet].sort(function(a, b){

            if(a.data.start > b.data.start) {
                return 1;
            } else if(a.data.start < b.data.start) {
                return -1;
            } else {
                return 0;
            }

        });

    };



    /**
     * When the {{#crossLinks "HypervideoModel/allAnnotations:attribute"}}attribute allAnnotations{{/crossLinks}} is accessed,
     * it needs to return an array of all annotations by all users.
     * The array needs to be sorted by the start time.
     *
     * @method getAllAnnotations
     * @return Array of Annotations
     * @private
     */
    function getAllAnnotations() {
        
        var userSets = getAnnotationSets(),
            allAnnotations = new Array();
        
        for (var i=0; i<userSets.length; i++) {
            var userSet = annotationSets[userSets[i].id];
            allAnnotations = allAnnotations.concat(userSet);
        }
        
        return allAnnotations.sort(function(a, b){

            if(a.data.start > b.data.start) {
                return 1;
            } else if(a.data.start < b.data.start) {
                return -1;
            } else {
                return 0;
            }

        });

    };



    /**
     * I am needed by the {{#crossLinks "HypervideoModel/annotationSet:attribute"}}annotationSet attribute{{/crossLinks}}.
     *
     * My parameter can be set in three ways:
     * * when the argument is null, I select the main annotation file (from the hypervideo's _index.json entry)
     * * when the special string '#myAnnotationSet' is given as argument, I select the logged-in user's ID
     * * an all other cases, I take the literal string as the ID to select.
     *
     * When my user changes the currently selected annotation sets, I have to assure, that both myself and the
     * {{#crossLinks "Database"}}Database{{/crossLinks}} have under the respective attribute name an [Array] present, for
     * manipulating annotation objects inside them.
     *
     * @method selectAnnotationSet
     * @param {String or null} anID
     * @return String
     * @private
     */
    function selectAnnotationSet(anID) {

        var database = FrameTrail.module('Database'),
            selectID;


        if (anID === null) {

            return selectedAnnotationSet = mainAnnotationSet;

        }


        if (anID === '#myAnnotationSet') {

            selectID = FrameTrail.module('UserManagement').userID;

        } else {

            selectID = anID;

        }


        if (!annotationSets.hasOwnProperty(selectID)) {

            annotationSets[selectID] = [];

        }

        if (!database.annotations.hasOwnProperty(selectID)) {

            database.annotations[selectID] = [];

        }

        return selectedAnnotationSet = selectID;

    };



    /**
     * When the {{#crossLinks "HypervideoModel/subtitles:attribute"}}attribute subtitles{{/crossLinks}} is accessed,
     * it needs to return an array of the currently selected language subtitles (choosen by assigning the selected language to {{#crossLinks "HypervideoModel/selectedLang:attribute"}}selectedLang{{/crossLinks}}).
     *
     * @method getSubtitles
     * @return Object containing the language label and an Array of Subtitles
     * @private
     */
    function getSubtitles() {

        return subtitles[selectedLang];

    };




    /**
     * I serve the purpose to set markers (both visually and in my data model),
     * in which categories (overlays, annotations, codeSnippets) the user has unsaved changes.
     *
     * @method newUnsavedChange
     * @param {String} category
     */
    function newUnsavedChange(category) {

        if (category === 'settings') {

            unsavedSettings = true;

        } else if (category === 'overlays') {

            unsavedOverlays = true;

        } else if (category === 'codeSnippets') {

            unsavedCodeSnippets = true;

        } else if (category === 'events') {

            unsavedEvents = true;

        } else if (category === 'customCSS') {

            unsavedCustomCSS = true;

        } else if (category === 'annotations') {

            unsavedAnnotations = true;

        } else if (category === 'layout') {

            unsavedLayout = true;
        }

        FrameTrail.module('Sidebar').newUnsavedChange(category);

        FrameTrail.changeState('unsavedChanges', true);

    }


    /**
     * I am the central function for saving changes back to the server.
     *
     * I save only, what is necessary (overlays, annotations, codeSnippets).
     *
     * When all saving requests to the server have completed, I check all their responses.
     * If there where any errors I display them and abort. Otherwise I reset the
     * "unsavedChanges"-markers back to false and the
     * global state (FrameTrail.changeState('unsavedChanges', false)) and call the callback.
     *
     * Note: The second parameter is optional and should not be needed because the user
     * should already be logged in at this point (cancelCallback means, the user canceled the login).
     *
     * @method save
     * @param {Function} callback
     * @param {Function} callbackCancel
     */
    function save(callback, callbackCancel) {

        var saveRequests     = [],
            callbackReturns  = [],
            databaseCallback = function(result) {
                callbackReturns.push(result);
                if(callbackReturns.length === saveRequests.length){
                    saveFinished();
                }
            };


        FrameTrail.module('UserManagement').ensureAuthenticated(

            function(){

                FrameTrail.module('InterfaceModal').showStatusMessage('Saving...');

                if ( unsavedSettings ) {

                    //TODO: avoid this by adding a subtitles dialog to the settings tab
                    $('#EditHypervideoForm').submit();

                } else if ( unsavedOverlays || unsavedCodeSnippets
                    || unsavedEvents || unsavedCustomCSS || unsavedLayout) {
                    saveRequests.push(function(){
                        FrameTrail.module('Database').saveHypervideo(databaseCallback);
                    });
                }

                if (unsavedAnnotations) {
                    saveRequests.push(function(){
                        FrameTrail.module('Database').saveAnnotations(databaseCallback);
                    });
                }

                for (var i in saveRequests) {
                    saveRequests[i].call();
                }

                // deal with save requests without unsaved data (just satisfying ux)
                if (saveRequests.length === 0) {
                    saveFinished();
                }

            },

            function(){
                if (callbackCancel) {
                    callbackCancel.call();
                }
            }

        );

        function saveFinished() {

            for (var result in callbackReturns) {

                if (result.failed) {
                    // to do: detailed error reporting to the user
                    FrameTrail.module('InterfaceModal').showErrorMessage('Error: Could not save data.');
                    return;
                }

            }

            FrameTrail.module('InterfaceModal').showSuccessMessage('Changes have been saved.');
            FrameTrail.module('InterfaceModal').hideMessage(2000);

            unsavedSettings     = false;
            unsavedOverlays     = false;
            unsavedCodeSnippets = false;
            unsavedEvents       = false;
            unsavedCustomCSS    = false;
            unsavedAnnotations  = false;
            unsavedLayout       = false;
            FrameTrail.changeState('unsavedChanges', false)

            if (callback) {
                callback.call();
            }

        };



    }


    /**
     * The global state "editMode" can be set to false, to trigger all modules to leave their edit mode.
     *
     * __However__, this global state should only be altered by me, because I check first if there were any unsaved changes,
     * and offer the user the possibility to save them.
     *
     * @method leaveEditMode
     * @param {Boolean} logoutAfterLeaving
     */
    function leaveEditMode(logoutAfterLeaving) {

        if (FrameTrail.getState('unsavedChanges')){

                var confirmDialog = $('<div id="ConfirmSaveChanges" title="Save changes?">'
                                    + '    <div class="message active">Your changes in the current video will be lost if you don\'t save them.</div>'
                                    + '    <p>Do you want to save your changes?</p>'
                                    + '</div>');

                confirmDialog.dialog({
                  resizable: false,
                  modal: true,
                  close: function() {
                    confirmDialog.remove();
                  },
                  buttons: {
                    'Yes': function() {

                        // TODO: Show saving indicator in dialog

                        save(function(){
                            FrameTrail.changeState('editMode', false);
                            confirmDialog.dialog('close');

                            if (logoutAfterLeaving) {
                                FrameTrail.module('UserManagement').logout();
                            }

                            window.location.reload();

                            if (logoutAfterLeaving) {
                                FrameTrail.module('UserManagement').logout();
                            }
                        });

                    },
                    'No, discard': function() {

                        FrameTrail.changeState('unsavedChanges', false);
                        confirmDialog.dialog('close');

                        if (logoutAfterLeaving) {
                            FrameTrail.module('UserManagement').logout();
                        }

                        window.location.reload();

                    },
                    Cancel: function() {
                      confirmDialog.dialog('close');
                    }
                  }
                });

        } else {

            FrameTrail.changeState('editMode', false);

            if (logoutAfterLeaving) {
                FrameTrail.module('UserManagement').logout();
            }

        }

    }



    /**
     * Reset & Update Hypervideo Data during runtime
     *
     * @method updateHypervideo
     * @param {String} newHypervideoID
     * @param {Boolean} restartEditMode
     * @param {Boolean} update
     */
    function updateHypervideo(newHypervideoID, restartEditMode, update) {

        FrameTrail.module('InterfaceModal').showStatusMessage('Loading ...');

        if ( FrameTrail.module('HypervideoController') ) {
            FrameTrail.module('HypervideoController').pause();
            FrameTrail.module('HypervideoController').clearIntervals();
        }

        //TODO: Implement proper destroy method
        $('#MainContainer #ViewVideo').remove();
        ra = false;

        FrameTrail.module('RouteNavigation').hypervideoID = newHypervideoID;
        FrameTrail.module('RouteNavigation').hashTime = undefined;

        FrameTrail.module('Database').updateHypervideoData(function() {

            FrameTrail.initModule('ViewVideo');
            FrameTrail.initModule('HypervideoModel');
            FrameTrail.initModule('HypervideoController');

            FrameTrail.module('HypervideoModel').initModel(function(){


                FrameTrail.module('ViewLayout').create();
                FrameTrail.module('ViewVideo').create();

                FrameTrail.module('HypervideoController').initController(

                    function(){

                        FrameTrail.changeState('viewMode', 'video');

                        if (restartEditMode) {
                            FrameTrail.changeState('editMode', 'preview');
                        }

                        FrameTrail.module('InterfaceModal').hideMessage(600);

                        window.setTimeout(function() {
                            //FrameTrail.changeState('viewSize', FrameTrail.getState('viewSize'));
                            $(window).resize();
                        }, 300);

                    },

                    function(errorMsg){
                        FrameTrail.module('InterfaceModal').showErrorMessage(errorMsg);
                    },
                    update

                );

            }, function(errorMsg) {
                FrameTrail.module('InterfaceModal').showErrorMessage(errorMsg);
            });


        }, function() {
            console.log('FAIL');
        });

    }


    /**
     * Initialize Hypervideo Settings
     * (triggered when global state editMode changes to 'settings')
     * 
     * TODO: Move to separate module
     * 
     * @method initHypervideoSettings
     */
    function initHypervideoSettings() {

        var database   = FrameTrail.module('Database'),
            hypervideo = database.hypervideo,
            thisID     = FrameTrail.module('RouteNavigation').hypervideoID,
            projectID  = FrameTrail.module('RouteNavigation').projectID,
            EditingOptions = FrameTrail.module('ViewVideo').EditingOptions;

        EditingOptions.empty();

        var settingsEditingOptions = $('<div id="SettingsEditingTabs">'
                                    +  '    <ul>'
                                    +  '        <li>'
                                    +  '            <a href="#ChangeSettings">Change Settings</a>'
                                    +  '        </li>'
                                    +  '        <li>'
                                    +  '            <a href="#ChangeTheme">Change Color Theme</a>'
                                    +  '        </li>'
                                    +  '        <li>'
                                    +  '            <a href="#ChangeCSSVariables">Edit CSS Variables</a>'
                                    +  '        </li>'
                                    +  '    </ul>'
                                    +  '    <div id="ChangeSettings"></div>'
                                    +  '    <div id="ChangeTheme"></div>'
                                    +  '    <div id="ChangeCSSVariables"></div>'
                                    +  '</div>')
                                    .tabs({
                                        heightStyle: "fill",
                                        activate: function(event, ui) {
                                            if (ui.newPanel.find('.CodeMirror').length != 0) {
                                                ui.newPanel.find('.CodeMirror')[0].CodeMirror.refresh();
                                            }
                                        }
                                  });

        EditingOptions.append(settingsEditingOptions);

        /* Edit Hypervideo Form */

        
        var EditHypervideoForm = $('<form method="POST" id="EditHypervideoForm">'
                                  +'    <div class="message saveReminder">Please save your settings right now to update the subtitle settings.</div>'
                                  +'    <div class="formColumn column1">'
                                  +'        <label for="name">Hypervideo Name</label>'
                                  +'        <input type="text" name="name" placeholder="Name of Hypervideo" value="'+ hypervideoName +'"><br>'
                                  +'        <input type="checkbox" name="hidden" id="hypervideo_hidden" value="hidden" '+((hidden.toString() == "true") ? "checked" : "")+'>'
                                  +'        <label for="hypervideo_hidden">Hidden from other users?</label>'
                                  +'    </div>'
                                  +'    <div class="formColumn column1">'
                                  +'        <label for="description">Description</label>'
                                  +'        <textarea name="description" placeholder="Description for Hypervideo">'+ description +'</textarea><br>'
                                  +'    </div>'
                                  +'    <div class="formColumn column2">'
                                  +'    </div>'
                                  +'    <div class="formColumn column2">'
                                  /*
                                  +'        <div>Player Layout:</div>'
                                  +'        <div class="settingsContainer">'
                                  +'            <div class="genericSettingsWrapper">Layout Mode'
                                  +'                <div data-config="slidingMode" class="'+ ((hypervideo.config.slidingMode.toString() == 'overlay') ? 'active' : '') +'">'
                                  +'                    <div class="slidingMode" data-value="adjust">Adjust</div>'
                                  +'                    <div class="slidingMode" data-value="overlay">Overlay</div>'
                                  +'                </div>'
                                  +'            </div>'
                                  +'        </div>'
                                  */
                                  +'        <div class="subtitlesSettingsWrapper">'
                                  +'            <div>Subtitles (also used for interactive transcripts)</div>'
                                  +'            <button id="SubtitlesPlus" type="button">Add +</button>'
                                  +'            <input type="checkbox" name="config[captionsVisible]" id="captionsVisible" value="true" '+((hypervideo.config.captionsVisible && hypervideo.config.captionsVisible.toString() == 'true') ? "checked" : "")+'>'
                                  +'            <label for="captionsVisible">Show by default (if present)</label>'
                                  +'            <div id="ExistingSubtitlesContainer"></div>'
                                  +'            <div id="NewSubtitlesContainer"></div>'
                                  +'        </div>'
                                  +'    </div>'
                                  +'    <div style="clear: both;"></div>'
                                  +'    <div class="message error"></div>'
                                  +'</form>');

        settingsEditingOptions.find('#ChangeSettings').append(EditHypervideoForm);

        if ( hypervideo.subtitles ) {

            var langMapping = database.subtitlesLangMapping;

            for (var i=0; i < hypervideo.subtitles.length; i++) {
                var currentSubtitles = hypervideo.subtitles[i],
                    existingSubtitlesItem = $('<div class="existingSubtitlesItem"><span>'+ langMapping[hypervideo.subtitles[i].srclang] +'</span></div>'),
                    existingSubtitlesDelete = $('<button class="subtitlesDelete" type="button" data-lang="'+ hypervideo.subtitles[i].srclang +'">Delete</button>');

                existingSubtitlesDelete.click(function(evt) {
                    $(this).parent().remove();
                    EditHypervideoForm.find('.subtitlesSettingsWrapper').append('<input type="hidden" name="SubtitlesToDelete[]" value="'+ $(this).attr('data-lang') +'">');

                    updateDatabaseFromForm();
                }).appendTo(existingSubtitlesItem);

                EditHypervideoForm.find('#ExistingSubtitlesContainer').append(existingSubtitlesItem);
            }
        }

        EditHypervideoForm.find('.hypervideoLayout [data-config]').each(function() {

            var tmpVal = '';

            if ( $(this).hasClass('active') ) {

                if ( $(this).attr('data-config') == 'slidingMode' ) {
                    tmpVal = 'overlay';
                } else {
                    tmpVal = 'true';
                }

            } else {

                if ( $(this).attr('data-config') == 'slidingMode' ) {
                    tmpVal = 'adjust';
                } else {
                    tmpVal = 'false';
                }

            }

            if ( !EditHypervideoForm.find('.hypervideoLayout input[name="config['+$(this).attr('data-config')+']"]').length ) {
                EditHypervideoForm.find('.hypervideoLayout').append('<input type="hidden" name="config['+$(this).attr('data-config')+']" data-configkey="'+ $(this).attr('data-config') +'" value="'+tmpVal+'">');
            }

        }).click(function(evt) {


            var config      = $(evt.target).attr('data-config'),
                configState = $(evt.target).hasClass('active'),
                configValue = (configState ? 'false': 'true');

            if ( config != 'slidingMode' ) {

                EditHypervideoForm.find('[name="config['+config+']"]').val(configValue);
                $(evt.target).toggleClass('active');

            } else if ( config == 'slidingMode' ) {

                if ( configState ) {

                    EditHypervideoForm.find('[name="config['+config+']"]').val('adjust');

                } else {

                    EditHypervideoForm.find('[name="config['+config+']"]').val('overlay');

                }

                $(evt.target).toggleClass('active');

            }

            updateDatabaseFromForm();

            evt.preventDefault();
            evt.stopPropagation();
        });

        // Manage Subtitles
        EditHypervideoForm.find('#SubtitlesPlus').on('click', function() {
            var langOptions, languageSelect;

            for (var lang in FrameTrail.module('Database').subtitlesLangMapping) {
                langOptions += '<option value="'+ lang +'">'+ FrameTrail.module('Database').subtitlesLangMapping[lang] +'</option>';
            }

            languageSelect =  '<select class="subtitlesTmpKeySetter">'
                            + '    <option value="" disabled selected style="display:none;">Language</option>'
                            + langOptions
                            + '</select>';

            EditHypervideoForm.find('#NewSubtitlesContainer').append('<span class="subtitlesItem">'+ languageSelect +'<input type="file" name="subtitles[]"><button class="subtitlesRemove" type="button">x</button><br></span>');

            updateDatabaseFromForm();
        });

        EditHypervideoForm.find('#NewSubtitlesContainer').on('click', '.subtitlesRemove', function(evt) {
            $(this).parent().remove();
            updateDatabaseFromForm();
        });

        EditHypervideoForm.find('#NewSubtitlesContainer').on('change', '.subtitlesTmpKeySetter', function() {
            $(this).parent().find('input[type="file"]').attr('name', 'subtitles['+$(this).val()+']');
            updateDatabaseFromForm();
        });

        EditHypervideoForm.find('input, textarea').on('keydown', function() {
            updateDatabaseFromForm();
        });

        EditHypervideoForm.find('input[type="checkbox"]').on('change', function() {
            updateDatabaseFromForm();
        });

        function updateDatabaseFromForm() {
            var DatabaseEntry = FrameTrail.module('Database').hypervideos[thisID];

            DatabaseEntry.name = EditHypervideoForm.find('input[name="name"]').val();
            DatabaseEntry.description = EditHypervideoForm.find('textarea[name="description"]').val();
            DatabaseEntry.hidden = EditHypervideoForm.find('input[name="hidden"]').is(':checked');
            for (var configKey in DatabaseEntry.config) {
                if (configKey === 'layoutArea' || configKey === 'theme') { continue; }
                var newConfigVal = EditHypervideoForm.find('input[data-configkey=' + configKey + ']').val();
                newConfigVal = (newConfigVal === 'true')
                                ? true
                                : (newConfigVal === 'false')
                                    ? false
                                    : (newConfigVal === undefined)
                                        ? DatabaseEntry.config[configKey]
                                        : newConfigVal;
                DatabaseEntry.config[configKey] = newConfigVal;
            }


            FrameTrail.module('Database').hypervideos[thisID].subtitles.splice(0, FrameTrail.module('Database').hypervideos[thisID].subtitles.length);

            EditHypervideoForm.find('.existingSubtitlesItem').each(function () {
                var lang = $(this).find('.subtitlesDelete').attr('data-lang');
                FrameTrail.module('Database').hypervideos[thisID].subtitles.push({
                    "src": lang +".vtt",
                    "srclang": lang
                });
            });

            EditHypervideoForm.find('#NewSubtitlesContainer').find('input[type=file]').each(function () {
                var match = /subtitles\[(.+)\]/g.exec($(this).attr('name'));
                console.log(match);
                if (match) {
                    FrameTrail.module('Database').hypervideos[thisID].subtitles.push({
                        "src": match[1] +".vtt",
                        "srclang": match[1]
                    });
                }
            });

            EditHypervideoForm.find('.message.saveReminder').addClass('active');
            newUnsavedChange('settings');
        }

        EditHypervideoForm.ajaxForm({
            method:     'POST',
            url:        '../_server/ajaxServer.php',
            beforeSubmit: function (array, form, options) {

                updateDatabaseFromForm();
                array.push({ name: 'src', value:  JSON.stringify(FrameTrail.module("Database").convertToDatabaseFormat(thisID), null, 4) });

            },
            beforeSerialize: function(form, options) {

                // Subtitles Validation

                EditHypervideoForm.find('.message.error').removeClass('active').html('');

                var err = 0;
                EditHypervideoForm.find('.subtitlesItem').each(function() {
                    $(this).css({'outline': ''});

                    if (($(this).find('input[type="file"]:first').attr('name') == 'subtitles[]') || ($(this).find('.subtitlesTmpKeySetter').first().val() == '')
                            || ($(this).find('input[type="file"]:first').val().length == 0)) {
                        $(this).css({'outline': '1px solid #cd0a0a'});
                        EditHypervideoForm.find('.message.error').addClass('active').html('Subtitles Error: Please fill in all fields.');
                        err++;
                    } else if ( !(new RegExp('(' + ['.vtt'].join('|').replace(/\./g, '\\.') + ')$')).test($(this).find('input[type="file"]:first').val()) ) {
                        $(this).css({'outline': '1px solid #cd0a0a'});
                        EditHypervideoForm.find('.message.error').addClass('active').html('Subtitles Error: Wrong format. Please add only .vtt files.');
                        err++;
                    }

                    if (EditHypervideoForm.find('.subtitlesItem input[type="file"][name="subtitles['+ $(this).find('.subtitlesTmpKeySetter:first').val() +']"]').length > 1
                            || (EditHypervideoForm.find('.existingSubtitlesItem .subtitlesDelete[data-lang="'+ $(this).find('.subtitlesTmpKeySetter:first').val() +'"]').length > 0 ) ) {
                        EditHypervideoForm.find('.message.error').addClass('active').html('Subtitles Error: Please make sure you assign languages only once.');
                        return false;
                    }
                });
                if (err > 0) {
                    return false;
                }


            },
            dataType: 'json',
            thisID: thisID,
            data: {
                'a': 'hypervideoChange',
                'projectID': projectID,
                'hypervideoID': thisID,
            },
            success: function(response) {


                switch(response['code']) {
                    case 0:

                        //TODO: Put in separate method
                        FrameTrail.module('Database').loadHypervideoData(
                            function(){

                                if ( thisID == FrameTrail.module('RouteNavigation').hypervideoID ) {

                                    FrameTrail.module('Database').hypervideo = FrameTrail.module('Database').hypervideos[thisID];

                                    // if current hypervideo is edited, adjust states
                                    EditHypervideoForm.find('.hypervideoLayout input').each(function() {

                                        var state = 'hv_config_'+ $(this).attr('data-configkey'),
                                            val   = $(this).val();

                                        if ( val == 'true' ) {
                                            val = true;
                                        } else if ( val == 'false' ) {
                                            val = false;
                                        }

                                        FrameTrail.changeState(state, val);

                                    });

                                    var name = EditHypervideoForm.find('input[name="name"]').val(),
                                        description = EditHypervideoForm.find('textarea[name="description"]').val();

                                    FrameTrail.module('HypervideoModel').hypervideoName = name;
                                    FrameTrail.module('HypervideoModel').description = description;

                                    FrameTrail.module('HypervideoController').updateDescriptions();

                                    // re-init subtitles
                                    FrameTrail.module('Database').loadSubtitleData(
                                        function() {

                                            FrameTrail.module('ViewOverview').refreshList();

                                            FrameTrail.module('HypervideoModel').subtitleFiles = FrameTrail.module('Database').hypervideo.subtitles;
                                            FrameTrail.module('HypervideoModel').initModelOfSubtitles(FrameTrail.module('Database'));
                                            FrameTrail.module('SubtitlesController').initController();
                                            FrameTrail.changeState('hv_config_captionsVisible', false);

                                            EditHypervideoForm.find('.message.saveReminder').removeClass('active');
                                            //EditHypervideoForm.dialog('close');


                                        },
                                        function() {}
                                    );

                                    FrameTrail.module('ViewVideo').EditingOptions.empty();
                                    initHypervideoSettings();

                                    FrameTrail.changeState('viewSize', FrameTrail.getState('viewSize'));

                                } else {
                                    initList();

                                    FrameTrail.module('ViewVideo').EditingOptions.empty();
                                    initHypervideoSettings();

                                    FrameTrail.changeState('viewSize', FrameTrail.getState('viewSize'));
                                    //EditHypervideoForm.dialog('close');
                                }

                            },
                            function(){
                                EditHypervideoForm.find('.message.error').addClass('active').html('Error while updating hypervideo data');
                            }
                        );

                        break;
                    default:
                        EditHypervideoForm.find('.message.error').addClass('active').html('Error: '+ response['string']);
                        break;
                }
            }
        });
        
        
        /* Change Theme UI */

        var ChangeThemeUI = $('<div id="ThemeContainer">'
                            + '    <div class="message active">Select Color Theme</div>'
                            + '    <div class="themeItem" data-theme="default">'
                            + '        <div class="themeName">Default</div>'
                            + '        <div class="themeColorContainer">'
                            + '            <div class="primary-fg-color"></div>'
                            + '            <div class="secondary-bg-color"></div>'
                            + '            <div class="secondary-fg-color"></div>'
                            + '        </div>'
                            + '    </div>'
                            + '    <div class="themeItem" data-theme="dark">'
                            + '        <div class="themeName">Dark</div>'
                            + '        <div class="themeColorContainer">'
                            + '            <div class="primary-fg-color"></div>'
                            + '            <div class="secondary-bg-color"></div>'
                            + '            <div class="secondary-fg-color"></div>'
                            + '        </div>'
                            + '    </div>'
                            + '    <div class="themeItem" data-theme="bright">'
                            + '        <div class="themeName">Bright</div>'
                            + '        <div class="themeColorContainer">'
                            + '            <div class="primary-fg-color"></div>'
                            + '            <div class="secondary-bg-color"></div>'
                            + '            <div class="secondary-fg-color"></div>'
                            + '        </div>'
                            + '    </div>'
                            + '    <div class="themeItem" data-theme="blue">'
                            + '        <div class="themeName">Blue</div>'
                            + '        <div class="themeColorContainer">'
                            + '            <div class="primary-fg-color"></div>'
                            + '            <div class="secondary-bg-color"></div>'
                            + '            <div class="secondary-fg-color"></div>'
                            + '        </div>'
                            + '    </div>'
                            + '    <div class="themeItem" data-theme="green">'
                            + '        <div class="themeName">Green</div>'
                            + '        <div class="themeColorContainer">'
                            + '            <div class="primary-fg-color"></div>'
                            + '            <div class="secondary-bg-color"></div>'
                            + '            <div class="secondary-fg-color"></div>'
                            + '        </div>'
                            + '    </div>'
                            + '    <div class="themeItem" data-theme="orange">'
                            + '        <div class="themeName">Orange</div>'
                            + '        <div class="themeColorContainer">'
                            + '            <div class="primary-fg-color"></div>'
                            + '            <div class="secondary-bg-color"></div>'
                            + '            <div class="secondary-fg-color"></div>'
                            + '        </div>'
                            + '    </div>'
                            + '    <div class="themeItem" data-theme="grey">'
                            + '        <div class="themeName">Grey</div>'
                            + '        <div class="themeColorContainer">'
                            + '            <div class="primary-fg-color"></div>'
                            + '            <div class="secondary-bg-color"></div>'
                            + '            <div class="secondary-fg-color"></div>'
                            + '        </div>'
                            + '    </div>'
                            + '</div>');
        
        ChangeThemeUI.find('.themeItem').each(function() {
            if ( hypervideo.config.theme == $(this).attr('data-theme') ) {
                $(this).addClass('active');
            }
            if ( !hypervideo.config.theme && $(this).attr('data-theme') == 'default' ) {
                $(this).addClass('active');
            }
        });

        settingsEditingOptions.find('#ChangeTheme').append(ChangeThemeUI);

        ChangeThemeUI.find('.themeItem').click(function() {
            
            $(this).siblings('.themeItem').removeClass('active');
            $(this).addClass('active');

            var selectedTheme = $(this).attr('data-theme');

            if (selectedTheme != hypervideo.config.theme) {
                $('html').attr('class', selectedTheme);

                FrameTrail.module('Database').hypervideos[thisID].config.theme = selectedTheme;
                newUnsavedChange('settings');
            }

        });


        /* CSS Variables Editing UI */

        var CSSVariablesEditingUI = $('<div id="CSSVariablesEditingUI" style="height: 110px;">'
                                    + '    <textarea id="CSSVariables">/* Custom CSS Variables coming soon */</textarea>'
                                    + '</div>');
        
        settingsEditingOptions.find('#ChangeCSSVariables').append(CSSVariablesEditingUI);

        // Init CodeMirror for CSS Variables

        var textarea = settingsEditingOptions.find('#CSSVariables');

        var codeEditor = CodeMirror.fromTextArea(textarea[0], {
                value: textarea[0].value,
                lineNumbers: true,
                mode:  'css',
                gutters: ['CodeMirror-lint-markers'],
                lint: true,
                lineWrapping: true,
                tabSize: 2,
                theme: 'hopscotch'
            });
        codeEditor.on('change', function(instance, changeObj) {
            
            var thisTextarea = $(instance.getTextArea());
                            
            // TODO: Update CSS Variables (instance.getValue()) in Database

            thisTextarea.val(instance.getValue());
            

        });
        codeEditor.setSize(null, '100%');
        

    }



    /**
     * YET TO IMPLEMENT
     *
     * Data exporting can be achieved in various ways.
     *
     * @method exportIt
     */
    function exportIt() {

        alert('The Export-Feature is currently being implemented. When finished, it will give you a handy ZIP file which includes a standalone version of your Hypervideo / entire Project.');

    }


    return {

        /**
         * Wether the current hypervideo has a playable html5 video source file,
         * or (otherwise) only has a duration (then we are in "Null Player" mode).
         * @attribute hasHTML5Video
         * @type Boolean
         * @readOnly
         */
        get hasHTML5Video()     { return hasHTML5Video   },


        /**
         * I contain a map to the .mp4 source filename.
         * @attribute sourceFiles
         * @readOnly
         * @type {}
         */
        get sourceFiles()       { return sourceFiles     },

        /**
         * The hypervideo's creator name
         * @type String
         * @attribute creator
         * @readOnly
         */
        get creator()           { return creator         },

        /**
         * The ID of the hypervideo's creator
         * @type String
         * @attribute creatorId
         * @readOnly
         */
        get creatorId()         { return creatorId       },

        /**
         * The hypervideo's creation date
         * @type Number
         * @attribute created
         * @readOnly
         */
        get created()           { return created         },

        /**
         * The hypervideo's date of latest change
         * @type Number
         * @attribute lastchanged
         * @readOnly
         */
        get lastchanged()       { return lastchanged     },

        /**
         * Whether the hypervideo is hidden in overview mode.
         * @type Boolean
         * @attribute hidden
         * @readOnly
         */
        get hidden()            { return hidden          },


        /**
         * Get or set the Array of subtitle files (if defined)
         * @attribute subtitleFiles
         * @param {Array} files
         */
        get subtitleFiles()         { return subtitleFiles          },
        set subtitleFiles(files)    { return subtitleFiles = files  },

        /**
         * The Array of subtitles (fetched via {{#crossLink "HypervideoModel/getSubtitles:method"}}getSubtitles(){{/crossLinks}}).
         * @attribute subtitles
         * @readOnly
         */
        get subtitles()         { return getSubtitles()       },

        /**
         * Get or set the subtitle language
         * @type String
         * @attribute lang
         * @param {String} lang
         */
        get selectedLang()          { return selectedLang        },
        set selectedLang(lang)      { return selectedLang = lang },

        /**
         * The overlays of the hypervideo
         * @type Array of Overlay
         * @attribute overlays
         * @readOnly
         */
        get overlays()          { return overlays        },

        /**
         * The codeSnippets of the hypervideo (fetched via {{#crossLink "HypervideoModel/getCodeSnippets:method"}}getCodeSnippets(){{/crossLinks}}).
         * @type Array of CodeSnippets
         * @attribute codeSnippets
         * @readOnly
         */
        get codeSnippets()        { return getCodeSnippets() },

        /**
         * Get or set the global event handlers for the hypervideo.
         * @type Object
         * @attribute events
         * @param {Object} eventObject
         */
        get events()              { return events                     },
        set events(eventObject)   { return updateEvents(eventObject)  },

        /**
         * Get or set the global custom CSS code for the hypervideo.
         * @type String
         * @attribute customCSS
         * @param {String} cssString
         */
        get customCSS()           { return customCSS                  },
        set customCSS(cssString)  { return updateCustomCSS(cssString) },

        /**
         * The annotation sets of the hypervideo (fetched via {{#crossLink "HypervideoModel/getAnnotationSets:method"}}getAnnotationSets(){{/crossLinks}}).
         * @type Array of { id: String, name: String }
         * @attribute annotationSets
         * @readOnly
         */
        get annotationSets()    { return getAnnotationSets() },

        /**
         * The currently selected annotations of the hypervideo (fetched via {{#crossLink "HypervideoModel/getAnnotations:method"}}getAnnotations(){{/crossLinks}}).
         * @type Array of Annotation
         * @attribute annotations
         * @readOnly
         */
        get annotations()       { return getAnnotations() },

        /**
         * All annotations in all sets by all users (fetched via {{#crossLink "HypervideoModel/getAllAnnotations:method"}}getAllAnnotations(){{/crossLinks}}).
         * @type Array of Annotation
         * @attribute allAnnotations
         * @readOnly
         */
        get allAnnotations()       { return getAllAnnotations() },

        /**
         * All annotations sets of the hypervideo in a map of userIDs to their respective annotation set.
         * @type Object of Array of Annotation
         * @attribute annotationAllSets
         */
        get annotationAllSets() { return annotationSets },

        /**
         * Get or set the hypervideo name
         * @type String
         * @attribute hypervideoName
         * @param {String} aString
         */
        get hypervideoName()         { return hypervideoName           },
        set hypervideoName(aString)  { return hypervideoName = aString },

        /**
         * Get or set the hypervideo descritption
         * @type String
         * @attribute description
         * @param {String} aString
         */
        get description()         { return description           },
        set description(aString)  { return description = aString },

        /**
         * The currently selected userID, to decide which annotations should be displayed (setting this attribute is done via {{#crossLink "HypervideoModel/selectAnnotationSet:method"}}selectAnnotationSet(){{/crossLinks}}).
         * @type Array of Annotation
         * @attribute annotationSet
         * @param {} anID
         */
        set annotationSet(anID) { return selectAnnotationSet(anID) },
        get annotationSet()     { return selectedAnnotationSet     },

        /**
         * The hypervideo's duration.
         *
         * This attribute must not be changed after the init process.
         * It is either set to the duration of the "null video" ({{#crossLink "HypervideoModel/initModel:method"}}HypervideoModel/initModel(){{/crossLinks}}) or
         * or after the video source file's meta data has loaded ({{#crossLink "HypervideoController/initController:method"}}HypervideoController/initController(){{/crossLinks}}).
         *
         * @attribute duration
         * @param {} aNumber
         */
        set duration(aNumber)   { return duration = aNumber },
        get duration()          { return duration           },



        initModel:              initModel,

        removeOverlay:          removeOverlay,
        newOverlay:             newOverlay,
        
        removeCodeSnippet:      removeCodeSnippet,
        newCodeSnippet:         newCodeSnippet,

        removeAnnotation:       removeAnnotation,
        newAnnotation:          newAnnotation,

        // Exception: this is exported to be able to update the subtitles on the fly
        initModelOfSubtitles:   initModelOfSubtitles,

        newUnsavedChange:       newUnsavedChange,

        save:                   save,
        leaveEditMode:          leaveEditMode,
        updateHypervideo:       updateHypervideo,
        initHypervideoSettings: initHypervideoSettings,
        exportIt:               exportIt

    }





});
