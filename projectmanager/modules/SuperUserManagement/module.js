/**
 * @module ProjectManager
 */

/**
 * I am the SuperUserManagement which ensures, that the ProjectManager is logged at the server with the password of the one-and-only super user.
 * 
 * @class SuperUserManagement
 * @static
 * @main
 */

 FrameTrail.defineModule('SuperUserManagement', function(){

 	var domElement = $(   '<div id="SuperUserManagement" class="ui-blocking-overlay">'
 						+ '     <div id="SuperUserBox" class="ui-overlay-box">'
 						+ '         <div class="boxTitle">Project Management</div>'
 						+ '         <div class="message active"></div>'
 						+ '         <input type="password" id="SuperUserPassword">'
 						+ '         <button id="SuperUserLoginButton" type="button">Login</button>'
 						+ '     </div>'
 						+ '</div>'),

 		successCallback,
 		failCallback;



 	domElement.find('#SuperUserLoginButton').click(login);
	domElement.find('#SuperUserPassword').keypress(function(evt){
		if (evt.keyCode === 13) login();
	});





	/**
	 * I check wether the user is logged as the super user, and if not, provide the the login interface.
	 * 
	 * @method ensureAdminAccess
	 * @param {Function} success
	 * @param {Function} fail
	 */
 	function ensureAdminAccess(success, fail) {

 		isLoggedIn(function() {

 			domElement.remove();
 			success.call();

 		}, function() {

 			successCallback = success;
	 		failCallback    = fail;
 			domElement.find('.message').removeClass('error').html('Please enter Master-Password');
 			$('body').append(domElement);

 		});

 	}



 	/**
	 * I check if the master user is logged in and call the respective successCallback or failCallback
	 * 
	 * @method isLoggedIn
	 * @param {Function} success
	 * @param {Function} fail 
	 */
 	function isLoggedIn(success, fail) {

 		$.ajax({
			method: 	'POST',
			url: 		'../_server/ajaxServer.php',
			dataType: 	'json',
            data: 		'a=superUserLogin',
			success: 	function(response) {
				
				switch (response.code) {

					case 0:
						FrameTrail.changeState('loggedIn', true);
						success.call();
						break;

					default:
						FrameTrail.changeState('loggedIn', false);
						fail.call();
						break;

				}


			}

		});

 	}



 	/**
	 * I perform the login request to the server and call afterwards the respective successCallback or failCallback, which were previously stored in module variables
	 * by {{crossLink "SuperUserManagement/ensureAdminAccess:method"}}SuperUserManagement/ensureAdminAccess(){{/crossLink}}.
	 * 
	 * @method login
	 */
 	function login() {

 		$.ajax({
			method: 	'POST',
			url: 		'../_server/ajaxServer.php',
			dataType: 	'json',
            data: 		'a=superUserLogin&password=' + domElement.find('#SuperUserPassword').val(),
			success: 	function(response) {
				
				switch (response.code) {

					case 0:
						domElement.remove();
						FrameTrail.changeState('loggedIn', true);
						successCallback.call();
						break;

					default:
						FrameTrail.changeState('loggedIn', false);
						domElement.find('.message').addClass('error').html('Wrong Master-Password');
						failCallback.call();
						break;

				}


			}

		});

 	}


 	/**
	 * I logout the user at the server and afterwards reload the page.
	 * 
	 * @method logout
	 */
 	function logout() {

 		$.ajax({
            method:     "POST",
            url:        "../_server/ajaxServer.php",
            dataType:   "json",
            data:       "a=superUserLogout",
            success: function(data) {
                FrameTrail.changeState('loggedIn', false);
                location.reload();
            }

        });

 	}

    
    return {

    	ensureAdminAccess: ensureAdminAccess,

    	logout: logout

    };

});