/**
 * @module Shared
 */

/**
 * I am the Database.
 * I store all data coming from the server. The data model objects (like {{#crossLink "HypervideoModel"}}HypervideoModel{{/crossLink}})
 * get their data from me. When they are done with manipulating the data, I can store the data back to the server.
 *
 * Note: All data objects inside me must be passed by reference, so that data can be manipulated in place, and insertions and deletions
 * should alter immediatly the database. In this way, data is kept consistent across the app
 * (see {{#crossLink "Annotation/FrameTrail.newObject:method"}}FrameTrail.newObject('Annotation', data){{/crossLink}}).
 *
 * @class Database
 * @static
 */

 FrameTrail.defineModule('Database', function(FrameTrail){


    var hypervideoID = '',
        hypervideos  = {},
        hypervideo   = {},
        sequence     = {},

        overlays     = [],
        codeSnippets = {},
        resources    = {},
        config       = {},

        annotations            = {},
        annotationfileIDs      = {},

        subtitles              = {},
        subtitlesLangMapping   = {
            'en': 'English',
            'de': 'Deutsch',
            'fr': 'Français'
        },

        users  = {};



    /**
     * I load the config data (_data/config.json) from the server
     * and save the data in my attribute {{#crossLink "Database/config:attribute"}}Database/config{{/crossLink}}.
     * I call my success or fail callback respectively.
     *
     * @method loadConfigData
     * @param {Function} success
     * @param {Function} fail
     */
    function loadConfigData(success, fail) {

        $.ajax({

            type:   "GET",
            url:    ('_data/config.json'),
            cache:  false,
            dataType: "json",
            mimeType: "application/json"
        }).done(function(data){

            config = data;
            
            // TODO: Check if this makes sense here
            if (data.theme) {
                $(FrameTrail.getState('target')).attr('data-frametrail-theme', data.theme);
            } else {
                $(FrameTrail.getState('target')).attr('data-frametrail-theme', '');
            }

            success.call(this);

        }).fail(function(){

            fail('No resources index file.');

        });

    };


    /**
     * I load the resource index data (_data/resources/_index.json) from the server
     * and save the data in my attribute {{#crossLink "Database/resources:attribute"}}Database/resources{{/crossLink}}.
     * I call my success or fail callback respectively.
     *
     * @method loadResourceData
     * @param {Function} success
     * @param {Function} fail
     */
    function loadResourceData(success, fail) {

        $.ajax({

            type:   "GET",
            url:    ('_data/resources/_index.json'),
            cache:  false,
            dataType: "json",
            mimeType: "application/json"
        }).done(function(data){

            resources = data.resources;
            //console.log('resources', resources);
            success.call(this);

        }).fail(function(){

            fail('No resources index file.');

        });

    };


    /**
     * I load the user.json from the server
     * and save the  data in my attribute {{#crossLink "Database/users:attribute"}}Database/users{{/crossLink}}.
     * I call my success or fail callback respectively.
     *
     * @method loadUserData
     * @param {Function} success
     * @param {Function} fail
     */
    function loadUserData(success, fail) {

        if (!FrameTrail.module('RouteNavigation').environment.server) {

            $.ajax({
                type:   "GET",
                url:    ('_data/users.json'),
                cache:  false,
                dataType: "json",
                mimeType: "application/json"
            }).done(function(data){

                users = data.user;
                //console.log('users', users);
                success.call(this);

            }).fail(function(){

                fail('No user index file.');

            });
        } else {

            $.ajax({

                type:   "POST",
                url:    ('_server/ajaxServer.php'),
                cache:  false,
                dataType: "json",
                mimeType: "application/json",
                data:   {

                    a:          'userGet'

                }

            }).done(function(data){

                users = data.response.user;
                //console.log('users', users);
                success.call(this);

            }).fail(function(){

                fail('No user index file.');

            });

        }



    };


    /**
     * I load the hypervideo index data (_data/hypervideos/_index.json) from the server
     * and save the data in my attribute {{#crossLink "Database/hypervideos:attribute"}}Database/hypervideos{{/crossLink}}.
     * I call my success or fail callback respectively.
     *
     * @method loadHypervideoData
     * @param {Function} success
     * @param {Function} fail
     * @private
     */
    function loadHypervideoData(success, fail) {

        $.ajax({

            type:   "GET",
            url:    ('_data/hypervideos/_index.json'),
            cache:  false,
            dataType: "json",
            mimeType: "application/json"
        }).done(function(data){


            var countdown = Object.keys(data.hypervideos).length,
                bufferedData = {};

            // TODO: fix server object / array php problem
            if ( Array.isArray(data.hypervideos) || countdown == 0 ) {
                success.call(this);
                return;
            }

            for (var key in data.hypervideos) {
                (function (hypervideoID) {

                    $.ajax({
                        type:   "GET",
                        url:    ('_data/hypervideos/' + data.hypervideos[key] + '/hypervideo.json'),
                        cache:  false,
                        dataType: "json",
                        mimeType: "application/json"
                    }).done(function (hypervideoData) {

                        $.ajax({
                            type:   "GET",
                            url:    ('_data/hypervideos/' + data.hypervideos[key] + '/annotations/_index.json'),
                            cache:  false,
                            dataType: "json",
                            mimeType: "application/json"
                        }).done(function (annotationsIndex) {

                                bufferedData[hypervideoID] = {
                                    "name": hypervideoData.meta.name,
                                    "description": hypervideoData.meta.description,
                                    "thumb": hypervideoData.meta.thumb,
                                    "creator": hypervideoData.meta.creator,
                                    "creatorId": hypervideoData.meta.creatorId,
                                    "created": hypervideoData.meta.created,
                                    "lastchanged": hypervideoData.meta.lastchanged,
                                    "hidden": hypervideoData.config.hidden,
                                    "config": hypervideoData.config,
                                    "mainAnnotation": annotationsIndex.mainAnnotation,
                                    "annotationfiles": annotationsIndex.annotationfiles,
                                    "annotation-increment": annotationsIndex['annotation-increment'],
                                    "subtitles": hypervideoData.subtitles,
                                    "clips": hypervideoData.clips,
                                    "hypervideoData": hypervideoData
                                };
                                delete bufferedData[hypervideoID].config.hidden;

                                if (!--countdown) {
                                    next();
                                }

                            }).fail(function () {
                                fail('No annotations index.');
                            });

                    }).fail(function () {
                        fail('No hypervideo.json file.');
                    });

                })(key);
            }


            function next() {

                hypervideos = bufferedData;
                //console.log('hypervideo', hypervideos[hypervideoID]);
                success.call(this);

            }

        }).fail(function(){

            fail('No hypervideo index file.');

        });

    };



    /**
     * I load the hypervideo sequence data (_data/hypervideos/ 
     * {{#crossLink "RouteNavigation/hypervideoID:attribute"}}RouteNavigation/hypervideoID{{/crossLink}} /hypervideo.json) 
     * from the server and save the data in my attribute {{#crossLink "Database/hypervideo:attribute"}}Database/hypervideos{{/crossLink}}.
     * I call my success or fail callback respectively.
     *
     * @method loadSequenceData
     * @param {Function} success
     * @param {Function} fail
     * @private
     */
    function loadSequenceData(success, fail) {

        sequence = {
            clips: hypervideos[hypervideoID].clips
        }
        //console.log('sequence', sequence);

        success();
    };


    /**
     * I load the content data from the hypervideo.json
     * and save the data in my attribute {{#crossLink "Database/overlays:attribute"}}Database/overlays{{/crossLink}} and  {{#crossLink "Database/codeSnippets:attribute"}}Database/codeSnippets{{/crossLink}}.
     * I call my success or fail callback respectively.
     *
     * @method loadContentData
     * @param {Function} success
     * @param {Function} fail
     * @private
     */
    function loadContentData(success, fail) {

        try {

            overlays = [];
            codeSnippets.timebasedEvents = [];

            for (var key in hypervideos[hypervideoID].hypervideoData.contents) {

                var contentItem = hypervideos[hypervideoID].hypervideoData.contents[key];
                //console.log('contentItem', contentItem);
                switch (contentItem['frametrail:type']) {
                    case 'Overlay':
                        overlays.push({
                            "name": contentItem.body['frametrail:name'],
                            "creator": contentItem.creator.nickname,
                            "creatorId": contentItem.creator.id,
                            "created": (new Date(contentItem.created)).getTime(),
                            "type": contentItem.body['frametrail:type'],
                            "src":    contentItem.body.source
                                   || contentItem.body.value,
                            "start": parseFloat(/t=(\d+\.?\d*),(\d+\.?\d*)/g.exec(contentItem.target.selector.value)[1]),
                            "end": parseFloat(/t=(\d+\.?\d*),(\d+\.?\d*)/g.exec(contentItem.target.selector.value)[2]),
                            "startOffset": (contentItem.body.selector && contentItem.body.selector.value)
                                            ? parseFloat(/t=(\d+\.?\d*),(\d+\.?\d*)/g.exec(contentItem.body.selector.value)[1])
                                            : 0,
                            "endOffset": (contentItem.body.selector && contentItem.body.selector.value)
                                            ? parseFloat(/t=(\d+\.?\d*),(\d+\.?\d*)/g.exec(contentItem.body.selector.value)[2])
                                            : 0,
                            "attributes": contentItem["frametrail:attributes"],
                            "position": (function () {
                                if (!contentItem.target.selector) { return {}; }
                                try {
                                    var match = /xywh=percent:(\d+\.?\d*),(\d+\.?\d*),(\d+\.?\d*),(\d+\.?\d*)/g
                                                .exec(contentItem.target.selector.value);
                                    return {
                                        "top": parseFloat(match[2]),
                                        "left": parseFloat(match[1]),
                                        "width": parseFloat(match[3]),
                                        "height": parseFloat(match[4])
                                    };
                                } catch (_) { return {}; }
                            })(),
                            "events": contentItem["frametrail:events"],
                            "tags": contentItem["frametrail:tags"]
                        });
                        if (overlays[overlays.length-1].type === 'location') {
                            var locationAttributes = overlays[overlays.length-1].attributes;
                            locationAttributes.lat = parseFloat(contentItem.body['frametrail:lat']);
                            locationAttributes.lon = parseFloat(contentItem.body['frametrail:long']);
                            locationAttributes.boundingBox = contentItem.body['frametrail:boundingBox'].split(',').map(parseFloat);
                        }
                        break;
                    case 'CodeSnippet':
                        codeSnippets.timebasedEvents.push({
                            "name": contentItem.body['frametrail:name'],
                            "creator": contentItem.creator.nickname,
                            "creatorId": contentItem.creator.id,
                            "created": (new Date(contentItem.created)).getTime(),
                            "snippet": contentItem.body.value,
                            "start": parseFloat(/t=(\d+\.?\d*)/g.exec(contentItem.target.selector.value)[1]),
                            "attributes": contentItem['frametrail:attributes'],
                            "tags": contentItem['frametrail:tags']
                        });
                        break;
                }

            }

            codeSnippets.globalEvents = hypervideos[hypervideoID].hypervideoData.globalEvents;
            codeSnippets.customCSS = hypervideos[hypervideoID].hypervideoData.customCSS;

        } catch (e) {
            console.log(e);
            return fail('Could not load content data');
        }
        //console.log('overlays', overlays);
        //console.log('codeSnippets', codeSnippets);
        success();

    };



    /**
     * I load the annotation data (_data/hypervideos/ {{#crossLink "RouteNavigation/hypervideoID:attribute"}}RouteNavigation/hypervideoID{{/crossLink}} /hypervideo.json) from the server
     * and save the data in my attribute {{#crossLink "Database/annotations:attribute"}}Database/annotations{{/crossLink}},
     * and the respective annotationfileIDs in my attribute {{#crossLink "Database/annotationfileIDs:attribute"}}Database/annotationfileIDs{{/crossLink}},
     *
     *
     * I call my success or fail callback respectively.
     *
     * @method loadAnnotationData
     * @param {Function} success
     * @param {Function} failannotationData
     * @private
     */
    function loadAnnotationData(success, fail) {

        var annotationsCount = Object.keys(hypervideo.annotationfiles).length;

        // clear previous data
        annotationfileIDs = {};
        annotations  = {};


        for (var id in hypervideo.annotationfiles) {

            (function(id){

                $.ajax({
                    type: "GET",
                    url: ('_data/hypervideos/' + hypervideoID + '/annotations/' + id + '.json'),
                    cache: false,
                    dataType: "json",
                    mimeType: "application/json"
                }).done(function(data){

                    var annotationData = [];

                    for (var i in data) {

                        annotationData.push({
                            "name": data[i].body['frametrail:name'],
                            "creator": data[i].creator.nickname,
                            "creatorId": data[i].creator.id,
                            "created": (new Date(data[i].created)).getTime(),
                            "type": data[i].body['frametrail:type'],
                            "src": (function () {
                                        if (data[i].body["frametrail:type"] === 'location') { return null; }
                                        return (['codesnippet', 'text', 'webpage', 'wikipedia',].indexOf( data[i].body["frametrail:type"] ) >= 0)
                                                ? data[i].body.value
                                                : data[i].body.source
                                    })(),
                            "thumb": data[i].body['frametrail:thumb'],
                            "start": parseFloat(/t=(\d+\.?\d*)/g.exec(data[i].target.selector.value)[1]),
                            "end": parseFloat(/t=(\d+\.?\d*),(\d+\.?\d*)/g.exec(data[i].target.selector.value)[2]),
                            "resourceId": data[i].body["frametrail:resourceId"],
                            "attributes": data[i].body['frametrail:attributes'] || {},
                            "tags": data[i]['frametrail:tags']
                        });
                        
                        if (annotationData[annotationData.length-1].type === 'location') {
                            var locationAttributes = annotationData[annotationData.length-1].attributes;
                            locationAttributes.lat = parseFloat(data[i].body['frametrail:lat']);
                            locationAttributes.lon = parseFloat(data[i].body['frametrail:long']);
                            locationAttributes.boundingBox = data[i].body['frametrail:boundingBox'].split(',').map(parseFloat);
                        }

                        if (annotationData[annotationData.length-1].type === 'video') {
                            var annotationItem = annotationData[annotationData.length-1];
                            annotationItem.startOffset = (data[i].body.selector && data[i].body.selector.value)
                                                         ? parseFloat(/t=(\d+)/g.exec(data[i].body.selector.value)[1])
                                                         : 0;
                            annotationItem.endOffset = (data[i].body.selector && data[i].body.selector.value)
                                                        ? parseFloat(/t=(\d+\.?\d*)/g.exec(data[i].body.selector.value)[2])
                                                        : 0;
                        }

                    }

                    //console.log('annotation', id, annotationData);
                    annotations[hypervideo.annotationfiles[id].ownerId]       = annotationData;
                    annotationfileIDs[hypervideo.annotationfiles[id].ownerId] = id;

                    annotationsCount--;
                    if(annotationsCount === 0){

                        // all annotation data loaded from server
                        success.call(this);

                    }


                }).fail(function() {

                    fail('Missing annotation file.');

                });

            }).call(this, id)

        }


    };



    /**
     * I load the subtitles data (_data/hypervideos/ {{#crossLink "RouteNavigation/hypervideoID:attribute"}}RouteNavigation/hypervideoID{{/crossLink}} /subtitles/...) from the server
     * and save the data in my attribute {{#crossLink "Database/subtitles:attribute"}}Database/subtitles{{/crossLink}}
     *
     * I call my success or fail callback respectively.
     *
     * @method loadSubtitleData
     * @param {Function} success
     * @param {Function} fail
     * @private
     */
    function loadSubtitleData(success, fail) {

        var subtitleCount = 0;

        subtitles = {};

        if (hypervideo.subtitles && hypervideo.subtitles.length > 0) {

            for (var idx in hypervideo.subtitles) {
                subtitleCount ++;
            }

            for (var i = 0; i < hypervideo.subtitles.length; i++) {

                (function(i){

                    var currentSubtitles = hypervideo.subtitles[i];

                    $.ajax({

                        type: "GET",
                        url: ('_data/hypervideos/' + hypervideoID + '/subtitles/' + currentSubtitles.src),
                        cache: false

                    }).done(function(data){

                        var parsedCues = [];

                        // parse webvtt contents
                        var parser = new WebVTT.Parser(window, WebVTT.StringDecoder());
                        parser.onregion = function(region) {};
                        parser.oncue = function(cue) {
                            parsedCues.push(cue);
                        };
                        parser.onparsingerror = function(e) {
                            console.log(e);
                        };
                        parser.parse(data);
                        parser.flush();

                        var langLabel;
                        if (subtitlesLangMapping[currentSubtitles.srclang]) {
                            langLabel = subtitlesLangMapping[currentSubtitles.srclang];
                        } else {
                            langLabel = currentSubtitles.srclang;
                        }

                        // write parsed contents in subtitles var
                        subtitles[currentSubtitles.srclang] = {};
                        subtitles[currentSubtitles.srclang]['label'] = langLabel;
                        subtitles[currentSubtitles.srclang]['cues'] = parsedCues;

                        subtitleCount--;
                        if(subtitleCount === 0){

                            // all subtitle data loaded from server
                            success.call(this);

                        }


                    }).fail(function() {

                        fail('Missing subtitle file.');

                    });

                }).call(this, i)

            }

        } else {

            // no subtitles found, continue
            success.call(this);

        }


    };





    /**
     * I initialise the load process of the database
     *
     * First I look for the {{#crossLink "RouteNavigation/hypervideoID:attribute"}}RouteNavigation/hypervideoID{{/crossLink}}.
     *
     * Then I call the nested load functions to fetch all data from the server.
     * I call my success or fail callback respectively.
     *
     * @method loadData
     * @param {Function} success
     * @param {Function} fail
     */
    function loadData(success, fail) {


        hypervideoID = FrameTrail.module('RouteNavigation').hypervideoID;


       if(hypervideoID === undefined){

            //FrameTrail.module('InterfaceModal').showStatusMessage('No Hypervideo is selected.');

            hypervideo   = null;
            sequence     = {};
            annotations  = {};
            overlays     = [];
            codeSnippets = {};

            return  loadConfigData(function(){

                        loadResourceData(function(){

    						loadUserData(function(){

    							loadHypervideoData(function(){

    								success.call();

    							}, fail);

    						}, fail);

    					}, fail);

                    }, fail);
        }



		loadConfigData(function(){

            loadResourceData(function(){

    			loadUserData(function(){

    				loadHypervideoData(function(){


    					hypervideo = hypervideos[hypervideoID];

    					if(!hypervideo){

    						return fail('This hypervideo does not exist.');

    					}

    					loadSequenceData(function(){

    						loadSubtitleData(function(){

    							loadContentData(function(){

    								loadAnnotationData(function(){

    									success.call();

    								}, fail);

    							}, fail);

    						}, fail);

    					}, fail);


    				}, fail);


    			}, fail);

    		}, fail);

        }, fail);


    };



    /**
     * I update the hypervideo data inside the database
     *
     * @method updateHypervideoData
     * @param {Function} success
     * @param {Function} fail
     */
    function updateHypervideoData(success, fail) {

        hypervideoID = FrameTrail.module('RouteNavigation').hypervideoID;

        loadHypervideoData(function(){

            hypervideo = hypervideos[hypervideoID];

            if(!hypervideo){

                return fail('This hypervideo does not exist.');

            }

            loadSequenceData(function(){

                loadSubtitleData(function(){

                    loadContentData(function(){

                        loadAnnotationData(function(){

                            success.call();

                        }, fail);

                    }, fail);

                }, fail);

            }, fail);


        }, fail);

    };


    /**
     * I generate the JSON for hypervideo.json
     *
     * @method convertToDatabaseFormat
     * @return {Object}
     */
    function convertToDatabaseFormat (thisHypervideoID) {

        thisHypervideoID = thisHypervideoID || hypervideoID;

        return ({
        	"meta": {
        		"name": hypervideos[thisHypervideoID].name,
        		"description": hypervideos[thisHypervideoID].description,
        		"thumb": hypervideos[thisHypervideoID].thumb,
        		"creator": hypervideos[thisHypervideoID].creator,
        		"creatorId": hypervideos[thisHypervideoID].creatorId,
        		"created": hypervideos[thisHypervideoID].created,
        		"lastchanged": Date.now()
        	},
        	"config": {
        		"slidingMode": hypervideos[thisHypervideoID].config.slidingMode,
        		"slidingTrigger": hypervideos[thisHypervideoID].config.slidingTrigger,
        		"autohideControls": hypervideos[thisHypervideoID].config.autohideControls,
        		"captionsVisible": hypervideos[thisHypervideoID].config.captionsVisible,
        		"hidden": hypervideos[thisHypervideoID].hidden,
                "layoutArea": FrameTrail.module('ViewLayout').getLayoutAreaData()
        	},
        	"clips": hypervideos[thisHypervideoID].clips,
        	"globalEvents": (codeSnippets.globalEvents) ? codeSnippets.globalEvents : {},
        	"customCSS": (codeSnippets.customCSS) ? codeSnippets.customCSS : "",
        	"contents": (function () {
                var contents = [];
                for (var i in overlays) {
                    contents.push({
            			"@context": [
            				"http://www.w3.org/ns/anno.jsonld",
            				{
            					"frametrail": "http://frametrail.org/ns/"
            				}
            			],
            			"creator": {
            				"nickname": overlays[i].creator,
            				"type": "Person",
            				"id": overlays[i].creatorId
            			},
            			"created": (new Date(overlays[i].created)).toString(),
            			"type": "Annotation",
            			"frametrail:type": "Overlay",
            			"frametrail:tags": overlays[i].tags || [],
            			"target": {
            				"type": "Video",
            				"source": FrameTrail.module('HypervideoModel').sourceFiles.mp4,
            				"selector": {
            					"conformsTo": "http://www.w3.org/TR/media-frags/",
            					"type": "FragmentSelector",
            					"value":
                                    "t=" + overlays[i].start + "," + overlays[i].end
                                    + "&xywh=percent:"
                                    + overlays[i].position.left + ","
                                    + overlays[i].position.top + ","
                                    + overlays[i].position.width + ","
                                    + overlays[i].position.height
            				}
            			},
            			"body": {
            				"type": ({
                                        'image':     'Image',
                                        'video':     'Video',
                                        'location':  'Dataset',
                                        'wikipedia': 'Text',
                                        'text':      'TextualBody',
                                        'vimeo':     'Video',
                                        'webpage':   'Text',
                                        'youtube':   'Video'
                                    })[overlays[i].type],
            				"frametrail:type": overlays[i].type,
            				"format": ({
                                'image': 'image/' + (function () {
                                    try {
                                        return (overlays[i].src ? (/\.(\w{3,4})$/g.exec(overlays[i].src)[1]) : '*');
                                    } catch (_) {
                                        return '*';
                                    }
                                })(),
                                'video': 'video/mp4',
                                'location': 'application/x-frametrail-location',
                                'wikipedia': 'text/html',
                                'text': 'text/html',
                                'vimeo': 'text/html',
                                'webpage': 'text/html',
                                'youtube': 'text/html'
                            })[overlays[i].type],
            				"source": (function () {
            				    if (['codesnippet', 'text', 'webpage', 'wikipedia',].indexOf( overlays[i].type ) < 0) {
                                    return overlays[i].src
                                }
                                return undefined;
            				})(),
                            "value": (function () {
            				    if (['codesnippet', 'text', 'webpage', 'wikipedia',].indexOf( overlays[i].type ) >= 0) {
                                    return overlays[i].src
                                }
                                return undefined;
            				})(),
            				"frametrail:name": overlays[i].name,
            				"frametrail:thumb": overlays[i].thumb,
            				"selector": (function () {
            				    if (   ['video', 'vimeo', 'youtube'].indexOf(overlays[i].type) >= 0
                                    && overlays[i].startOffset
                                    && overlays[i].endOffset
                                ) {
                                    return {
                    					"type": "FragmentSelector",
                    					"conformsTo": "http://www.w3.org/TR/media-frags/",
                    					"value": "t=" + overlays[i].startOffset + "," + overlays[i].endOffset
                    				}
                                } else {
                                    return undefined;
                                }
            				})(),
            				"frametrail:resourceId": overlays[i].resourceId
            			},
            			"frametrail:events": overlays[i].events,
            			"frametrail:attributes": overlays[i].attributes
                    });
                    //console.log(contents);
                    if (contents[contents.length-1].body['frametrail:type'] === 'location') {
                        var contentItem = contents[contents.length-1];
                        contentItem.body['frametrail:lat'] = overlays[i].attributes.lat;
                        contentItem.body['frametrail:long'] = overlays[i].attributes.lon;
                        contentItem.body['frametrail:boundingBox'] = (overlays[i].attributes.boundingBox) ?  overlays[i].attributes.boundingBox.join(',') : '';
                        delete contentItem["frametrail:attributes"].lat;
                        delete contentItem["frametrail:attributes"].lon;
                        delete contentItem["frametrail:attributes"].boundingBox;
                    }
                }
                for (var i in codeSnippets.timebasedEvents) {
                    var codeSnippetItem = codeSnippets.timebasedEvents[i];
                    contents.push({
                        "@context": [
            				  "http://www.w3.org/ns/anno.jsonld",
            				  {
            					  "frametrail": "http://frametrail.org/ns/"
            				  }
            			],
            			"creator": {
            				"nickname": codeSnippetItem.creator,
            				"type": "Person",
            				"id": codeSnippetItem.creatorId
            			 },
            			"created": (new Date(codeSnippetItem.created)).toString(),
            			"type": "Annotation",
            			"frametrail:type": "CodeSnippet",
            			"frametrail:tags": codeSnippetItem.tags,
            			"target": {
            				"type": "Video",
            				"source": FrameTrail.module('HypervideoModel').sourceFiles.mp4,
            				"selector": {
            					"conformsTo": "http://www.w3.org/TR/media-frags/",
            					"type": "FragmentSelector",
            					"value": "t=" + codeSnippetItem.start
            				}
            			  },
            			"body": {
                        	"type": "TextualBody",
                        	"frametrail:type": "codesnippet",
                        	"format" : "text/javascript",
                        	"value" : codeSnippetItem.snippet,
                        	"frametrail:name": codeSnippetItem.name,
                        	"frametrail:thumb": null,
                        	"frametrail:resourceId": null
                        },
            			"frametrail:attributes": codeSnippetItem.attributes
                    });
                }
        	    return contents;
        	})(),
        	"subtitles": hypervideos[thisHypervideoID].subtitles
        });

    }


    /**
     * I save the config data back to the server.
     *
     * My success callback gets one argument, which is either
     *
     *     { success: true }
     * or
     *     { failed: 'config', error: ... }
     *
     * @method saveConfig
     * @param {Function} callback
     */
    function saveConfig(callback) {

        $.ajax({
            type:   'POST',
            url:    '_server/ajaxServer.php',
            cache:  false,

            data: {
                a:              'configChange',
                src:            JSON.stringify(config, null, 4)
            }

        }).done(function(data) {

            if (data.code === 0) {

                callback.call(window, { success: true });

            } else {

                callback.call(window, {
                    failed: 'config',
                    error: data.string,
                    code: data.code
                });

            }

        }).fail(function(error){

            callback.call(window, {
                failed: 'config',
                error: error
            });

        });

    };


    /**
     * I save the global custom CSS back to the server (/_data/custom.css).
     *
     * My success callback gets one argument, which is either
     *
     *     { success: true }
     * or
     *     { failed: 'globalcss', error: ... }
     *
     * @method saveGlobalCSS
     * @param {Function} callback
     */
    function saveGlobalCSS(callback) {

        var styles = $('head > style.FrameTrailGlobalCustomCSS').html();

        $.ajax({
            type:   'POST',
            url:    '_server/ajaxServer.php',
            cache:  false,

            data: {
                a:              'globalCSSChange',
                src:            styles
            }

        }).done(function(data) {

            if (data.code === 0) {

                callback.call(window, { success: true });

            } else {

                callback.call(window, {
                    failed: 'globalcss',
                    error: 'ServerError',
                    code: data.code
                });

            }

        }).fail(function(error){

            callback.call(window, {
                failed: 'globalcss',
                error: error
            });

        });

    };


    /**
     * I save the complete hypervideo data back to the server.
     *
     * My success callback gets one argument, which is either
     *
     *     { success: true }
     * or
     *     { failed: 'hypervideo', error: ... }
     *
     * @method saveOverlays
     * @param {Function} callback
     */
    function saveHypervideo(callback, thisHypervideoID) {

        thisHypervideoID = thisHypervideoID || hypervideoID;

        var saveData = convertToDatabaseFormat(thisHypervideoID);
        //console.log(saveData);

        $.ajax({
            type:   'POST',
            url:    '_server/ajaxServer.php',
            cache:  false,

            data: {
                a:              'hypervideoChange',
                hypervideoID:   thisHypervideoID,
                src:            JSON.stringify(saveData, null, 4)
            }

        }).done(function(data) {

            if (data.code === 0) {

                callback.call(window, { success: true });

            } else {

                callback.call(window, {
                    failed: 'hypervideo',
                    error: 'ServerError',
                    code: data.code
                });

            }

        }).fail(function(error){

            callback.call(window, {
                failed: 'hypervideo',
                error: error
            });

        });

    };


    /**
     * I save the annotation data back to the server.
     *
     * I choose by myself the appropriate server method ($_POST["action"]: "save" or "saveAs")
     * wether the user's annotation file does already exist, or has to be created.
     *
     * My success callback gets one argument, which is either
     *
     *     { success: true }
     *
     * or
     *
     *     { failed: 'annotations', error: ... }
     *
     * @method saveAnnotations
     * @param {Function} callback
     */
    function saveAnnotations(callback) {

        var userID              = FrameTrail.module('UserManagement').userID,
            action              = annotationfileIDs.hasOwnProperty(userID)
                                    ? 'save'
                                    : 'saveAs',

            annotationfileID    = annotationfileIDs[userID],

            name                = FrameTrail.getState('username'),
            description         = FrameTrail.getState('username') + '\'s annotations',
            hidden              = false;

            annotationsToSave   = [];


        for (var i in annotations[userID]) {
            var annotationItem = annotations[userID][i];
            annotationsToSave.push({
        		"@context": [
        			"http://www.w3.org/ns/anno.jsonld",
        			{
        				"frametrail": "http://frametrail.org/ns/"
        			}
        		],
        		"creator": {
        			"nickname": annotationItem.creator,
        			"type": "Person",
        			"id": annotationItem.creatorId
        		},
        		"created": (new Date(annotationItem.created)).toString(),
        		"type": "Annotation",
        		"frametrail:type": "Annotation",
        		"frametrail:tags": annotationItem.tags || [],
        		"target": {
        			"type": "Video",
        			"source": FrameTrail.module('HypervideoModel').sourceFiles.mp4,
        			"selector": {
        				"conformsTo": "http://www.w3.org/TR/media-frags/",
        				"type": "FragmentSelector",
        				"value": "t=" + annotationItem.start + "," + annotationItem.end
        			}
        		},
        		"body": {
                    "type": ({
                        'image': 'Image',
                        'video': 'Video',
                        'location': 'Dataset',
                        'wikipedia': 'Text',
                        'text': 'TextualBody',
                        'vimeo': 'Video',
                        'webpage': 'Text',
                        'youtube': 'Video'
                    })[annotationItem.type],
                    "frametrail:type": annotationItem.type,
                    "format": ({
                        'image': 'image/' + (function () {
                            try {
                                return (annotationItem.src ? (/\.(\w{3,4})$/g.exec(annotationItem.src)[1]) : '*')
                            } catch (_) {
                                return '*';
                            }
                        })(),
                        'video': 'video/mp4',
                        'location': 'application/x-frametrail-location',
                        'wikipedia': 'text/html',
                        'text': 'text/html',
                        'vimeo': 'text/html',
                        'webpage': 'text/html',
                        'youtube': 'text/html'
                    })[annotationItem.type],
                    "source": (function () {
                        if (['codesnippet', 'text', 'webpage', 'wikipedia',].indexOf( annotationItem.type ) < 0) {
                            return annotationItem.src
                        }
                        return undefined;
                    })(),
                    "value": (function () {
                        if (['codesnippet', 'text', 'webpage', 'wikipedia',].indexOf( annotationItem.type ) >= 0) {
                            return annotationItem.src
                        }
                        return undefined;
                    })(),
                    "frametrail:name": annotationItem.name,
                    "frametrail:thumb": annotationItem.thumb,
                    "selector": (function () {
                        if (   ['video', 'vimeo', 'youtube'].indexOf(annotationItem.type) >= 0
                            && annotationItem.startOffset
                            && annotationItem.endOffset
                        ) {
                            return {
                                "type": "FragmentSelector",
                                "conformsTo": "http://www.w3.org/TR/media-frags/",
                                "value": "t=" + annotationItem.startOffset + "," + annotationItem.endOffset
                            }
                        } else {
                            return undefined;
                        }
                    })(),
                    "frametrail:resourceId": annotationItem.resourceId,
                    "frametrail:attributes": annotationItem.attributes
        		}
            });
            if (annotationsToSave[annotationsToSave.length-1].body['frametrail:type'] === 'location') {
                var annotationBody = annotationsToSave[annotationsToSave.length-1].body;
                annotationBody['frametrail:lat'] = annotationItem.attributes.lat;
                annotationBody['frametrail:long'] = annotationItem.attributes.lon;
                annotationBody['frametrail:boundingBox'] = annotationItem.attributes.boundingBox.join(',');
            }

        }

        //console.log(annotationsToSave);

        $.ajax({
            type:   'POST',
            url:    '_server/ajaxServer.php',
            cache:  false,

            data: {

                a:                'annotationfileSave',
                hypervideoID:     hypervideoID,
                action:           action,
                annotationfileID: annotationfileID,
                name:             name,
                description:      description,
                hidden:           hidden,

                src:              JSON.stringify(annotationsToSave, null, 4)

            }

        }).done(function(data) {

            if (data.code === 0) {

                if (action === 'saveAs') {
                    annotationfileIDs[userID] = data.annotationID.toString();
                }

                callback.call(window, { success: true });

            } else {

                callback.call(window, {
                    failed: 'annotations',
                    error: 'ServerError',
                    code: data.code
                });

            }

        }).fail(function(error){

            callback.call(window, {
                failed: 'annotations',
                error: error
            });

        });


    };









    /**
     * I search the resource database for a given data object and return its id.
     *
     * @method getIdOfResource
     * @param {} resourceData
     * @return String or null
     */
    function getIdOfResource(resourceData) {

        if (resourceData.resourceId) {
            return resourceData.resourceId;
        } else {
            for (var id in resources) {
                if (resources[id] === resourceData){
                    return id;
                }
            }
        }

        return null;
    };


    /**
     * I search the hypervideo database for a given data object and return its id.
     *
     * @method getIdOfHypervideo
     * @param {} data
     * @return String or null
     */
    function getIdOfHypervideo(data) {

        for (var id in hypervideos) {
            if (hypervideos[id] === data){
                return id;
            }
        }
        return null;
    };



    return {

        /**
         * I store the hypervideo index data (from the server's _data/hypervideos/_index.json)
         * @attribute hypervideos
         */
        get hypervideos()   { return hypervideos },
        /**
         * I store the hypervideo index data for the current hypervideo
         * @attribute hypervideo
         */
        get hypervideo()     { return hypervideo },

        //TODO Check if setting hypervideo data on update necessary
        set hypervideo(data) { return hypervideo = data },

        /**
         * I store the hypervideo sequence data (from the server's _data/hypervideos/<ID>/hypervideo.json)
         * @attribute sequence
         */
        get sequence()      { return sequence },
        /**
         * I store the overlays data (from the server's _data/hypervideos/<ID>/overlays.json)
         * @attribute overlays
         */
        get overlays()      { return overlays },
        /**
         * I store the code snippets data (from the server's _data/hypervideos/<ID>/codeSnippets.json)
         * @attribute codesnippets
         */
        get codeSnippets()         { return codeSnippets },

        /**
         * I store the annotation data (from all json files from the server's _data/hypervideos/<ID>/annotationfiles/).
         *
         * I am a map of keys (userIDs) to an array of all annotations from that user.
         *
         *     {
         *         "userID": [ annotationData, annotationData, ... ]
         *     }
         *
         *
         * @attribute annotations
         */
        get annotations()        { return annotations       },
        /**
         * I store the file IDs of the user's annotation sets.
         *
         * The server manages file names automatically without influence of the client. That is why the client has to remeber the file ID
         * of the several sets of annotations, which belong to a single user.
         *
         *     {
         *       "userID": "fileID"
         *     }
         *
         * @attribute annotationfileIDs
         */
        get annotationfileIDs()  { return annotationfileIDs },

        /**
         * I store the subtitle data (from all .vtt files from the server's _data/hypervideos/<ID>/subtitles/).
         *
         * @attribute annotations
         */
        get subtitles()        { return subtitles       },

        /**
         * I store a map of subtitle language codes and labels.
         *
         * @attribute subtitlesLangMapping
         */
        get subtitlesLangMapping() { return subtitlesLangMapping },

        /**
         * I store the resource index data (from the server's _data/resources/_index.json)
         * @attribute resources
         */
        get resources()     { return resources },

        /**
         * I store the user data (user.json). The keys are the userIDs, and the values are maps of the user's attributes.
         * @attribute users
         */
        get users()     { return users },

        /**
         * I store the config data (config.json).
         * @attribute users
         */
        get config()     { return config },


        getIdOfResource:       getIdOfResource,
        getIdOfHypervideo:     getIdOfHypervideo,

        loadData:              loadData,
        loadResourceData:      loadResourceData,
        loadConfigData:        loadConfigData,

        loadHypervideoData:    loadHypervideoData,
        updateHypervideoData:  updateHypervideoData,
        loadSequenceData:      loadSequenceData,
        loadSubtitleData:      loadSubtitleData,

        saveHypervideo:        saveHypervideo,
        saveAnnotations:       saveAnnotations,
        saveConfig:            saveConfig,
        saveGlobalCSS:         saveGlobalCSS,

        //TODO only shortcut for now
        convertToDatabaseFormat: convertToDatabaseFormat

    }



});
