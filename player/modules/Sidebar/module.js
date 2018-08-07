/**
 * @module Player
 */


/**
 * I am the Sidebar. I provide the basic navigation for the user interface.
 *
 * @class Sidebar
 * @static
 */



FrameTrail.defineModule('Sidebar', function(FrameTrail){




    var domElement  = $(      '<div class="sidebar">'
                            + '    <div class="sidebarContainer">'
                            + '        <div data-viewmode="overview">'
                            + '            <div class="viewmodeControls">'
                            + '                <div class="viewModeActionButtonContainer">'
                            + '                    <button class="exportButton" data-tooltip-bottom-left="Export Site"><span class="icon-download"></span></button>'
                            + '                    <div style="clear: both;"></div>'
                            + '                </div>'
                            + '            </div>'
                            + '            <div class="viewmodeInfo">'
                            + '                <span class="siteDescription"><!--TODO--></span>'
                            + '            </div>'
                            + '        </div>'
                            + '        <div data-viewmode="video">'
                            + '            <div class="viewmodeControls">'
                            + '                <div class="viewModeActionButtonContainer">'
                            + '                    <button class="saveButton" data-tooltip-bottom-left="Save changes"><span class="icon-floppy"></span></button>'
                            + '                    <button class="forkButton" data-tooltip-bottom-left="Fork Hypervideo"><span class="icon-hypervideo-fork"></span></button>'
                            + '                    <button class="exportButton" data-tooltip-bottom-left="Export Hypervideo"><span class="icon-download"></span></button>'
                            + '                    <div style="clear: both;"></div>'
                            + '                </div>'
                            + '                <button class="editMode" data-editmode="preview"><span class="icon-eye"></span>Preview</button>'
                            + '                <button class="editMode" data-editmode="settings"><span class="icon-cog"></span>Settings</button>'
                            + '                <button class="editMode" data-editmode="layout"><span class="icon-news"></span>Layout</button>'
                            + '                <button class="editMode" data-editmode="overlays"><span class="icon-overlays"></span>Overlays</button>'
                            + '                <button class="editMode" data-editmode="codesnippets"><span class="icon-code"></span>Custom Code</button>'
                            + '                <button class="editMode" data-editmode="annotations"><span class="icon-annotations"></span>My Annotations</button>'
                            + '            </div>'
                            + '            <div class="viewmodeInfo">'
                            + '                <span class="videoDescription"></span>'
                            + '            </div>'
                            + '            <button class="hypervideoDeleteButton" data-tooltip-top-left="Delete Hypervideo"><span class="icon-trash"></span></button>'
                            /*
                            + '            <div class="selectAnnotationContainer" class="ui-front">'
                            + '                <div class="descriptionLabel">Annotations</div>'
                            + '                <select class="selectAnnotation" name=""></select>'
                            + '                <div class="selectAnnotationSingle"></div>'
                            + '            </div>'
                            */
                            + '        </div>'
                            + '    </div>'
                            + '    </div>'
                            + '</div>'
                        ),

        sidebarContainer       = domElement.find('.sidebarContainer'),
        overviewContainer      = sidebarContainer.children('[data-viewmode="overview"]'),
        videoContainer         = sidebarContainer.children('[data-viewmode="video"]'),
        videoContainerInfo     = videoContainer.children('.viewmodeInfo'),
        videoContainerControls = videoContainer.children('.viewmodeControls'),
        resourcesContainer     = sidebarContainer.children('[data-viewmode="resources"]'),

        SaveButton             = domElement.find('.saveButton'),
        ForkButton             = domElement.find('.forkButton'),
        ExportButton           = domElement.find('.exportButton'),
        DeleteButton           = domElement.find('.hypervideoDeleteButton'),
        VideoDescription       = sidebarContainer.find('.videoDescription');


    SaveButton.click(function(){
        FrameTrail.module('HypervideoModel').save();
    });

    ForkButton.click(function(evt) {

        evt.preventDefault();
        evt.stopPropagation();

        var thisID = FrameTrail.module('RouteNavigation').hypervideoID,
            thisHypervideo = FrameTrail.module('Database').hypervideo;

        var forkDialog = $('<div class="forkHypervideoDialog" title="Fork Hypervideo">'
                         + '    <div class="message active">By forking a hypervideo, you create a copy for yourself that you are able to edit.</div>'
                         + '    <form method="POST" class="forkHypervideoForm">'
                         + '        <input type="text" name="name" placeholder="Name of new Hypervideo" value="'+ thisHypervideo.name +'"><br>'
                         + '        <textarea name="description" placeholder="Description for new Hypervideo">'+ thisHypervideo.description +'</textarea><br>'
                         + '        <div class="message error"></div>'
                         + '    </form>'
                         + '</div>');

        forkDialog.find('.forkHypervideoForm').ajaxForm({
            method:     'POST',
            url:        '_server/ajaxServer.php',
            dataType:   'json',
            thisID: thisID,
            data: {'a': 'hypervideoClone', 'hypervideoID': thisID},
            beforeSubmit: function (array, form, options) {

                var currentData = FrameTrail.module("Database").convertToDatabaseFormat(thisID);

                //console.log(currentData);
                currentData.meta.name = $('.forkHypervideoForm').find('input[name="name"]').val();
                currentData.meta.description = $('.forkHypervideoForm').find('textarea[name="description"]').val();
                currentData.meta.creator = FrameTrail.module('Database').users[FrameTrail.module('UserManagement').userID].name;
                currentData.meta.creatorId = FrameTrail.module('UserManagement').userID;

                array.push({ name: 'src', value: JSON.stringify(currentData, null, 4) });

            },
            success: function(response) {
                switch(response['code']) {
                    case 0:
                        // TODO: UPDATE LIST / HYPERVIDEO OBJECT IN CLIENT! @Michi
                        forkDialog.dialog('close');
                        FrameTrail.module('Database').loadHypervideoData(
                            function(){
                                FrameTrail.module('ViewOverview').refreshList();
                                alert('TODO: switch to new hypervideo');
                            },
                            function(){}
                        );

                        break;
                    default:
                        //TODO: push nice error texts into error box.
                        forkDialog.find('.message.error').addClass('active').html('Fatal error!');
                        break;
                }
            }
        });

        forkDialog.dialog({
            modal: true,
            resizable: false,
            close: function() {
                $(this).dialog('close');
                $(this).remove();
            },
            buttons: [
                { text: 'Fork Hypervideo',
                    click: function() {

                        $('.forkHypervideoForm').submit();

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

    ExportButton.click(function(){
        FrameTrail.module('HypervideoModel').exportIt();
    });

    DeleteButton.click(function(evt) {

        evt.preventDefault();
        evt.stopPropagation();

        var thisID = FrameTrail.module('RouteNavigation').hypervideoID,
            hypervideos = FrameTrail.module('Database').hypervideos;

        var deleteDialog = $('<div class="deleteHypervideoDialog" title="Delete Hypervideo">'
                           + '<div>Do you really want to delete the this Hypervideo?</div>'
                           + '    <input class="thisHypervideoName" type="text" value="'+ hypervideos[thisID]['name'] +'" readonly>'
                           + '    <div class="message active">Please paste / re-enter the name:</div>'
                           + '    <form method="POST" class="deleteHypervideoForm">'
                           + '        <input type="text" name="hypervideoName" placeholder="Name of Hypervideo"><br>'
                           + '        <div class="message error"></div>'
                           + '    </form>'
                           + '</div>');


        deleteDialog.find('.deleteHypervideoForm').ajaxForm({
            method:     'POST',
            url:        '_server/ajaxServer.php',
            dataType:   'json',
            thisID: thisID,
            data: {a: 'hypervideoDelete', hypervideoID: thisID},
            success: function(response) {
                switch(response['code']) {
                    case 0:
                        // TODO: find a nice way to remove Element of deleted Hypervideo from Overview List
                        deleteDialog.dialog('close');
                        $('#OverviewList div[data-hypervideoid="'+thisID+'"]').remove();

                        // Redirect to Overview when current Hypervideo has been deleted
                        if ( thisID == FrameTrail.module('RouteNavigation').hypervideoID ) {
                            alert('You deleted the current Hypervideo and will be redirected to the Overview.')
                            window.location.hash = "#";
                        }

                    break;
                    case 1:
                        deleteDialog.find('.message.error').addClass('active').html('Not logged in');
                    break;
                    case 2:
                        deleteDialog.find('.message.error').addClass('active').html('User not active');
                    break;
                    case 3:
                        deleteDialog.find('.message.error').addClass('active').html('Could not find the hypervideos/ID folder');
                    break;
                    case 4:
                        deleteDialog.find('.message.error').addClass('active').html('hypervideoID could not be found in database.');
                    break;
                    case 5:
                        deleteDialog.find('.message.error').addClass('active').html('hypervideoName is not correct.');
                    break;
                    case 6:
                        //TODO push nice texts into error box.
                        deleteDialog.find('.message.error').addClass('active').html('permission denied! The User is not an admin, nor is it his own hypervideo.');
                    break;
                }
            }
        });

        deleteDialog.dialog({
                modal: true,
                resizable: false,
                open: function() {
                    deleteDialog.find('.thisHypervideoName').focus().select();
                },
                close: function() {
                    $(this).dialog('close');
                    $(this).remove();
                },
                buttons: [
                    { text: 'Delete Hypervideo',
                        click: function() {
                            $('.deleteHypervideoForm').submit();
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


    videoContainerControls.find('.editMode').click(function(evt){
        FrameTrail.changeState('editMode', ($(this).attr('data-editmode')));
    });


    /**
     * I am called from {{#crossLink "Interface/create:method"}}Interface/create(){{/crossLink}} and set up all my elements.
     * @method create
     */
    function create() {

        toggleSidebarOpen(FrameTrail.getState('sidebarOpen'));
        changeViewSize(FrameTrail.getState('viewSize'));
        toggleFullscreen(FrameTrail.getState('fullscreen'));
        toogleUnsavedChanges(FrameTrail.getState('unsavedChanges'));
        toggleViewMode(FrameTrail.getState('viewMode'));
        toggleEditMode(FrameTrail.getState('editMode'));

        $(FrameTrail.getState('target')).append(domElement);

        if ( FrameTrail.getState('embed') ) {
            //domElement.find('.viewmodeControls').hide();
        }



    };


    /**
     * I react to a change in the global state "sidebarOpen"
     * @method toggleSidebarOpen
     * @param {Boolean} opened
     */
    function toggleSidebarOpen(opened) {

        if (opened) {
            domElement.addClass('open');
        } else {
            domElement.removeClass('open');
        }

    };


    /**
     * I react to a change in the global state "viewSize"
     * @method changeViewSize
     * @param {Array} arrayWidthAndHeight
     */
    function changeViewSize(arrayWidthAndHeight) {

        var controlsHeight          = domElement.find('.sidebarContainer > div.active > .viewmodeControls').height(),
            viewModeInfoHeight      = domElement.height() - FrameTrail.module('Titlebar').height - controlsHeight;

        domElement.find('.sidebarContainer > div.active > .viewmodeInfo').css('max-height', viewModeInfoHeight - 80);

    };


    /**
     * I react to a change in the global state "fullscreen"
     * @method toggleFullscreen
     * @param {Boolean} aBoolean
     */
    function toggleFullscreen(aBoolean) {



    };


    /**
     * I react to a change in the global state "unsavedChanges"
     * @method toogleUnsavedChanges
     * @param {Boolean} aBoolean
     */
    function toogleUnsavedChanges(aBoolean) {

        if (aBoolean) {
            domElement.find('button[data-viewmode="video"]').addClass('unsavedChanges')
            SaveButton.addClass('unsavedChanges')
        } else {
            domElement.find('button[data-viewmode="video"]').removeClass('unsavedChanges')
            domElement.find('button.editMode').removeClass('unsavedChanges')
            SaveButton.removeClass('unsavedChanges')
        }

    };

    /**
     * I am called from the {{#crossLink "HypervideoModel/newUnsavedChange:method"}}HypervideoModel/newUnsavedChange(){{/crossLink}}.
     *
     * I mark the categories (overlays, annotations, codeSnippets), which have unsaved changes inside them.
     *
     * @method newUnsavedChange
     * @param {String} category
     */
    function newUnsavedChange(category) {

        if (category == 'codeSnippets' || category == 'events' || category == 'customCSS') {
            // camelCase not valid in attributes
            domElement.find('button[data-editmode="codesnippets"]').addClass('unsavedChanges');
        } else if (category == 'config' || category == 'globalCSS') {
            domElement.find('button[data-editmode="settings"]').addClass('unsavedChanges');
        } else {
            domElement.find('button[data-editmode="'+category+'"]').addClass('unsavedChanges');
        }

    };



    /**
     * I react to a change in the global state "viewMode"
     * @method toggleViewMode
     * @param {String} viewMode
     */
    function toggleViewMode(viewMode) {

        sidebarContainer.children().removeClass('active');

        domElement.find('[data-viewmode=' + viewMode + ']').addClass('active');

        changeViewSize();

    };

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

                ExportButton.hide();
                SaveButton.show();

                videoContainerControls.find('.editMode').addClass('inEditMode');

            }

            videoContainerControls.find('.editMode').removeClass('active');

            videoContainerControls.find('[data-editmode="' + editMode + '"]').addClass('active');

            FrameTrail.changeState('sidebarOpen', true);


        } else {

            domElement.removeClass('editActive');

            //ExportButton.show();
            SaveButton.hide();

            videoContainerControls.find('.editMode').removeClass('inEditMode');

            FrameTrail.changeState('sidebarOpen', false);

        }

        changeViewSize();


    }


    /**
     * I react to a change in the global state "loggedIn"
     * @method changeUserLogin
     * @param {Boolean} loggedIn
     */
    function changeUserLogin(loggedIn) {

        if (loggedIn) {

            if ( FrameTrail.module('RouteNavigation').hypervideoID ) {
                //console.log(FrameTrail.module('HypervideoModel').creatorId);
                //console.log(FrameTrail.module('UserManagement').userID);
                if (FrameTrail.module('UserManagement').userRole == 'admin' || parseInt(FrameTrail.module('HypervideoModel').creatorId) == FrameTrail.module('UserManagement').userID) {

                    videoContainerControls.find('.editMode').removeClass('disabled');

                } else {

                    videoContainerControls.find('.editMode[data-editmode="settings"]').addClass('disabled');
                    videoContainerControls.find('.editMode[data-editmode="layout"]').addClass('disabled');
                    videoContainerControls.find('.editMode[data-editmode="overlays"]').addClass('disabled');
                    videoContainerControls.find('.editMode[data-editmode="codesnippets"]').addClass('disabled');

                }
            }

        } else {

            // not logged in

        }

    }




    return {

        create: create,

        onChange: {
            sidebarOpen:    toggleSidebarOpen,
            viewSize:       changeViewSize,
            fullscreen:     toggleFullscreen,
            unsavedChanges: toogleUnsavedChanges,
            viewMode:       toggleViewMode,
            editMode:       toggleEditMode,
            loggedIn:       changeUserLogin
        },

        newUnsavedChange: newUnsavedChange,

        /**
         * I am the width of the sidebar's DOM element.
         * @attribute width
         * @type Number
         * @readOnly
         */
        get width() { return domElement.width() },


        /**
         * I am the text which should be displayed in the "Video" tab of the sidebar.
         * @attribute VideoDescription
         * @type String
         * @writeOnly
         */
        set VideoDescription(aString)     { return VideoDescription.html(aString) }

    };

});
