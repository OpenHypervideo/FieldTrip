/**
 * @module ResourceManager
 */

/**
 * I am the ResourceManagerLauncher which launches the stand-alone application ResourceManager.
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
 * * I load the project data from the server
 * * I ensure the user is logged
 * * I prepare the interface
 *
 * I am a "one-pass" module, this is: I don't export any public methods or properties, and 
 * my sole purpose is to start other modules, after which I am discarded.
 *
 * @class ResourceManagerLauncher
 * @static
 * @main
 */

 FrameTrail.defineModule('ResourceManagerLauncher', function(){


    // Set up the various data models
    FrameTrail.initModule('RouteNavigation');
    FrameTrail.initModule('Database');
    FrameTrail.initModule('UserManagement');
    FrameTrail.initModule('ResourceManager');
    FrameTrail.initModule('ViewResources');


    FrameTrail.module('Database').loadProjectData(
        function(){

            FrameTrail.module('UserManagement').ensureAuthenticated(
                function(){
                    
                    appendTitlebar();

                    $('body').append($('<div id="MainContainer"></div>'));

                    FrameTrail.module('ViewResources').create(true);

                    FrameTrail.module('ViewResources').open();

                    initWindowResizeHandler();

                },
                function(){
                    alert('Log in was aborted... :(')
                }, true
            );


        },
        function(){

            alert('Project does not exist!');

        }
    );

    /**
     * I append the title bar.
     * @method appendTitlebar
     */
    function appendTitlebar() {

        var titlebar = $(  '<div id="Titlebar">Resource Manager - Project: '
                         + FrameTrail.module('Database').project.name 
                         + '    <button type="button" id="LogoutButton" data-tooltip-bottom-right="Logout"><span class="icon-logout"></span></button>'
                         + '</div>');
    
        titlebar.appendTo($('body'));

        titlebar.find('#LogoutButton').click(function(){
            FrameTrail.module('UserManagement').logout();
            location.reload();
        });



    }


    /**
     * I set the event handler for the window's resize event.
     * @method initWindowResizeHandler
     */
    function initWindowResizeHandler() {

        var _window = $(window);

        _window.resize(function(){

            var width   = _window.width(),
                height  = _window.height();

            $('#MainContainer').height( height );
            $('#ViewResources').css({
                margin: 10 + 'px',
                height: height - 20 - $('#Titlebar').height() + 'px'
            });
            FrameTrail.changeState('viewSize', [width, height])

        });

        _window.resize();

        
    }


    
    return null;

});