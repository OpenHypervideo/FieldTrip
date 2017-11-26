/**
 * @module Player
 */


/**
 * I am the Titlebar. I provide a place for a title text, and for two buttons (opening the 
 * {{#crossLink "Sidebar"}}Sidebar{{/crossLink}} and – YET TO IMPLEMENT – the social sharing widgets).
 *
 * @class Titlebar
 * @static
 */



FrameTrail.defineModule('Titlebar', function(){


    var projectID = FrameTrail.module('RouteNavigation').projectID,
        domElement = $(   '<div id="Titlebar">'
                            + '  <div id="SidebarToggleWidget" class=""><button id="SidebarToggleButton"><span class="icon-menu"></span></button></div>'
                            + '  <div id="TitlebarViewMode">'
                            + '      <button data-viewmode="overview" data-tooltip-bottom-left="Overview"><span class="icon-overview"></span></button>'
                            + '      <button data-viewmode="video"><span class="icon-hypervideo"></span></button>'
                            + '  </div>'
                            + '  <div id="TitlebarTitle"></div>'
                            + '  <div id="TitlebarActionButtonContainer">'
                            + '      <button id="NewHypervideoButton" data-tooltip-bottom-left="New Hypervideo"><span class="icon-hypervideo-add"></span></button>'
                            + '      <button id="ManageResourcesButton" class="resourceManagerIcon" data-tooltip-bottom-left="Manage Resources"><span class="icon-folder-open"></span></button>'
                            + '      <button class="startEditButton" data-tooltip-bottom-left="Edit"><span class="icon-edit"></span></button>'
                            + '      <button class="leaveEditModeButton" data-tooltip-bottom-left="Stop Editing"><span class="icon-edit-circled"></span></button>'
                            + '      <button class="userSettingsButton" data-tooltip-bottom-right="User Management"><span class="icon-user"></span></button>'
                            + '      <button id="LogoutButton" data-tooltip-bottom-right="Logout"><span class="icon-logout"></span></button>'
                            + '  </div>'
                            + '  <div id="SharingWidget"><button id="SharingWidgetButton" data-tooltip-bottom-right="Share"><span class="icon-share"></span></button></div>'
                            + '</div>'
                          ),
    TitlebarViewMode        = domElement.find('#TitlebarViewMode'),
    NewHypervideoButton     = domElement.find('#NewHypervideoButton'),
    ManageResourcesButton   = domElement.find('#ManageResourcesButton'),
    StartEditButton         = domElement.find('.startEditButton'),
    LeaveEditModeButton     = domElement.find('.leaveEditModeButton'),
    UserSettingsButton      = domElement.find('.userSettingsButton'),
    SharingWidget           = domElement.find('#SharingWidget');


    StartEditButton.click(function(){
        FrameTrail.module('UserManagement').ensureAuthenticated(
            function(){
                
                FrameTrail.changeState('editMode', 'preview');

            },
            function(){ /* Start edit mode canceled */ }
        );
    });

    LeaveEditModeButton.click(function(){
        FrameTrail.module('HypervideoModel').leaveEditMode();
    });

    UserSettingsButton.click(function(){
        FrameTrail.module('UserManagement').showAdministrationBox();
    });

    domElement.find('#SidebarToggleButton').click(function(){

        FrameTrail.changeState('sidebarOpen', ! FrameTrail.getState('sidebarOpen'));

    });

    if (!FrameTrail.module('RouteNavigation').hypervideoID) {
        domElement.find('button[data-viewmode="video"]').hide();
    }

    TitlebarViewMode.children().click(function(evt){
        FrameTrail.changeState('viewMode', ($(this).attr('data-viewmode')));
    });



    SharingWidget.find('#SharingWidgetButton').click(function(){

        var RouteNavigation = FrameTrail.module('RouteNavigation'),
            baseUrl = window.location.href.split('?'),
            url = baseUrl[0] + '?project=' + projectID,
            secUrl = '//'+ window.location.host + window.location.pathname,
            iframeUrl = secUrl + '?project=' + projectID,
            label = 'Project';

        if ( FrameTrail.getState('viewMode') == 'video' && RouteNavigation.hypervideoID ) {
            url += '&hypervideo='+ RouteNavigation.hypervideoID;
            iframeUrl += '&hypervideo='+ RouteNavigation.hypervideoID;
            label = 'Hypervideo'
        }

        var shareDialog = $('<div id="ShareDialog" title="Share / Embed '+ label +'">'
                        + '    <div>Link</div>'
                        + '    <input type="text" value="'+ url +'"/>'
                        + '    <div>Embed Code</div>'
                        + '    <textarea style="height: 100px;" readonly><iframe width="800" height="600" scrolling="no" src="'+ iframeUrl +'" frameborder="0" allowfullscreen></iframe></textarea>'
                        + '</div>');
        
        shareDialog.find('input[type="text"], textarea').click(function() {
            $(this).focus();
            $(this).select();
        });

        shareDialog.dialog({
            modal: true,
            resizable: false,
            width:      500,
            height:     360,
            close: function() {
                $(this).dialog('close');
                $(this).remove();
            },
            buttons: [
                { text: 'OK',
                    click: function() {
                        $( this ).dialog( 'close' );
                    }
                }
            ]
        });
        
    });

    domElement.find('#LogoutButton').click(function(){

        FrameTrail.module('HypervideoModel').leaveEditMode(true);
        
    });


    NewHypervideoButton.click(function(evt) {

        var newDialog = $('<div id="NewHypervideoDialog" title="New Hypervideo">'
                        + '    <form id="NewHypervideoForm" method="post">'
                        + '        <div class="formColumn column2">'
                        + '            <label for="name">Hypervideo Name</label>'
                        + '            <input type="text" name="name" placeholder="Name" value=""><br>'
                        + '            <input type="checkbox" name="hidden" id="hypervideo_hidden" value="hidden" '+((FrameTrail.module('Database').project.defaultHypervideoHidden.toString() == "true") ? "checked" : "")+'>'
                        + '            <label for="hypervideo_hidden">Hidden from other users?</label>'
                        + '        </div>'
                        + '        <div class="formColumn column2">'
                        + '            <label for="description">Description</label>'
                        + '            <textarea name="description" placeholder="Description"></textarea><br>'
                        + '        </div>'
                        /*
                        + '        <div class="hypervideoLayout">'
                        + '            <div>Player Layout:</div>'
                        + '            <div class="settingsContainer">'
                        + '                <div class="layoutSettingsWrapper">'
                        + '                    <div data-config="areaTopVisible" class="'+ ((FrameTrail.module('Database').project.defaultHypervideoConfig['areaTopVisible'].toString() == 'true') ? 'active' : '') +'">LayoutArea Top</div>'
                        + '                    <div class="playerWrapper">'
                        + '                        <div data-config="overlaysVisible" class="'+ ((FrameTrail.module('Database').project.defaultHypervideoConfig['overlaysVisible'].toString() == 'true') ? 'active' : '') +'">Overlays</div>'
                        + '                        <div data-config="areaRightVisible" class="'+ ((FrameTrail.module('Database').project.defaultHypervideoConfig['areaRightVisible'].toString() == 'true') ? 'active' : '') +'">LayoutArea Right</div>'
                        + '                    </div>'
                        + '                    <div data-config="areaBottomVisible" class="'+ ((FrameTrail.module('Database').project.defaultHypervideoConfig['areaBottomVisible'].toString() == 'true') ? 'active' : '') +'">LayoutArea Bottom</div>'
                        + '                </div>'
                        + '                <div class="genericSettingsWrapper">Layout Mode'
                        + '                    <div data-config="slidingMode" class="'+ ((FrameTrail.module('Database').project.defaultHypervideoConfig['slidingMode'].toString() == 'overlay') ? 'active' : '') +'">'
                        + '                        <div class="slidingMode" data-value="adjust">Adjust</div>'
                        + '                        <div class="slidingMode" data-value="overlay">Overlay</div>'
                        + '                    </div>'
                        + '                </div>'
                        + '            </div>'
                        + '            <div class="subtitlesSettingsWrapper">'
                        + '                <span>Subtitles</span>'
                        + '                <button id="SubtitlesPlus" type="button">Add +</button>'
                        + '                <input type="checkbox" name="config[captionsVisible]" id="captionsVisible" value="true">'
                        + '                <label for="captionsVisible">Show by default (if present)</label>'
                        + '                <div id="NewSubtitlesContainer"></div>'
                        + '            </div>'
                        + '        </div>'
                        */
                        + '        <div style="clear: both;"></div>'
                        + '        <hr>'
                        + '        <div id="NewHypervideoTabs">'
                        + '            <ul>'
                        + '                <li><a href="#ChooseVideo">Choose Video</a></li>'
                        + '                <li><a href="#EmptyVideo">Empty Video</a></li>'
                        + '            </ul>'
                        + '            <div id="ChooseVideo">'
                        + '                <button type="button" id="UploadNewVideoResource">Upload new video</button>'
                        + '                <div id="NewHypervideoDialogResources"></div>'
                        + '                <input type="hidden" name="resourcesID">'
                        + '            </div>'
                        + '            <div id="EmptyVideo">'
                        + '                <div class="message active">Please set a duration in seconds</div>'
                        + '                <input type="text" name="duration" placeholder="duration">'
                        + '            </div>'
                        + '        </div>'
                        + '        <div class="message error"></div>'
                        + '    </form>'
                        + '</div>');
        
        // Manage Subtitles
        newDialog.find('#SubtitlesPlus').on('click', function() {
            var langOptions, languageSelect;

            for (var lang in FrameTrail.module('Database').subtitlesLangMapping) {
                langOptions += '<option value="'+ lang +'">'+ FrameTrail.module('Database').subtitlesLangMapping[lang] +'</option>';
            }

            languageSelect =  '<select class="subtitlesTmpKeySetter">'
                            + '    <option value="" disabled selected style="display:none;">Language</option>'
                            + langOptions
                            + '</select>';

            newDialog.find('#NewSubtitlesContainer').append('<span class="subtitlesItem">'+ languageSelect +'<input type="file" name="subtitles[]"><button class="subtitlesRemove" type="button">x</button><br></span>');
        });

        newDialog.find('#NewSubtitlesContainer').on('click', '.subtitlesRemove', function(evt) {
            $(this).parent().remove();
        });

        newDialog.find('#NewSubtitlesContainer').on('change', '.subtitlesTmpKeySetter', function() {
            $(this).parent().find('input[type="file"]').attr('name', 'subtitles['+$(this).val()+']');
        });



        FrameTrail.module('ResourceManager').renderList(newDialog.find('#NewHypervideoDialogResources'), true,
            FrameTrail.module('RouteNavigation').projectID,
            'type',
            'contains',
            'video'
        );

        $('body').on('click.hypervideoAddResourcesItem', '.resourceThumb', function() {

            newDialog.find('.resourceThumb').removeClass('selected');
            $(this).addClass('selected');
            newDialog.find('input[name="resourcesID"]').val($(this).data('resourceid'));

        });

        newDialog.find('#NewHypervideoTabs').tabs({
            activate: function(event, ui) {
                if ( ui.newPanel.attr('id') == 'EmptyVideo' ) {
                    newDialog.find('input[name="resourcesID"]').prop('disabled',true);
                    newDialog.find('input[name="duration"]').prop('disabled',false);
                    newDialog.find('.resourceThumb').removeClass('selected');
                } else {
                    newDialog.find('input[name="resourcesID"]').prop('disabled',false);
                    newDialog.find('input[name="duration"]').prop('disabled',true);
                }
            }
        });

        newDialog.find('#NewHypervideoForm').ajaxForm({
            method:     'POST',
            url:        '../_server/ajaxServer.php',
            beforeSubmit: function (array, form, options) {
                
                var selectedResourcesID = $('#NewHypervideoForm').find('input[name="resourcesID"]').val();
                //console.log(FrameTrail.module('Database').resources[parseInt(selectedResourcesID)]);

                var hypervideoData = {
                    "meta": {
                        "name": $('#NewHypervideoForm').find('input[name="name"]').val(),
                        "description": $('#NewHypervideoForm').find('textarea[name="description"]').val(),
                        "thumb": (selectedResourcesID.length > 0) ? FrameTrail.module('Database').resources[parseInt(selectedResourcesID)].thumb : null,
                        "creator": FrameTrail.module('Database').users[FrameTrail.module('UserManagement').userID].name,
                        "creatorId": FrameTrail.module('UserManagement').userID,
                        "created": Date.now(),
                        "lastchanged": Date.now()
                    },
                    "config": {
                        "slidingMode": "adjust",
                        "slidingTrigger": "key",
                        "theme": "",
                        "autohideControls": true,
                        "captionsVisible": false,
                        "hidden": $('#NewHypervideoForm').find('input[name="hidden"]').is(':checked'),
                        "theme": (FrameTrail.module('Database').project.theme) ? FrameTrail.module('Database').project.theme : null,
                        "layoutArea": {
                            "areaTop": [],
                            "areaBottom": [],
                            "areaLeft": [],
                            "areaRight": []
                        }
                    },
                    "clips": [
                        {
                            "resourceId": (selectedResourcesID.length > 0) ? selectedResourcesID : null,
                            "duration": ($('#NewHypervideoForm').find('input[name="duration"]').val().length > 0) ? parseFloat($('#NewHypervideoForm').find('input[name="duration"]').val()) : 0,
                            "start": 0,
                            "end": 0,
                            "in": 0,
                            "out": 0
                        }
                    ],
                    "globalEvents": {
                        "onReady": "",
                        "onPlay": "",
                        "onPause": "",
                        "onEnded": ""
                    },
                    "customCSS": "",
                    "contents": [],
                    "subtitles": []
                };

                for (var configKey in hypervideoData.config) {
                    var newConfigVal = $('#NewHypervideoForm').find('input[data-configkey=' + configKey + ']').val();
                    newConfigVal = (newConfigVal === 'true')
                                    ? true
                                    : (newConfigVal === 'false')
                                        ? false
                                        : (newConfigVal === undefined)
                                            ? hypervideoData.config[configKey]
                                            : newConfigVal;
                    hypervideoData.config[configKey] = newConfigVal;
                }

                $('#NewHypervideoForm').find('#NewSubtitlesContainer').find('input[type=file]').each(function () {
                    
                    var match = /subtitles\[(.+)\]/g.exec($(this).attr('name'));
                    
                    if (match) {
                        hypervideoData.subtitles.push({
                            "src": match[1] +".vtt",
                            "srclang": match[1]
                        });
                    }
                });

                //console.log(hypervideoData);
                
                array.push({ name: 'src', value: JSON.stringify(hypervideoData, null, 4) });

            },
            beforeSerialize: function() {

                // Subtitles Validation
                newDialog.dialog('widget').find('.message.error').removeClass('active').html('');

                var err = 0;
                newDialog.find('.subtitlesItem').each(function() {
                    $(this).css({'outline': ''});

                    if (($(this).find('input[type="file"]:first').attr('name') == 'subtitles[]') || ($(this).find('.subtitlesTmpKeySetter').first().val() == '') || ($(this).find('input[type="file"]:first').val().length == 0)) {
                        $(this).css({'outline': '1px solid #cd0a0a'});
                        newDialog.dialog('widget').find('.message.error').addClass('active').html('Subtitles Error: Please fill in all fields.');
                        err++;
                    } else if ( !(new RegExp('(' + ['.vtt'].join('|').replace(/\./g, '\\.') + ')$')).test($(this).find('input[type="file"]:first').val()) ) {
                        $(this).css({'outline': '1px solid #cd0a0a'});
                        newDialog.dialog('widget').find('.message.error').addClass('active').html('Subtitles Error: Wrong format. Please add only .vtt files.');
                        err++;
                    }

                    if (newDialog.find('.subtitlesItem input[type="file"][name="subtitles['+ $(this).find('.subtitlesTmpKeySetter:first').val() +']"]').length > 1 ) {
                        newDialog.dialog('widget').find('.message.error').addClass('active').html('Subtitles Error: Please make sure you assign languages only once.');
                        return false;
                    }

                });
                if (err > 0) {
                    return false;
                }

            },
            dataType:   'json',
            data: {'a': 'hypervideoAdd', 'projectID': projectID},
            success: function(response) {
                switch(response['code']) {
                    case 0:
                        newDialog.dialog('close');
                        FrameTrail.module('Database').loadHypervideoData(
                            function(){
                                FrameTrail.module('ViewOverview').refreshList();
                            },
                            function(){}
                        );
                        break;
                    default:
                        newDialog.dialog('widget').find('.message.error').addClass('active').html(response['string']);
                        break;
                }
            }
        });


        newDialog.find('#UploadNewVideoResource').click(function(){

            FrameTrail.module('ResourceManager').uploadResource(function(){

                var NewHypervideoDialogResources = newDialog.find('#NewHypervideoDialogResources');
                NewHypervideoDialogResources.empty();

                FrameTrail.module('ResourceManager').renderList(NewHypervideoDialogResources, true,
                    FrameTrail.module('RouteNavigation').projectID,
                    'type',
                    'contains',
                    'video'
                );

            }, true);

        })


        newDialog.dialog({
            modal: true,
            resizable: false,
            width:      725,
            height:     500,
            create: function() {
                newDialog.find('.message.error').appendTo($(this).dialog('widget').find('.ui-dialog-buttonpane'));
            },
            close: function() {
                $('body').off('click.hypervideoAddResourcesItem');
                $(this).dialog('close');
                $(this).remove();
            },
            buttons: [
                { text: 'Add Hypervideo',
                    click: function() {
                        $('#NewHypervideoForm').submit();
                    }
                },
                { text: 'Cancel',
                    click: function() {
                        $( this ).dialog( 'close' );
                    }
                }
            ]
        });

    });

    ManageResourcesButton.click(function() {
        FrameTrail.module('ViewResources').open();
    });


    /**
     * I am called from {{#crossLink "Interface/create:method"}}Interface/create(){{/crossLink}}.
     *
     * I set up my interface elements.
     *
     * @method create
     */
    function create() {

        toggleSidebarOpen(FrameTrail.getState('sidebarOpen'));
        toogleUnsavedChanges(FrameTrail.getState('unsavedChanges'));
        toggleViewMode(FrameTrail.getState('viewMode'));
        toggleEditMode(FrameTrail.getState('editMode'));
        
        if ( FrameTrail.getState('embed') ) {
            //domElement.find('#SidebarToggleButton, #SharingWidgetButton').hide();
        }

        $('body').append(domElement);

    }


    
    /**
     * I make changes to my CSS, when the global state "sidebarOpen" changes.
     * @method toggleSidebarOpen
     * @param {Boolean} opened
     */
    function toggleSidebarOpen(opened) {

        if (opened) {

            domElement.addClass('sidebarOpen');
            domElement.find('#SidebarToggleWidget').addClass('sidebarActive');

        } else {

            domElement.removeClass('sidebarOpen');
            domElement.find('#SidebarToggleWidget').removeClass('sidebarActive');

        }

    }



    /**
     * I make changes to my CSS, when the global state "unsavedChanges" changes.
     * @method toogleUnsavedChanges
     * @param {Boolean} aBoolean
     */
    function toogleUnsavedChanges(aBoolean) {

        if(aBoolean){
            TitlebarViewMode.find('[data-viewmode="video"]').addClass('unsavedChanges');
        }else{
            TitlebarViewMode.find('[data-viewmode="video"]').removeClass('unsavedChanges');
        }
        
    }


    /**
     * I react to a change in the global state "viewMode"
     * @method toggleViewMode
     * @param {String} viewMode
     */
    function toggleViewMode(viewMode) {

        if (FrameTrail.module('RouteNavigation').hypervideoID) {
            domElement.find('button[data-viewmode="video"]').show();

            // count visible hypervideos in project
            var hypervideos = FrameTrail.module('Database').hypervideos,
                visibleCount = 0;
            for (var id in hypervideos) {
                if (!hypervideos[id].hidden) {
                    visibleCount++;
                }
            }
            
            // hide 'Overview' and 'Video' controls when there's only one hypervideo
            if (visibleCount == 1) {
                TitlebarViewMode.addClass('hidden');
            }

        }

        TitlebarViewMode.children().removeClass('active');

        domElement.find('[data-viewmode=' + viewMode + ']').addClass('active');

    }


    /**
     * I react to a change in the global state "editMode"
     * @method toggleEditMode
     * @param {String} editMode
     * @param {String} oldEditMode
     */
    function toggleEditMode(editMode, oldEditMode){

        if (editMode) {

            domElement.addClass('editActive');

            if (oldEditMode === false) {

                NewHypervideoButton.show();
                StartEditButton.hide();
                LeaveEditModeButton.show();
                ManageResourcesButton.show();
                SharingWidget.hide();

            }

        } else {

            domElement.removeClass('editActive');

            NewHypervideoButton.hide();
            StartEditButton.show();

            // Hide Edit Button when not in a server environment
            if (!FrameTrail.module('RouteNavigation').environment.server) {
                StartEditButton.hide();
            }
            
            LeaveEditModeButton.hide();
            ManageResourcesButton.hide();
            SharingWidget.show();

        }

    }


    /**
     * I react to a change in the global state "loggedIn"
     * @method changeUserLogin
     * @param {Boolean} loggedIn
     */
    function changeUserLogin(loggedIn) {
        
        if (loggedIn) {
            
            domElement.find('#LogoutButton').show();
            UserSettingsButton.show();

        } else {

            domElement.find('#LogoutButton').hide();
            UserSettingsButton.hide();

        }

    }


    /**
     * I react to a change in the global state "userColor"
     * @method changeUserColor
     * @param {String} color
     */
    function changeUserColor(color) {

        if (color.length > 1) {

            /*
            // Too much color in the interface, keep default color for now
            UserSettingsButton.css({
                'border-color': '#' + FrameTrail.getState('userColor'),
                'background-color': '#' + FrameTrail.getState('userColor')
            });
            */

        }

    }


 

        
    return {

        onChange: {
            sidebarOpen:    toggleSidebarOpen,
            unsavedChanges: toogleUnsavedChanges,
            viewMode:       toggleViewMode,
            editMode:       toggleEditMode,
            loggedIn:       changeUserLogin,
            userColor:      changeUserColor
        },

        /**
         * I am the text, which should be shown in the title bar.
         * @attribute title
         * @type String
         * @writeOnly
         */
        set title(aString) {
            domElement.find('#TitlebarTitle').text(aString);
        },

        /**
         * I am the height of the title bar in pixel.
         * @attribute height
         * @type Number
         * @readOnly
         */
        get height() {
            return FrameTrail.getState('fullscreen') ? 0 : domElement.height();
        },

        create: create

    };


});