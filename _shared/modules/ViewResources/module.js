/**
 * @module Shared
 */


/**
 * I am the ViewResources. I render an user interface which allows the user to add, edit and delete all types of resources which are stored on the server.
 *
 * @class ViewResources
 * @static
 */



FrameTrail.defineModule('ViewResources', function(){

	var domElement = $(    '<div id="ViewResources" title="Manage Resources">'
                        +  '    <div id="ResourcesControls">'
                        +  '        <button id="ResourceUpload"><span class="icon-doc-new"></span>Add New</button>'
                        +  '        <button id="ResourceDelete"><span class="icon-trash"></span>Delete</button>'
                        +  '        <button id="ResourceDeleteConfirm">Confirm Delete</button>'
                        +  '        <div class="message"></div>'
                        +  '        <div style="clear: both;"></div>'
                        +  '    </div>'
                        +  '    <div id="ResourcesFilter">'
                        +  '        <input name="ResourceFilterType" type="radio" value="ALL" checked>All Types</input>'
                        +  '        <input name="ResourceFilterType" type="radio" value="video">Video</input>'
                        +  '        <input name="ResourceFilterType" type="radio" value="image">Image</input>'
                        +  '        <input name="ResourceFilterType" type="radio" value="webpage">Webpage</input>'
                        +  '        <input name="ResourceFilterType" type="radio" value="location">Location</input>'
                        +  '        <input name="ResourceFilterType" type="radio" value="wikipedia">Wikipedia</input>'
                        +  '        <input name="ResourceFilterType" type="radio" value="youtube">Youtube</input>'
                        +  '        <input name="ResourceFilterType" type="radio" value="vimeo">Vimeo</input>'
                        +  '    </div>'
                        +  '    <div id="ResourcesList"></div>'
                        +  '</div>'),


        ResourcesControls      = domElement.find('#ResourcesControls'),
        ResourcesFilter        = domElement.find('#ResourcesFilter'),
        ResourcesList          = domElement.find('#ResourcesList'),
        ResourceUpload         = domElement.find('#ResourceUpload'),
        ResourceDelete         = domElement.find('#ResourceDelete'),
        ResourceDeleteConfirm  = domElement.find('#ResourceDeleteConfirm'),

        deleteActive     = false,

        callback,
        showAsDialog;



    ResourceUpload.click(function(){
        FrameTrail.module('ResourceManager').uploadResource(updateList);
    });

    ResourceDelete.click(toggleDeleteMode);

    ResourceDeleteConfirm.hide();
    ResourceDeleteConfirm.click(function(){
        executeDelete();
    });

    domElement.find('input[name=ResourceFilterType]').change(updateList);

    



    /**
     * I am called during init process. I prepare the DOM element and append it to the div with the id #MainContainer.
     * My parameter indicates, wether I should be shown in a jqueryUI dialog (for embbed use) or wether I am a "fullscreen" element
     * for use in a stand-alone environment.
     * @method create
     * @param {String} withoutDialog
     */
    function create(withoutDialog) {

        $('#MainContainer').append(domElement);

        showAsDialog = ! withoutDialog;

        if (showAsDialog) {

            domElement.dialog({
                autoOpen: false,
                width: 814,
                height: 600,
                modal: true,
                close: function() {
                    
                    domElement.dialog('close');

                    callback && callback.call();

                }
            });

        }

        FrameTrail.changeState('viewSize', FrameTrail.getState('viewSize'));

    };


    /**
     * I render the list of resource items. I check the radio boxes for the type of resources which shall be shown and call
     * {{#crossLink "ResourceManager/renderList:method"}}ResourceManager/renderList(){{/crossLink}}).
     * @method updateList
     * @return 
     */
    function updateList() {

        var type = domElement.find('input[name=ResourceFilterType]:checked').val();

        if (type === 'ALL') {

            FrameTrail.module('ResourceManager').renderList(ResourcesList, false);

        } else {

            FrameTrail.module('ResourceManager').renderList(ResourcesList, true,
                FrameTrail.module('RouteNavigation').projectID,
                'type',
                'contains',
                type
            );

        }

    }

    /**
     * I activate or deactivate the delete functionality, according to the module variable deleteActive {Boolean}.
     *
     * When "delete" is active, the resources' thumbs are selectable for deletion, and a "Confirm deletion" button appears.
     *
     * @method toggleDeleteMode
     */
    function toggleDeleteMode() {

        if (deleteActive) {

            ResourceDelete.html('<span class="icon-trash"></span>Delete').removeClass('active');
            ResourceDeleteConfirm.hide();
            ResourcesList.children('.resourceThumb').removeClass('markedForDeletion').unbind('click');
            deleteActive = false;

            ResourcesControls.find('.message').text('').removeClass('active');

        } else {

            ResourceDelete.html('Cancel').addClass('active');
            ResourceDeleteConfirm.show();
            ResourcesList.children('.resourceThumb').click(function(evt){
                $(evt.currentTarget).toggleClass('markedForDeletion');
            });
            deleteActive = true;

            ResourcesControls.find('.message').text('Select resources to delete').removeClass('error').addClass('active');

        }

    }

    /**
     * I execute the deletion of all resources selected by the user.
     * @method executeDelete
     */
    function executeDelete() {

        FrameTrail.module('UserManagement').ensureAuthenticated(function(){

            ResourcesControls.find('.message').text('').removeClass('active');

            var deleteCollection   = [],
                callbackCollection = [];
            ResourcesList.children('.resourceThumb.markedForDeletion').each(function(){
				deleteCollection.push(this.getAttribute('data-resourceid'));
				//deleteCollection.push($(this).data('resourceId'));
            });

            for (var i in deleteCollection) {
                FrameTrail.module('ResourceManager').deleteResource(
                    FrameTrail.module('RouteNavigation').projectID,
                    deleteCollection[i],
                    function(){ 
                        callbackCollection.push(true);
                        deletionFinished();
                    },
                    function(data){ 
                        ResourcesControls.find('.message').addClass('error active').text(data.string);
                        callbackCollection.push(false);
                        deletionFinished();
                    }
                );

            }


            function deletionFinished() {

                if (callbackCollection.length !== deleteCollection.length) return;

                // delete finished; 
                // callbackCollection contains true/false for success/fail

                if (callbackCollection[0] == true) {
                    updateList();
				    toggleDeleteMode();
                }

            }

        });

    }




    /**
     * I show the DOM element to the user and (optionally) set a callback, when I was opened not as a stand-alone element, but inside a jQuery UI dialog.
     * @method open
     * @param {Function} closeCallback 
     */
    function open(closeCallback) {

        updateList();

        if (showAsDialog) {
            callback = closeCallback;
            domElement.dialog('open');
        } else {
            domElement.removeAttr('title');
        }

        FrameTrail.changeState('viewSize', FrameTrail.getState('viewSize'));


        

    }


    /**
     * I react to a change in the global state "viewSize"
     * @method changeViewSize
     * @param {Array} arrayWidthAndHeight
     */
    function changeViewSize(arrayWidthAndHeight) {

        ResourcesList.height( domElement.height() - ResourcesControls.outerHeight() - ResourcesFilter.outerHeight() );

    }


    



		
   	return {

   		onChange: {
            viewSize: changeViewSize
        },

   		create: create,
        open: open

   	};

});