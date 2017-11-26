/**
 * @module ProjectManager
 */

/**
 * I am the ProjectsModel. I hold the data of all projects stored on the server.
 *
 * @class ProjectsModel
 * @static
 * @main
 */

 FrameTrail.defineModule('ProjectsModel', function(){

 	var projectsIndex = {},
 		projects = {},
        defaultConfig = {};



    /**
     * I load the default settings (../_data/config.json) from the server
     * (to be used when creating new projects)
     * I call my success or fail callback respectively.
     *
     * @method loadDefaultConfig
     * @param {Function} success
     * @param {Function} fail
     */
    function loadDefaultConfig(success, fail) {

        $.ajax({

            type:   "GET",
            url:    '../_data/config.json',
            cache:  false,
            dataType: "json",
            mimeType: "application/json"
        }).done(function(data){

            defaultConfig = data;

            success.call(this);

        }).fail(function(){

            fail('No default config file.');

        });


    };

    /**
     * I fetch the _index.json of all projects from the server. On success, I also create instances of
     * {{crossLink "Project"}}Project{{/crossLink}} and store them.
     *
     * @method loadProjectsIndex
     * @param {Function} success
     * @param {Function} fail
     */
 	function loadProjectsIndex(success, fail) {

 		$.ajax({

            type:   "GET",
            url:    '../_data/projects/_index.json',
            cache:  false

        }).done(function(data){

            var countdown = Object.keys(data.projects).length;
            
            if (countdown == 0) {
                // no projects yet
                success.call();
            }

            for (var id in data.projects) {
                (function (id) {

                    $.ajax({
                        type:   "GET",
                        url:    '../_data/projects/' + data.projects[id] + '/project.json',
                        cache:  false,
                        dataType: "json",
                        mimeType: "application/json"
                    }).done(function (projectData) {


                        projectsIndex[id] = projectData;
                        projects[id] = FrameTrail.newObject('Project', projectData, id);

                        if (!--countdown) {
                            success.call();
                        }

                    }).fail(function () {
                        fail('No project.json file.')
                    });

                })(id);
            }

        }).fail(function(){

            fail('No project index file.');

        });


 	}


    /**
     * I delete a project from the server
     *
     * @method deleteProject
     * @param {String} id
     * @param {Function} successCallback
     * @param {Function} failCallback
     */
    function deleteProject(id, successCallback, failCallback) {

        var deleteDialog = $('<div id="DeleteProjectDialog" title="Delete Project">'
                           + '<div>Do you really want to delete this Project?</div>'
                           + '    <input id="thisProjectName" type="text" value="'+ projects[id].data.name +'" readonly>'
                           + '    <div class="message active">Please paste / re-enter the name:</div>'
                           + '    <form method="POST" id="DeleteProjectForm">'
                           + '        <input type="text" name="projectName" placeholder="Project Name"><br>'
                           + '        <div class="message error"></div>'
                           + '    </form>'
                           + '</div>');


        deleteDialog.find('#DeleteProjectForm').ajaxForm({
            method:     'POST',
            url:        '../_server/ajaxServer.php',
            dataType:   'json',
            thisID: id,
            data: {a: 'projectsDelete', projectID: id},
            success: function(data) {

                switch (data.code) {

                    case 0:
                        deleteDialog.dialog('close');
                        successCallback.call();
                        break;

                    default:
                        deleteDialog.find('#DeleteProjectForm .message').addClass('active').text(data.string);
                        failCallback.call();
                        break;

                }
            }
        });

        deleteDialog.dialog({
                modal: true,
                resizable: false,
                open: function() {
                    deleteDialog.find('#thisProjectName').focus().select();
                },
                close: function() {
                    $(this).dialog('close');
                    $(this).remove();
                },
                buttons: [
                    { text: 'Delete Project',
                        click: function() {
                            $('#DeleteProjectForm').submit();
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


    /**
     * I reload the data from the server.
     *
     * @method updateModel
     * @param {Function} success
     * @param {Function} fail
     */
    function updateModel(success, fail) {

        projects = {};
        loadProjectsIndex(success, fail);

    }


    return {

    	loadDefaultConfig: loadDefaultConfig,

        loadProjectsIndex: loadProjectsIndex,

        deleteProject: deleteProject,

        updateModel: updateModel,

    	get projects()         { return projects },
        get defaultConfig()    { return defaultConfig }

    };

});
