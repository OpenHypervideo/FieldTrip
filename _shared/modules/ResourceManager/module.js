/**
 * @module Shared
 */


/**
 * I am the ResourceManager.
 *
 * I contain the business logic for managing all Resources and rendering lists of them for display.
 *
 * I am closely connected with {{#crossLink "ViewResource"}}ViewResource{{/crossLink}}.
 *
 * @class ResourceManager
 * @static
 */


FrameTrail.defineModule('ResourceManager', function(FrameTrail){

	var maxUploadBytes,
        tmpObj;



	/**
	 * I tell the {{#crossLink "Database/loadResourceData:method"}}Database{{/crossLink}} to reload the index data.
	 * @method updateResourceDatabase
	 */
	function updateResourceDatabase() {

		FrameTrail.module('Database').loadResourceData();

	};



	//Check for valid URL
    $(document).on('paste blur input', '.resourceInputTabURL input', function(evt) {
        checkResourceInput( this.value, $('.resourceNameInput')[0].value );
        evt.stopPropagation();
    });

    //Check for Name Length
    $(document).on('change paste keyup input', '.resourceNameInput', function(evt) {
        if ( $(this).val().length > 2 ) {
            $('.newResourceConfirm').button('enable');
        } else {
            $('.newResourceConfirm').button('disable');
        }
        evt.stopPropagation();
    });



	/**
	 * I open a jquery UI dialog, which allows the user to upload a new resource.
     * When the onlyVideo parameter is set to true, I allow only uploads of videos (needed during creation of a new hypervideo)
	 *
	 * @method uploadResource
	 * @param {Function} successCallback
     * @param {Boolean} onlyVideo
	 *
	 */
	function uploadResource(successCallback, onlyVideo) {
        FrameTrail.module('UserManagement').ensureAuthenticated(function(){

            $.ajax({
                type:     'GET',
                url:        '_server/ajaxServer.php',
                data:       {'a':'fileGetMaxUploadSize'},
                success: function(response) {

                    maxUploadBytes = response.maxuploadbytes;

                    var uploadDialog =  $('<div class="uploadDialog" title="Add New Resource">'
                                        + '    <form class="uploadForm" method="post">'
                                        + '        <div class="resourceInputTabContainer">'
                                        + '            <ul class="resourceInputTabList">'
                                        + '                <li data-type="url"><a href="#resourceInputTabURL">Paste URL</a></li>'
                                        + '                <li data-type="image"><a href="#resourceInputTabImage">Upload Image</a></li>'
                                        + '                <li data-type="video"><a href="#resourceInputTabVideo">Upload Video</a></li>'
                                        + '                <li data-type="audio"><a href="#resourceInputTabAudio">Upload Audio</a></li>'
                                        + '                <li data-type="pdf"><a href="#resourceInputTabPDF">Upload PDF</a></li>'
                                        + '                <li data-type="map"><a href="#resourceInputTabMap">Add Map</a></li>'
                                        + '            </ul>'
                                        + '            <div id="resourceInputTabURL">'
                                        + '                <div class="resourceInputMessage message active">Paste any URL (eg. http://example.com).<br>Some types will be detected automatically (ie. Image, Wikipedia, Youtube, Vimeo).</div>'
                                        + '                <input type="text" name="test" placeholder="URL" class="resourceInput">'
                                        + '            </div>'
                                        + '            <div id="resourceInputTabImage">'
                                        + '                <div class="message active">Add image file in the format <b>jpg, jpeg, gif, png</b>. Maximum File Size: <b>3 MB</b></div>'
                                        + '                <input type="file" name="image">'
                                        + '            </div>'
                                        + '            <div id="resourceInputTabVideo">'
                                        + '                <div class="videoInputMessage message active">Add video file in <b>mp4</b> format. Maximum File Size: <b>'+ bytesToSize(maxUploadBytes) +'</b>.<br>For more info on video conversion see http://www.mirovideoconverter.com.</div>'
                                        + '                <input type="file" name="mp4"> .mp4'
                                        + '            </div>'
                                        + '            <div id="resourceInputTabAudio">'
                                        + '                <div class="audioInputMessage message active">Add audio file in <b>MP3</b> format. Maximum File Size: <b>3 MB</b>.</div>'
                                        + '                <input type="file" name="audio"> .mp3'
                                        + '            </div>'
                                        + '            <div id="resourceInputTabPDF">'
                                        + '                <div class="pdfInputMessage message active">Add video file in <b>PDF</b> format. Maximum File Size: <b>3 MB</b>.</div>'
                                        + '                <input type="file" name="pdf"> .pdf'
                                        + '            </div>'
                                        + '            <div id="resourceInputTabMap">'
                                        + '                <div class="locationSearchWrapper">'
                                        + '                    <input type="text" name="locationQ" class="locationQ" placeholder="Location Search">'
                                        + '                    <span class="locationSearchCopyright">Data © OpenStreetMap contributors, ODbL 1.0.</span>'
                                        + '                    <ul class="locationSearchSuggestions"></ul>'
                                        + '                </div>'
                                        + '                <input type="text" name="lat" placeholder="latitude">'
                                        + '                <input type="text" name="lon" placeholder="longitude">'
                                        + '                <input type="hidden" name="boundingBox[]" class="BB1">'
                                        + '                <input type="hidden" name="boundingBox[]" class="BB2">'
                                        + '                <input type="hidden" name="boundingBox[]" class="BB3">'
                                        + '                <input type="hidden" name="boundingBox[]" class="BB4">'
                                        + '            </div>'
                                        + '        </div>'
                                        + '        <div class="nameInputContainer">'
                                        + '            <div class="nameInputMessage">Name</div>'
                                        + '            <input type="text" name="name" placeholder="Enter a name for the new resource" class="resourceNameInput">'
                                        + '            <input type="hidden" name="a" value="fileUpload">'
                                        + '            <input type="hidden" name="attributes" value="">'
                                        + '            <input type="hidden" name="type" value="url">'
                                        + '        </div>'
                                        + '    </form>'
                                        + '    <div class="progress">'
                                        + '        <div class="bar"></div >'
                                        + '        <div class="percent">0%</div >'
                                        + '        <div class="uploadStatus"></div>'
                                        + '    </div>'
                                        + '</div>'

                                        + '</div>');

                    uploadDialog.find('input[type="file"]').on('change', function() {

                        if (this.files[0].size > maxUploadBytes) {
                            uploadDialog.find('.newResourceConfirm').prop('disabled', true);
                            $('.uploadDialog').append('<div class="message active error">File size is too big. Maximum size due to server settings: '+ bytesToSize(maxUploadBytes) +'. <br>Please ask your server administrator to allow a bigger upload size, post size, memory limit and longer execution time in the PHP settings.</div>');
                        } else {
                            uploadDialog.find('.newResourceConfirm').prop('disabled', false);
                            uploadDialog.find('.message.error').remove();

                        }

                    });

                    uploadDialog.find('.resourceInputTabContainer').tabs({
                        activate: function(e,ui) {

                            uploadDialog.find('.nameInputContainer input[name="attributes"]').val('');
                            uploadDialog.find('.nameInputContainer input[name="type"]').val($(ui.newTab[0]).data('type'));
                            uploadDialog.find('.message.error').remove();

                        },

                        create: function(e,ui) {

                        	if (onlyVideo) {

                            	uploadDialog.find('.resourceInputTabContainer').tabs(
                            		'option',
                            		'active',
                            		uploadDialog.find('#resourceInputTabVideo').index() - 1
                            	);

                            	uploadDialog.find('.resourceInputTabContainer').tabs('disable');
                            	uploadDialog.find('.resourceInputTabContainer').tabs('enable', '#resourceInputTabVideo');

                            }


                        }

                    });

                    uploadDialog.find('.locationQ').keyup(function(e) {

                        $.getJSON('//nominatim.openstreetmap.org/search?q='+ uploadDialog.find('.locationQ').val() + '&format=json')
                            .done(function(respText) {

                                uploadDialog.find('.locationSearchSuggestions').empty();
                                uploadDialog.find('.locationSearchSuggestions').show();

                                for (var location in respText) {

                                    var suggestion = $('<li data-lon="'+ respText[location].lon +'" data-lat="'+ respText[location].lat +'" data-display-name="'+ respText[location].display_name +'" data-bb1="'+ respText[location].boundingbox[0] +'" data-bb2="'+ respText[location].boundingbox[1] +'" data-bb3="'+ respText[location].boundingbox[2] +'" data-bb4="'+ respText[location].boundingbox[3] +'">'+ respText[location].display_name +'</li>')
                                        .click(function() {
                                            uploadDialog.find('input[name="lon"]').val( $(this).attr('data-lon') );
                                            uploadDialog.find('input[name="lat"]').val( $(this).attr('data-lat') );
                                            uploadDialog.find('input.BB1').val( $(this).attr('data-bb1') );
                                            uploadDialog.find('input.BB2').val( $(this).attr('data-bb2') );
                                            uploadDialog.find('input.BB3').val( $(this).attr('data-bb3') );
                                            uploadDialog.find('input.BB4').val( $(this).attr('data-bb4') );
                                            uploadDialog.find('input[name="name"]').val( $(this).attr('data-display-name') );
                                            uploadDialog.find('.locationSearchSuggestions').hide();
                                        })
                                        .appendTo( uploadDialog.find('.locationSearchSuggestions') );
                                }
                                //console.log(respText);
                            });

                    });




                    //Ajaxform
                    uploadDialog.find('.uploadForm').ajaxForm({
                        method:     'POST',
                        url:        '_server/ajaxServer.php',
                        beforeSerialize: function() {

                            uploadDialog.find('.message.error').remove();

                            var tmpType = uploadDialog.find('.nameInputContainer input[name="type"]').val();

                            if (tmpType == 'url') {
                                tmpObj = checkResourceInput( uploadDialog.find('.resourceInput').val(), uploadDialog.find('.resourceNameInput').val() );
                                uploadDialog.find('.nameInputContainer input[name="attributes"]').val(JSON.stringify(tmpObj));
                                tmpObj = [];
                            }

                            else if (tmpType == 'image') {
                                uploadDialog.find('#resourceInputTabVideo input').prop('disabled',true);
                                uploadDialog.find('#resourceInputTabPDF input').prop('disabled',true);
                                uploadDialog.find('#resourceInputTabAudio input').prop('disabled',true);
                            }

                            else if (tmpType == 'video') {
                                uploadDialog.find('#resourceInputTabImage input').prop('disabled',true);
                                uploadDialog.find('#resourceInputTabPDF input').prop('disabled',true);
                                uploadDialog.find('#resourceInputTabAudio input').prop('disabled',true);
                            }

                            else if (tmpType == 'audio') {
                                uploadDialog.find('#resourceInputTabImage input').prop('disabled',true);
                                uploadDialog.find('#resourceInputTabVideo input').prop('disabled',true);
                                uploadDialog.find('#resourceInputTabPDF input').prop('disabled',true);
                            }

                            else if (tmpType == 'pdf') {
                                uploadDialog.find('#resourceInputTabImage input').prop('disabled',true);
                                uploadDialog.find('#resourceInputTabVideo input').prop('disabled',true);
                                uploadDialog.find('#resourceInputTabAudio input').prop('disabled',true);
                            }

                            var percentVal = '0%';

                            uploadDialog.find('.bar').width(percentVal);
                            uploadDialog.find('.percent').html(percentVal);
                            uploadDialog.find('.uploadStatus').html('Uploading Resource ...');
                            uploadDialog.find('.progress').show();

                            $('.newResourceConfirm').prop('disabled', true);

                        },
                        beforeSend: function(xhr) {
                            var tmpType = uploadDialog.find('.nameInputContainer input[name="type"]').val();

                            // client side pre-validation (server checks again)
                            if (tmpType == 'video') {
                                if( uploadDialog.find('[name="mp4"]').val().length < 4) {
                                    uploadDialog.find('.progress').hide();
                                    uploadDialog.find('.newResourceConfirm').prop('disabled', false);
                                    $('.uploadDialog').append('<div class="message active error">Please choose a video file.</div>');
                                    xhr.abort();
                                }

                            }

                        },
                        data: tmpObj,
                        uploadProgress: function(event, position, total, percentComplete) {

                            var percentVal = percentComplete + '%';

                            uploadDialog.find('.bar').width(percentVal)
                            uploadDialog.find('.percent').html(percentVal);

                        },
                        success: function(respText) {

                            var percentVal = '100%';

                            uploadDialog.find('.bar').width(percentVal)
                            uploadDialog.find('.percent').html(percentVal);

                            switch (respText['code']) {
                                case 0:

                                    // Upload Successful

                                    if (respText['response']['resource']['type'] == 'video') {

                                        uploadDialog.find('.uploadStatus').html('Generating Thumbnail ...');

                                        var tmpVideo = $('<video id="tmpVideo" style="visibility: hidden;​ height:​ 300px;​ width:​ 400px;​ position:​ absolute;​">​</video>​');
                                        var tmpCanvas = $('<canvas id="tmpCanvas" width="400px" height="300px" style="visibility: hidden; position: absolute;"></canvas>');
                                        $('body').append(tmpVideo);
                                        $('body').append(tmpCanvas);
                                        var video = document.getElementById('tmpVideo');
                                        var canvas = document.getElementById('tmpCanvas');

                                        if ( (video.canPlayType('video/mp4') || (video.canPlayType('video/mpeg4'))) ) {
                                            video.src = FrameTrail.module('RouteNavigation').getResourceURL(respText.response.resource.src);
                                        } else {
                                            console.log('Video Playback Error. Thumbnail could not be generated.');
                                        }

                                        video.addEventListener('loadeddata', function() {
                                            // Go to middle & Play
                                            video.currentTime = video.duration/2;
                                            video.play();
                                        });

                                        video.addEventListener('playing', function() {
                                            // Adapt and adjust Video & Canvas Dimensions
                                            //video.width = canvas.width = video.offsetWidth;
                                            //video.height = canvas.height = video.offsetHeight;
                                            // Draw current Video-Frame on Canvas
                                            canvas.getContext('2d').drawImage(video, 0, 0, 400, 300);
                                            video.pause();

                                            try {
                                                canvas.toDataURL();

                                                $.ajax({
                                                    url:        '_server/ajaxServer.php',
                                                    type:       'post',
                                                    data:       {'a':'fileUploadThumb','resourcesID':respText['response']['resId'],'type':respText['response']['resource']['type'],'thumb':canvas.toDataURL()},
                                                    /**
                                                     * Description
                                                     * @method success
                                                     * @return
                                                     */
                                                    success: function() {
                                                        $(video).remove();
                                                        $(canvas).remove();

                                                        //addResource(respText["res"]);
                                                        FrameTrail.module('Database').loadResourceData(function() {
                                                            uploadDialog.dialog('close');
                                                            successCallback && successCallback.call();
                                                        });
                                                    }
                                                });
                                            } catch(error) {
                                                $(image).remove();
                                                $(canvas).remove();

                                                FrameTrail.module('Database').loadResourceData(function() {
                                                    uploadDialog.dialog('close');
                                                    successCallback && successCallback.call();
                                                });
                                            }
                                        });

                                    } else if (respText['response']['resource']['type'] == 'image'
                                                && (/\.(jpg|jpeg|png)$/i.exec(respText['response']['resource']['src'])) ) {

                                        uploadDialog.find('.uploadStatus').html('Generating Thumbnail ...');

                                        var tmpImage = $('<img id="tmpImage" style="visibility: hidden;​ height:​ 250px;​ width:​350px;​ position:​ absolute;​"/>​');
                                        var tmpCanvas = $('<canvas id="tmpCanvas" width="350px" height="250px" style="visibility:hidden; position: absolute;"></canvas>');
                                        $('body').append(tmpImage);
                                        $('body').append(tmpCanvas);
                                        var image = document.getElementById('tmpImage');
                                        var canvas = document.getElementById('tmpCanvas');

                                        image.src = FrameTrail.module('RouteNavigation').getResourceURL(respText['response']['resource']['src']);
                                        image.addEventListener('load', function() {

                                            // Adapt and adjust Image & Canvas Dimensions
                                            //image.width = canvas.width = image.offsetWidth;
                                            //image.height = canvas.height = image.offsetHeight;
                                            // Draw current Image on Canvas
                                            canvas.getContext('2d').drawImage(image, 0, 0, 350, 250);

                                            try {
                                                canvas.toDataURL();

                                                $.ajax({
                                                    url:        '_server/ajaxServer.php',
                                                    type:       'post',
                                                    data:       {'a':'fileUploadThumb','resourcesID':respText['response']['resId'],'type':respText['response']['resource']['type'],'thumb':canvas.toDataURL()},
                                                    success: function() {
                                                        $(image).remove();
                                                        $(canvas).remove();

                                                        //addResource(respText["res"]);
                                                        FrameTrail.module('Database').loadResourceData(function() {
                                                            uploadDialog.dialog('close');
                                                            successCallback && successCallback.call();
                                                        });
                                                    }
                                                });
                                            } catch(error) {
                                                $(image).remove();
                                                $(canvas).remove();

                                                FrameTrail.module('Database').loadResourceData(function() {
                                                    uploadDialog.dialog('close');
                                                    successCallback && successCallback.call();
                                                });
                                            }


                                        });

                                    } else {

                                        //addResource(respText['response']);
                                        FrameTrail.module('Database').loadResourceData(function() {
                                            uploadDialog.dialog('close');
                                            successCallback && successCallback.call();
                                        });

                                    }
                                    break;
                                case 1:
                                    uploadDialog.find('.progress').hide();
                                    uploadDialog.find('.newResourceConfirm').prop('disabled', false);
                                    $('.uploadDialog').append('<div class="message active error">You are not logged in anymore.</div>');
                                    break;
                                case 2:
                                    uploadDialog.find('.progress').hide();
                                    uploadDialog.find('.newResourceConfirm').prop('disabled', false);
                                    $('.uploadDialog').append('<div class="message active error">You are not activated.</div>');
                                    break;
                                case 3:
                                    uploadDialog.find('.progress').hide();
                                    uploadDialog.find('.newResourceConfirm').prop('disabled', false);
                                    $('.uploadDialog').append('<div class="message active error">Could not find resources folder.</div>');
                                    break;
                                case 4:
                                    uploadDialog.find('.progress').hide();
                                    uploadDialog.find('.newResourceConfirm').prop('disabled', false);
                                    $('.uploadDialog').append('<div class="message active error">Please choose an image file</div>');
                                    break;
                                case 5:
                                    uploadDialog.find('.progress').hide();
                                    uploadDialog.find('.newResourceConfirm').prop('disabled', false);
                                    $('.uploadDialog').append('<div class="message active error">Please choose a video file</div>');
                                    break;
                                case 6:
                                    uploadDialog.find('.progress').hide();
                                    uploadDialog.find('.newResourceConfirm').prop('disabled', false);
                                    $('.uploadDialog').append('<div class="message active error">Please make sure you choose the right video format (.mp4)</div>');
                                    break;
                                case 7:
                                    uploadDialog.find('.progress').hide();
                                    uploadDialog.find('.newResourceConfirm').prop('disabled', false);
                                    $('.uploadDialog').append('<div class="message active error">Type "map" was expected but $lat or $lon are empty</div>');
                                    break;
                                case 8:
                                    uploadDialog.find('.progress').hide();
                                    uploadDialog.find('.newResourceConfirm').prop('disabled', false);
                                    $('.uploadDialog').append('<div class="message active error">Type or Name were empty. Did you add a Resource Name?</div>');
                                    break;
                                case 9:
                                    uploadDialog.find('.progress').hide();
                                    uploadDialog.find('.newResourceConfirm').prop('disabled', false);
                                    $('.uploadDialog').append('<div class="message active error">Wrong Type</div>');
                                    break;
                                case 10:
                                    uploadDialog.find('.progress').hide();
                                    uploadDialog.find('.newResourceConfirm').prop('disabled', false);
                                    $('.uploadDialog').append('<div class="message active error">File size is too big. Please ask the server administrator to allow a bigger upload size, post size and longer execution time.</div>');
                                    break;
                                case 11:
                                    uploadDialog.find('.progress').hide();
                                    uploadDialog.find('.newResourceConfirm').prop('disabled', false);
                                    $('.uploadDialog').append('<div class="message active error">Empty field: URL. Please provide a valid url.</div>');
                                    break;
                                case 20:
                                    uploadDialog.find('.progress').hide();
                                    uploadDialog.find('.newResourceConfirm').prop('disabled', false);
                                    $('.uploadDialog').append('<div class="message active error">You are not allowed to upload files.</div>');
                                    break;
                                default:
                                    uploadDialog.find('.progress').hide();
                                    uploadDialog.find('.newResourceConfirm').prop('disabled', false);
                                    $('.uploadDialog').append('<div class="message active error">Something went wrong</div>');
                                    break;
                            }
                        }
                    });


                    uploadDialog.dialog({
                        resizable: false,
                        width: 640,
                        height: 'auto',
                        modal: true,
                        close: function() {
                            $(this).dialog('close');
                            //$(this).find('.uploadForm').resetForm();
                            $(this).remove();
                        },
                        closeOnEscape: false,
                        buttons: [
                            {
                                id: 'NewResourceConfirm',
                                text: 'Add Resource',
                                click: function() {
                                    //addResource( checkResourceInput( $('.resourceInput')[0].value, $('.resourceNameInput')[0].value ) );
                                    $('.uploadForm').submit();
                                }
                            },
                            {
                                text: 'Cancel',
                                click: function() {
                                    $(this).dialog('close');
                                }
                            }
                        ],
                        open: function( event, ui ) {
                            $('.newResourceConfirm').prop('disabled', true);
                        }
                    });


                }
            });

        });
    }


    /**
     * I calculate from the numeric bytesize a human readable string
     * @method bytesToSize
     * @param {Number} bytes
     * @return String
     */
    function bytesToSize(bytes) {
       var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
       if (bytes == 0) return '0 Byte';
       var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
       return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }



    /**
     * I perform some client-side validations on an URI input field
     * @method checkResourceInput
     * @param {String} uriValue
     * @param {String} nameValue
     * @return
     */
    function checkResourceInput(uriValue, nameValue) {

        if ( uriValue.length > 3 ) {

            var newResource = null;

            var checkers = [
                function (src, name) {
                    // Wikipedia
                    var res = /wikipedia\.org\/wiki\//.exec(src);

                    if (res !== null) {
                        return createResource(src, "wikipedia", name);
                    }
                    return null;
                },
                function (src, name) {
                    // Youtube
                    // Check various patterns
                    var yt_list = [ /youtube\.com\/watch\?v=([^\&\?\/]+)/,
                                    /youtube\.com\/embed\/([^\&\?\/]+)/,
                                    /youtube\.com\/v\/([^\&\?\/]+)/,
                                    /youtu\.be\/([^\&\?\/]+)/ ];
                    for (var i in yt_list) {
                        var res = yt_list[i].exec(src);
                        if (res !== null) {
                            return createResource("//www.youtube.com/embed/" + res[1],
                                                   "youtube", name, "http://img.youtube.com/vi/" + res[1] + "/2.jpg");
                        }
                        return null;
                    }
                },
                function (src, name) {
                    // Vimeo
                    var res = /^(http\:\/\/|https\:\/\/)?(www\.)?(vimeo\.com\/)([0-9]+)$/.exec(src);
                    if (res !== null) {
                        // Create the resource beforehand, so that we can update its thumb property asynchronously
                        var r = createResource("//player.vimeo.com/video/" + res[4], "vimeo", name);
                        $.ajax({
                            url: "http://vimeo.com/api/v2/video/" + res[4] + ".json",
                            async: false,
                            success: function (data) {
                                r.thumb = data[0].thumbnail_large;

                                var vimeoID = data[0].id.toString();

                                if (!r.name || r.name == vimeoID) {
                                    r.name = data[0].title;
                                }
                            }
                        });

                        return r;
                    } else {
                        return null;
                    }
                },
                function (src, name) {
                    // OpenStreeMap
                    var res = /www\.openstreetmap\.org.+#map=(\d+)\/([\d.]+)\/([\d.]+)/.exec(src);
                    if (res) {
                        var r = createResource("", "location", name);
                        r.attributes.lat = res[2];
                        r.attributes.lon = res[3];
                        return r;
                    }
                    res = /www\.openstreetmap\.org.+lat=([\d.]+).+lon=([\d.]+)/.exec(src);
                    if (res) {
                        var r = createResource("", "location", name);
                        r.attributes.lat = res[1];
                        r.attributes.lon = res[2];
                        return r;
                    }
                    return null;
                },
                function (src, name) {
                    // Image
                    if (/\.(gif|jpg|jpeg|png)$/i.exec(src)) {
                        return createResource(src, "image", name, src);
                    } else {
                        // We should do a HEAD request and check the
                        // content-type but it is not possible to do sync
                        // cross-domain requests, so we should return a
                        // Future value.
                        return null;
                    }
                    return null;
                },
                function (src, name) {
                    // Video
                    if (/\.(mp4)$/i.exec(src)) {
                        return createResource(src, "video", name, src);
                    } else {
                        // We should do a HEAD request and check the
                        // content-type but it is not possible to do sync
                        // cross-domain requests, so we should return a
                        // Future value.
                        return null;
                    }
                    return null;
                },
                function (src, name) {
                    // Audio
                    if (/\.(mp3)$/i.exec(src)) {
                        return createResource(src, "audio", name, src);
                    } else {
                        // We should do a HEAD request and check the
                        // content-type but it is not possible to do sync
                        // cross-domain requests, so we should return a
                        // Future value.
                        return null;
                    }
                    return null;
                },
                function (src, name) {
                    // PDF
                    if (/\.(pdf)$/i.exec(src)) {
                        return createResource(src, "pdf", name, src);
                    } else {
                        // We should do a HEAD request and check the
                        // content-type but it is not possible to do sync
                        // cross-domain requests, so we should return a
                        // Future value.
                        return null;
                    }
                    return null;
                },
                function (src, name) {
                    // Default fallback, will work for any URL
                    if (/(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])/.exec(src)) {
                        var r = createResource(src, "webpage", name);
                            //r.thumb = "http://immediatenet.com/t/l3?Size=1024x768&URL="+src;
                        return r;
                    }
                    return null;
                }
            ];

            for (var i in checkers) {
                newResource = checkers[i](uriValue, nameValue);
                if (newResource !== null) {
                    $('.resourceInputMessage').attr('class', 'message active success').text('Valid '+ newResource.type +' URL' );
                    return newResource;
                    break;
                } else {
                    $('.resourceInputMessage').attr('class', 'message active error').text('Not a valid URL (try adding http://)');
                }
            }

        } else {
            // uri value length <= 3
        }

    }




    /**
     * PLEASE DOCUMENT THIS.
     *
     *
     * @method createResource
     * @param {} src
     * @param {} type
     * @param {} name
     * @param {} thumb
     * @return r
     */
    function createResource(src, type, name, thumb) {
        var r = {};
        r.src = src;
        r.type = type;
        r.name = name;
        if (! r.name) {
            // Use the url basename.
            r.name = src.substring(src.lastIndexOf('/') + 1).replace(/_/g, " ").replace(/-/g, " ");
        }
        r.thumb = thumb;
        r.attributes = {};
        return r;
    }



	/**
	 * I delete a resource from the server.
	 *
	 * @method deleteResource
	 * @param {String} resourceID
	 * @param {Function} successCallback
	 * @param {Function} cancelCallback
	 */
	function deleteResource(resourceID, successCallback, cancelCallback) {

		$.ajax({
			type:   'POST',
			url:    '_server/ajaxServer.php',
			cache:  false,
			data: {
				a: 			'fileDelete',
				resourcesID: resourceID
			}
		}).done(function(data) {

			if (data.code === 0) {
				successCallback();
			} else {
				cancelCallback(data);
			}

		});

	};




	/**
	 * I render a list of thumbnails for either all resource items,
	 * or a narrowed down set of them.
	 *
	 * The targetElement should be a &lt;div&gt; or likewise, and will afterwards contain
	 * the elements which were rendered from e.g. {{#crossLink "ResourceImage/renderThumb:method"}}ResourceImage/renderThumb{{/crossLink}}
	 *
	 * If filter is true, then the method will ask the server only for a list of resources which meet the key-condition-value requirements (e.g. "type" "==" "video"). See also server docs!
	 *
	 * @method renderList
	 * @param {HTMLElement} targetElement
	 * @param {Boolean} filter
	 * @param {String} key
	 * @param {String} condition
	 * @param {String} value
	 */
	function renderList(targetElement, filter, key, condition, value) {

		targetElement.empty();
		targetElement.append('<div class="loadingScreen"><div class="workingSpinner dark"></div></div>');


		if (filter) {

			getFilteredList(targetElement, key, condition, value)

		} else {

			getCompleteList(targetElement)

		}


	};




	/**
	 * I call the .renderThumb method for all Resource data objects in the array
	 * (e.g. {{#crossLink "ResourceImage/renderThumb:method"}}ResourceImage/renderThumb{{/crossLink}})
	 * and append the returned element to targetElement.
	 *
	 * @method renderResult
	 * @param {HTMLElement} targetElement
	 * @param {Array} array
	 * @private
	 */
	function renderResult(targetElement, array) {

		for (var id in array) {

			var resourceThumb = FrameTrail.newObject(
				(	'Resource'
				  + array[id].type.charAt(0).toUpperCase()
				  + array[id].type.slice(1)),
				array[id]
			).renderThumb(id);

            //add thumb to target element
			targetElement.append(resourceThumb);

		}

	};



    /**
	 * I am the method choosen, when {{#crossLink "ResourceManager/renderList:method"}}ResourceManager/renderList{{/crossLink}} is called
	 * with filter set to false.
	 *
	 * I update the {{#crossLink "Database/resources:attribute"}}resource database{{/crossLink}} and the render the result into the targetElement
	 *
	 * @method getCompleteList
	 * @param {HTMLElement} targetElement
	 * @private
	 */
	function getCompleteList(targetElement) {

		var database = FrameTrail.module('Database');

		database.loadResourceData(

			function(){

	    		renderResult(targetElement, database.resources);

				targetElement.find('.loadingScreen').fadeOut(600, function() {
                    $(this).remove();
                });

			},

			function(errorMessage){

				targetElement.find('.loadingScreen').remove();
				targetElement.append('<div class="loadingErrorMessage"><div class="message error active">' + errorMessage + '</div></div>');

			}

		);

	}



	/**
	 * I am the method choosen, when {{#crossLink "ResourceManager/renderList:method"}}ResourceManager/renderList{{/crossLink}} is called
	 * with filter set to true.
	 *
	 * The server will be asked to return a list of resources, which meet the requierements specified with key, considition, value
	 * (e.g. "type" "==" "video" ). See the server docs for more details!
	 *
	 * @method getFilteredList
	 * @param {HTMLElement} targetElement
	 * @param {String} key
	 * @param {String} condition
	 * @param {String} value
	 * @private
	 */
	function getFilteredList(targetElement, key, condition, value) {

		$.ajax({

            type:   'POST',
            url:    '_server/ajaxServer.php',
            cache:  false,

            data: {
            	a: 			'fileGetByFilter',
            	key: 		key,
            	condition: 	condition,
            	value: 		value
            }

        }).done(function(data){

        	if (data.code === 0) {

        		renderResult(targetElement, data.result)

        	}

			targetElement.find('.loadingScreen').fadeOut(600, function() {
                $(this).remove();
            });


		}).fail(function(errorMessage){

			targetElement.find('.loadingScreen').remove();
			targetElement.append('<div class="loadingErrorMessage"><div class="message error active">' + errorMessage + '</div></div>');

		});

	}




	/**
	 * I render into the targetElement, which should be a &lt;div&gt; or likewise, a set of thumbnails.
	 * These thumbnails are draggable in the &lt;div class="mainContainer"&gt; to allow drop actions into timelines or into the overlay container.
	 *
	 * @method renderResourcePicker
	 * @param {HTMLElement} targetElement
	 */
	function renderResourcePicker(targetElement) {

		var resourceDatabase 	= FrameTrail.module('Database').resources,
			container		 	= $(	'<div class="resourcePicker">'
									  + '    <div class="resourcePickerControls">'
									  //+ '        <button class="manageResourcesButton">Manage Resources</button>'
                                      + '        <button class="addResourcesButton" data-tooltip-right="Add Resource"><span class="icon-doc-new"></span></button>'
									  + '    </div>'
									  + '    <div class="resourcePickerList"></div>'
									  + '</div>'),
			resourceList 		= container.find('.resourcePickerList'),
			resourceThumb;

		container.find('.addResourcesButton').click(function() {

            FrameTrail.module('ResourceManager').uploadResource(function(){

                FrameTrail.module('Database').loadResourceData(function() {
                    targetElement.empty();
                    renderResourcePicker(targetElement);
                });

            });

		});

		for (var i in resourceDatabase) {

			resourceThumb = FrameTrail.newObject(
				(	'Resource'
				  + resourceDatabase[i].type.charAt(0).toUpperCase()
				  + resourceDatabase[i].type.slice(1)),
				resourceDatabase[i]
			).renderThumb();



			resourceThumb.draggable({
				containment: 	'.mainContainer',
				helper: 		'clone',
				revert: 		'invalid',
				revertDuration: 100,
				appendTo: 		'body',
				distance: 		10,
				zIndex: 		1000,

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

			resourceList.append(resourceThumb);

		}


		targetElement.append(container);

	}


	return {

		renderList: 			renderList,
		renderResourcePicker: 	renderResourcePicker,

		updateResourceDatabase: updateResourceDatabase,
		uploadResource: 		uploadResource,
		deleteResource: 		deleteResource

	};


});
