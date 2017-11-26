/**
 * @module ProjectManager
 */

/**
 * I am the ResourceManagerLauncher which launches the stand-alone application ProjectManager.
 *
 * I am the entry point to the application and i am called from __index.html__ with
 *
 *     $(document).ready( function() {
 *
 *          FrameTrail.start('ResourceManagerLauncher', {
 *              // initial global state
 *          });
 *
 *      } );
 *
 * I perform the following tasks:
 * * I init the necessary modules
 * * I load the project index data from the server
 * * I ensure the user is logged
 * * I prepare the interface
 *
 * I am a "one-pass" module, this is: I don't export any public methods or properties, and 
 * my sole purpose is to start other modules, after which I am discarded.
 *
 * @class ProjectManagerLauncher
 * @static
 * @main
 */

 FrameTrail.defineModule('ProjectManagerLauncher', function(){


    // Set up the various data models
    FrameTrail.initModule('SuperUserManagement');
    FrameTrail.initModule('ProjectCreator');
    FrameTrail.initModule('ProjectEditor');
    FrameTrail.initModule('ProjectsModel');
    FrameTrail.initModule('ProjectsView');
    

    FrameTrail.module('ProjectsModel').loadDefaultConfig(function() {

        FrameTrail.module('ProjectsModel').loadProjectsIndex(function(){

                FrameTrail.module('SuperUserManagement').ensureAdminAccess(
                    function(){
                        
                        appendTitlebar();

                        $('body').append($('<div id="MainContainer"></div>'));

                        FrameTrail.module('ProjectsView').create();

                        initWindowResizeHandler();

                    },
                    function(){
                        // fail
                    }
                );


            },
            function(){

                alert('Project _index.json does not exist!');

            }
        );

    }, function(){

        alert('No default config file.');

    });


    function appendTitlebar() {

        var titlebar = $(  '<div id="Titlebar">Project Manager'
                         + '    <button type="button" id="LogoutButton" data-tooltip-bottom-right="Logout"><span class="icon-logout"></span></button>'
                         + '</div>');
    
        titlebar.appendTo($('body'));

        titlebar.find('#LogoutButton').click(function(){

            FrameTrail.module('SuperUserManagement').logout();
                    

        });



    }



    function initWindowResizeHandler() {

        var _window = $(window);

        _window.resize(function(){

            var width   = _window.width(),
                height  = _window.height();

            $('#MainContainer').height( height );
            $('#ProjectsView').css({
                margin: 10 + 'px',
                height: height - 20 - $('#Titlebar').height() + 'px'
            });
            FrameTrail.changeState('viewSize', [width, height])

        });

        _window.resize();

        
    }


    
    return null;

});