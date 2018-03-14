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
 * * I ensure the user is logged in
 * * I prepare the interface
 *
 * I am a "one-pass" module, this is: I don't export any public methods or properties, and
 * my sole purpose is to start other modules, after which I am discarded.
 *
 * @class ResourceManagerLauncher
 * @static
 * @main
 */

 FrameTrail.defineModule('ResourceManagerLauncher', function(FrameTrail){


    // Set up the various data models
    FrameTrail.initModule('RouteNavigation');
    FrameTrail.initModule('Database');
    FrameTrail.initModule('UserManagement');
    FrameTrail.initModule('ResourceManager');
    FrameTrail.initModule('ViewResources');


	FrameTrail.module('Database').loadConfigData(function() {
        if (FrameTrail.module('Database').config.alwaysForceLogin) {
            FrameTrail.module('UserManagement').ensureAuthenticated(function() {
                initResourceManager();
            }, function() {}, true);
        } else {
            initResourceManager();
        }
    });

    function initResourceManager() {

        appendTitlebar();

        $(FrameTrail.getState('target')).append($('<div class="mainContainer"></div>'));

        FrameTrail.module('ViewResources').create(true);

        FrameTrail.module('ViewResources').open();

        FrameTrail.module('UserManagement').isLoggedIn(function(loginState) {
            toggleLoginState(loginState);
        });

        initWindowResizeHandler();

    }

    /**
     * I append the title bar.
     * @method appendTitlebar
     */
    function appendTitlebar() {

        var titlebar = $(  '<div class="titlebar">Resource Manager'
                         + '    <button type="button" class="startEditButton" data-tooltip-bottom-left="Edit"><span class="icon-edit"></span></button>'
                         + '    <button type="button" class="logoutButton" data-tooltip-bottom-right="Logout"><span class="icon-logout"></span></button>'
                         + '</div>');

        titlebar.appendTo($(FrameTrail.getState('target')));

        titlebar.find('.logoutButton').click(function(){
            FrameTrail.module('UserManagement').logout();
            toggleLoginState(false);
        });

        titlebar.find('.startEditButton').click(function(){
            FrameTrail.module('UserManagement').ensureAuthenticated(function() {
                
                // login success
                toggleLoginState(true);

            }, function() {
                // login aborted
            });
        });

    }


    /**
     * I toggle the login state (hide / show editing UI).
     * @method toggleLoginState
     * @param {Boolean} loggedIn
     * @private
     */
    function toggleLoginState(loggedIn) {

        if (loggedIn) {
            $('.resourcesControls, .logoutButton').show();
            $('.startEditButton').hide();
            $('.titlebar, .mainContainer').addClass('editActive');
            $('.viewResources').removeClass('resourceManager');
        } else {
            $('.resourcesControls, .logoutButton').hide();
            $('.startEditButton').show();
            $('.titlebar, .mainContainer').removeClass('editActive');
            $('.viewResources').addClass('resourceManager');
        }

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

            $('.mainContainer').height( height );
            $('.viewResources').css({
                margin: 10 + 'px',
                height: height - 20 - $('.titlebar').height() + 'px'
            });
            FrameTrail.changeState('viewSize', [width, height])

        });

        _window.resize();


    }



    return null;

});
