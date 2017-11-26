/**
 * @module Shared
 */

/**
 * I am the TagModel.
 * I manage the tag definitions stored on the server for each project, and localize their labels and descriptions.
 *
 * I query the {{#crossLink "HypervideoModel"}}HypervideoModel{{/crossLink}} for filtered collections of Overlays and Annotations
 *
 * @class TagModel
 * @static
 */

 FrameTrail.defineModule('TagModel', function(){


    var projectID   = FrameTrail.module('RouteNavigation').projectID || '',
        tags        = {};




    function initTagModel (success, fail) {

        updateTagModel(success, fail);

    }

    function updateTagModel (success, fail) {

        $.ajax({
            type:     "GET",
            url:      '../_data/projects/' + projectID + '/tagdefinitions.json',
            cache:    false,
            dataType: "json",
            mimeType: "application/json"
        }).done(function(data){
            tags = data;
            success();
        }).fail(function(){
            fail('No tagdefinitions.json');
        });

    }


    function getAllTagLabelsAndDescriptions (language) {

        var result = {};

        for (var tagname in tags) {
            result[tagname] = tags[tagname][language];
        }

        return result;

    }

    function getTagLabelAndDescription (tagname, language) {
        return tags[tagname][language];
    }


    function setTag (tagname, language, label, description, success, fail) {

        $.ajax({
            type:   'POST',
            url:    '../_server/ajaxServer.php',
            cache:  false,
            data: {
                a:              'tagSet',
                projectID:      projectID,
                tagName:        tagname,
                lang:           language,
                label:          label,
                description:    description
            }

        }).done(function(data) {
            updateTagModel(success, fail);
        }).fail(fail);

    }

    function deleteLang (tagname, language, success, fail) {

        $.ajax({
            type:   'POST',
            url:    '../_server/ajaxServer.php',
            cache:  false,
            data: {
                a:              'tagLangDelete',
                projectID:      projectID,
                tagName:        tagname,
                language:       language
            }

        }).done(function(data) {
            updateTagModel(success, fail);
        }).fail(fail);

    }

    function deleteTag (tagname, success, fail) {

        $.ajax({
            type:   'POST',
            url:    '../_server/ajaxServer.php',
            cache:  false,
            data: {
                a:              'tagDelete',
                projectID:      projectID,
                tagName:        tagname
            }

        }).done(function(data) {
            updateTagModel(success, fail);
        }).fail(fail);

    }


    function getContentCollection (
        arrayOfTagnames, // if empty, collect all items regardless of tagname
        overlays, // bool
        annotations, // bool
        arrayOfUserIDsForAnnotations,
        searchText,
        arrayOfContentTypes // frametrail:type
    ) {

        var result = FrameTrail.module('HypervideoModel').allAnnotations.filter(function (annotationItem) {

            var match = false,
                annotationData = annotationItem.data;

            if (arrayOfTagnames.length === 0) {
                match = true
            } else {
                for (var i in annotationData.tags) {
                    if (arrayOfTagnames.indexOf( annotationData.tags[i] ) > -1) {
                        //console.log('tag', annotationData.tags[i]);
                        match = true;
                        break;
                    }
                }
            }

            // empty arrayOfUserIDsForAnnotations means no filtering by user ids
            if (arrayOfUserIDsForAnnotations.length > 0) {
                if (arrayOfUserIDsForAnnotations.map(String).indexOf(String(annotationData.creatorId)) < 0) {
                    //console.log(annotationData.creatorId);
                    match = false;
                }
            }

            // empty arrayOfContentTypes means no filtering by content types
            if (arrayOfContentTypes.length > 0) {
                if (arrayOfContentTypes.indexOf(annotationData.type) < 0) {
                    //console.log(annotationData.type);
                    match = false;
                }
            }

            // empty searchText string means no filtering by search text
            if (searchText.length > 0) {
                if (annotationData.name.toLowerCase().indexOf(searchText.toLowerCase()) < 0) {
                    match = false;
                }
            }
            
            return match;

        });

        if (overlays) {
            result.concat(FrameTrail.module('HypervideoModel').overlays.filter(function (overlayItem) {

                var match = false,
                    overlayData = overlayItem.data;

                if (arrayOfTagnames.length === 0) {
                    match = true
                } else {
                    for (var i in overlayData.tags) {
                        if (arrayOfTagnames.indexOf( overlayData.tags[i] ) > -1) {
                            match = true;
                            break;
                        }
                    }
                }

                // empty arrayOfUserIDsForAnnotations means no filtering by user ids
                if (arrayOfUserIDsForAnnotations.length > 0) {
                    if (arrayOfUserIDsForAnnotations.map(String).indexOf(String(overlayData.creatorId)) < 0) {
                        match = false;
                    }
                }

                if (arrayOfContentTypes.indexOf(overlayData.type) < 0) {
                    match = false;
                }

                if (searchText) {
                    if (overlayData.name.indexOf(searchText) < 0) {
                        match = false;
                    }
                }

                return match;

            }));
        }

        return result;

    }




    return {
        initTagModel: initTagModel,
        updateTagModel: updateTagModel,

        getAllTagLabelsAndDescriptions: getAllTagLabelsAndDescriptions,
        getTagLabelAndDescription: getTagLabelAndDescription,

        setTag: setTag,
        deleteLang: deleteLang,
        deleteTag: deleteTag,

        getContentCollection: getContentCollection,
    }

});
