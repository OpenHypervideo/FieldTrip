/**
 * @module ProjectManager
 */


/**
 * I am the ProjectCreator. I provide an interface where the user can input the settings for a new poject.
 * 
 * @class ProjectCreator
 * @static
 * @main
 */

 FrameTrail.defineModule('ProjectCreator', function(){


    /**
     * I am the sole method of my module. I bring up a jeryUI dialog where the settings for a new project can be entered.
     * 
     * @method newProject
     * @param {Function} success
     */
 	function newProject(success) {

	    var newDialog = $('<div id="NewProjectDialog" title="New Project">'
                        + '    <form id="NewProjectForm" method="post">'
                        + '        <div class="projectData">'
                        + '            <div>Project Settings:</div>'
                        + '            <input type="text" name="name" placeholder="Name of Project" value=""><br>'
                        + '            <textarea name="description" placeholder="Project Description"></textarea><br>'
                        + '            <div style="width: 280px;">Default user role:</div>'
                        + '            <input type="radio" name="defaultUserRole" id="user_role_admin" value="admin" '+((FrameTrail.module('ProjectsModel').defaultConfig.defaultUserRole == "admin") ? "checked" : "")+'>'
                        + '            <label for="user_role_admin">Admin</label>'
                        + '            <input type="radio" name="defaultUserRole" id="user_role_user" value="user" '+((FrameTrail.module('ProjectsModel').defaultConfig.defaultUserRole == "user") ? "checked" : "")+'>'
                        + '            <label for="user_role_user">User</label><br><br>'
                        + '            <div style="width: 280px;">Do registered users need to be confirmed by a project admin before they can login?</div>'
                        + '            <input type="checkbox" name="userNeedsConfirmation" id="user_confirmation" value="true" '+((FrameTrail.module('ProjectsModel').defaultConfig.userNeedsConfirmation.toString() == "true") ? "checked" : "")+'>'
                        + '            <label for="user_confirmation">only confirmed users</label><br><br>'
                        + '            <div style="width: 280px;">Should hypervideos in this project be hidden from other users by default?</div>'
                        + '            <input type="checkbox" name="defaultHypervideoHidden" id="hypervideo_hidden" value="true">'
                        + '            <label for="hypervideo_hidden">hidden</label>'
                        + '        </div>'
                        + '        <div style="clear: both;"></div>'
                        + '        <div class="message error"></div>'
                        + '    </form>'
                        + '</div>');
        
        newDialog.find('#NewProjectForm').ajaxForm({
            method:     'POST',
            url:        '../_server/ajaxServer.php',
            dataType:   'json',
            data: {'a': 'projectsNew'},
            success: function(response) {
                
                switch(response['code']) {
                    case 0:
                        newDialog.dialog('close');
                        success.call();
                        break;
                    default:
                        newDialog.dialog('widget').find('.message.error').addClass('active').html(response['string']);
                        break;
                }
            }
        });
        
        newDialog.dialog({
            modal: true,
            resizable: false,
            width:      725,
            height:     520,
            create: function() {
                newDialog.find('.message.error').appendTo($(this).dialog('widget').find('.ui-dialog-buttonpane'));
            },
            close: function() {
                $(this).dialog('close');
                $(this).remove();
            },
            buttons: [
                { text: 'Create Project',
                    click: function() {
                        $('#NewProjectForm').submit();
                    }
                },
                { text: 'Cancel',
                    click: function() {
                        $( this ).dialog( 'close' );
                    }
                }
            ]
        });

    }
    
    return {

    	newProject: newProject

    };

});