/**
 * @module Shared
 */


/**
 * I contain all business logic about the UserManagement.
 *
 * I control both the UI as well as the data model for user management (registration, settings, administration) and the user login.
 *
 * @class UserManagement
 * @static
 */



FrameTrail.defineModule('UserManagement', function(){


	var userID                  = '',
		userRole				= '',
		userMail                = '',
		userRegistrationDate    = '',
		userColorCollection		= [],
		userSessionLifetime		= 0,
		userSessionTimeout		= null,

		userBoxCallback 		= null,
		userBoxCallbackCancel 	= null,
		
		domElement 	= $(	'<div id="UserBox" title="User Management">'
						+   '    <div id="UserStatusMessage" class="message">'
						+	'    </div>'
						+   '    <div id="UserTabs">'
						+	'        <ul id="UserTabMenu">'
						+	'            <li id="UserTabSettingsMenu">'
						+   '                <a href="#UserTabSettings">My Settings</a>'
						+   '            </li>'
						+	'            <li id="UserTabRegistrationMenu">'
						+   '                <a href="#UserTabRegistration">Register Users</a>'
						+   '            </li>'
						+	'            <li id="UserTabAdministrationMenu">'
						+   '                <a href="#UserTabAdministration">User Administration</a>'
						+   '            </li>'
						+	'        </ul>'
						+	'        <div id="UserTabSettings">'
						+   '             <form id="SettingsForm" method="post">'
						+	'             	<p id="SettingsFormStatus" class="message"></p>'
						+   '             	<input type="text" name="name" id="SettingsForm_name" placeholder="Your Name">'
						+   '             	<input type="text" name="mail" id="SettingsForm_mail" placeholder="Mail"><br>'
						+	'				<div id="userColor"></div>'
						+   '             	<input type="password" name="passwd" id="SettingsForm_passwd" placeholder="New password"><br>'
						+   '             	<br>'
						+   '             	<input type="hidden" name="a" value="userChange">'
						+	'             	<input type="hidden" name="projectID" value="">'
						+	'             	<input type="hidden" name="userID" id="SettingsForm_userID" value="">'
						+   '             	<input type="submit" value="Change my settings!">'
						+   '             </form>'
						+	'        </div>'
						+	'        <div id="UserTabRegistration">'
						+	'             <form id="RegistrationForm" method="post">'
						+	'             	<p id="RegistrationFormStatus" class="message"></p>'
						+	'             	<input type="text" name="name" placeholder="Your Name">'
						+	'             	<input type="text" name="mail" placeholder="Mail"><br>'
						+	'             	<input type="password" name="passwd" placeholder="Password"><br>'
						+	'             	<input type="hidden" name="a" value="userRegister">'
						+	'             	<input type="hidden" name="projectID" value=""><br>'
						+	'             	<input type="submit" value="Register new user!">'
						+	'             </form>'
						+	'        </div>'
						+	'        <div id="UserTabAdministration">'
						+	'             <p id="AdministrationFormStatus" class="message"></p>'
						+   '             <button id="AdministrationFormRefresh">Refresh</button>'
						+   '             <form id="AdministrationForm" method="post">'
                        +   '               <div id="SelectUserContainer" class="ui-front">'
						+   '                   <select name="userID" id="user_change_user">'
						+  	'                       <option value="" selected disabled>Select a User</option>'
			            +   '                   </select>'
                        +   '               </div>'
                        +   '               <div id="UserDataContainer">'
						+   '             	    <input type="text" name="name" id="user_change_name" placeholder="Name">'
						+   '             	    <input type="text" name="mail" id="user_change_mail" placeholder="Mail"><br>'
						+	'					<div id="user_change_colorContainer"></div>'
						+   '             	    <input type="password" name="passwd" id="user_change_passwd" placeholder="Password"><br><br>'
						+   '             	    <input type="radio" name="role" id="user_change_role_admin" value="admin">'
                        +   '                   <label for="user_change_role_admin">Admin</label>'
						+   '             	    <input type="radio" name="role" id="user_change_role_user" value="user">'
                        +   '                   <label for="user_change_role_user">User</label><br><br>'
						+   '             	    <input type="radio" name="active" id="user_change_active_1" value="1">'
                        +   '                   <label for="user_change_active_1">Active</label>'
						+   '             	    <input type="radio" name="active" id="user_change_active_0" value="0">'
                        +   '                   <label for="user_change_active_0">Inactive</label><br><br>'
						+   '             	    <input type="hidden" name="a" value="userChange">'
						+	'             	    <input type="hidden" name="projectID" value="">'
						+   '             	    <input type="submit" value="Change this user\'s settings.">'
                        +   '               </div>'
						+   '             </form>'
						+	'        </div>'
                        +   '    </div>'
						+	'</div>'),
	
	loginBox = $(	'<div id="UserLoginOverlay" class="ui-blocking-overlay">'
				+   '    <div id="LoginBox" class="ui-overlay-box">'
				+   '        <div class="boxTitle">'
				+   '            <span id="LoginTabButton" class="loginBoxTabButton">Login</span>'
				+   '            <span style="color: #888; font-size: 17px;">or</span>'
				+   '            <span id="CreateAccountTabButton" class="loginBoxTabButton inactive">Create an Account</span>'
				+   '        </div>'
				+	'        <div id="UserTabLogin">'
				+	'             <form id="LoginForm" method="post">'
				+	'             	<p id="LoginFormStatus" class="message"></p>'
				+	'             	<input type="text" name="mail" placeholder="Mail"><br>'
				+	'             	<input type="password" name="passwd" placeholder="Password"><br>'
				+	'             	<input type="hidden" name="a" value="userLogin">'
				+	'             	<input type="hidden" name="projectID" value=""><br>'
				+	'             	<input type="submit" value="Login">'
				+	'             	<button type="button" class="loginBoxCancelButton">Cancel</button>'
				+	'             </form>'
				+	'        </div>'
				+	'        <div id="UserTabRegister">'
				+	'             <form id="UserRegistrationForm" method="post">'
				+	'             	<p id="UserRegistrationFormStatus" class="message"></p>'
				+	'             	<input type="text" name="name" placeholder="Your Name">'
				+	'             	<input type="text" name="mail" placeholder="Mail"><br>'
				+	'             	<input type="password" name="passwd" placeholder="Password"><br>'
				+	'             	<input type="hidden" name="a" value="userRegister">'
				+	'             	<input type="hidden" name="projectID" value=""><br>'
				+	'             	<input type="submit" value="Create Account">'
				+	'             	<button type="button" class="loginBoxCancelButton">Cancel</button>'
				+	'             </form>'
				+	'        </div>'
                +   '    </div>'
				+	'</div>');


	/* Administration Box */

	domElement.find('#UserTabs').tabs({
        heightStyle: "fill"
    });


	domElement.find('#RegistrationForm').ajaxForm({
		method: 	"POST",
		url: 		"../_server/ajaxServer.php",
		dataType:   "json",
		data:       { "projectID":FrameTrail.module('RouteNavigation').projectID },
		success: function(response) {

			switch(response.code){
				case 0:
					domElement.find('#RegistrationFormStatus').removeClass('error').addClass('active success').text('Your are registered, please login now.');
					break;
				case 1:
					domElement.find('#RegistrationFormStatus').removeClass('success').addClass('active error').text('Please fill out all fields! Is the mail adress valid?');
					break;
				case 2:
					domElement.find('#RegistrationFormStatus').removeClass('success').addClass('active error').text('Email already exists in this project.');
					break;
				case 3:
					domElement.find('#RegistrationFormStatus').removeClass('success error').addClass('active').text('You are registered, but you need to get activated by an admin!');
					break;
				
			}
		}
	});


	domElement.find('#SettingsForm').ajaxForm({
		method: 	"POST",
		url: 		"../_server/ajaxServer.php",
		dataType:   "json",
		data:       { "projectID":FrameTrail.module('RouteNavigation').projectID },
		success: function(response) {
			switch(response.code){
				case 0:
					FrameTrail.module('Database').users[FrameTrail.module('UserManagement').userID].color = response.response.color;
					FrameTrail.changeState('username', response.response.name);
					FrameTrail.changeState('userColor', response.response.color);
					
					domElement.find('#SettingsFormStatus').removeClass('error').addClass('active success').text('Your settings were successfully changed.');
					break;
				case 1:
					domElement.find('#SettingsFormStatus').removeClass('success').addClass('active error').text('Fatal error: User database could not be found.');
					break;
				case 2:
					domElement.find('#SettingsFormStatus').removeClass('success').addClass('active error').text('Fatal Error: You are not you anymore!');
					break;
				case 3:
					domElement.find('#SettingsFormStatus').removeClass('success error').addClass('active').text('Your settings were saved, except your mail adress, because it was not valid!');
					break;
				case 4:
					domElement.find('#SettingsFormStatus').removeClass('success').addClass('active error').text('Fatal error: You are not logged in anymore!');
					break;
				case 5:
					domElement.find('#SettingsFormStatus').removeClass('success').addClass('active error').text('Your account was deactivated. Contact an admin!');
					break;
				case 6:
					domElement.find('#SettingsFormStatus').removeClass('success').addClass('active error').text('Fatal error: your user was not found in the database.');
					break;
				
			}
		}
	});


	var refreshAdministrationForm = function(){


		domElement.find('#AdministrationForm')[0].reset();
        domElement.find('#UserDataContainer').hide();


		$.ajax({
			method: 	"POST",
			url: 		"../_server/ajaxServer.php",
			dataType: 	"json",
            data: 		"a=userGet&projectID=" + FrameTrail.module('RouteNavigation').projectID,
			success: function(data) {

				var allUsers = data.response.user;

				domElement.find("#user_change_user").html('<option value="" selected disabled>Select a User</option>');
				
				for (var id in allUsers) {
					domElement.find("#user_change_user").append('<option value="' + id + '">' + allUsers[id].name + '</option>');
				}

                domElement.find("#user_change_user").selectmenu('refresh');

                domElement.find("#user_change_user").unbind('selectmenuchange').bind('selectmenuchange', function(evt){
					
					evt.preventDefault();

					$.ajax({
						method: "POST",
						url: 	"../_server/ajaxServer.php",
						data: 	{	"a": "userGet",
									"projectID": FrameTrail.module('RouteNavigation').projectID,
									"userID": $("#user_change_user option:selected").val()
								},

						success: function(ret) {
							domElement.find("#user_change_name").val(ret["response"]["name"]);
							domElement.find("#user_change_mail").val(ret["response"]["mail"]);
							domElement.find("#user_change_color").val(ret["response"]["color"]);
							domElement.find("#user_change_passwd").val("");
							domElement.find("#AdministrationForm input[name='role']").prop("checked",false).removeAttr("checked");
							domElement.find("#AdministrationForm input#user_change_role_"+ret["response"]["role"]).prop("checked",true).attr("checked","checked");
							domElement.find("#AdministrationForm input[name='active']").prop("checked",false).removeAttr("checked");
							domElement.find("#AdministrationForm input#user_change_active_"+ret["response"]["active"]).prop("checked",true).attr("checked","checked");
							getUserColorCollection(function() {
								renderUserColorCollectionForm(ret["response"]["color"],"#user_change_colorContainer");
							});
                            domElement.find('#UserDataContainer').show();
						}
					});
					
					
				});

			}
		});

	}


	domElement.find('#AdministrationFormRefresh').click(refreshAdministrationForm);
	
	if (FrameTrail.module('RouteNavigation').environment.server) {
        refreshAdministrationForm();
    }


	domElement.find("#AdministrationForm").ajaxForm({
		method: 	"POST",
		url: 		"../_server/ajaxServer.php",
		dataType: 	"json",
		data: {"projectID":FrameTrail.module('RouteNavigation').projectID},
		success: function(response) {
			// TODO: Update client userData Object if Admin edited himself via this view instead of "Settings" Tab
			refreshAdministrationForm();

			switch(response.code){
				case 0:
					domElement.find('#AdministrationFormStatus').removeClass('error').addClass('active success').text('The settings were successfully changed.');
					break;
				case 1:
					domElement.find('#AdministrationFormStatus').removeClass('success').addClass('active error').text('Fatal error: User database could not be found.');
					break;
				case 2:
					domElement.find('#AdministrationFormStatus').removeClass('success').addClass('active error').text('Fatal Error: You are not an admin (or even not you) anymore!');
					break;
				case 3:
					domElement.find('#AdministrationFormStatus').removeClass('error success').addClass('active').text('The settings were saved, except the mail adress, because it was not valid!');
					break;
				case 4:
					domElement.find('#AdministrationFormStatus').removeClass('success').addClass('active error').text('Fatal error: You are not logged in anymore!');
					break;
				case 5:
					domElement.find('#AdministrationFormStatus').removeClass('success').addClass('active error').text('Your account was deactivated. Contact an admin!');
					break;
				case 6:
					domElement.find('#AdministrationFormStatus').removeClass('success').addClass('active error').text('Fatal error: your user was not found in the database.');
					break;
				
			}

		}
	});


	$('body').append(domElement);


	function renderUserColorCollectionForm(selectedColor, targetElement) {
		var elem = $("<div class='userColorCollectionContainer'><input type='hidden' name='color' value='"+ selectedColor +"'>User Color:<div class='userColorCollection'></div></div>");
		for (var c in userColorCollection) {
			elem.find(".userColorCollection").append("<div class='userColorCollectionItem"+((userColorCollection[c] == selectedColor) ? " selected" : "")+"' style='background-color:#"+userColorCollection[c]+"' data-color='"+userColorCollection[c]+"'></div>");
		}
		elem.on("click", ".userColorCollectionItem", function() {
			elem.find(".userColorCollectionItem.selected").removeClass("selected");
			$(this).addClass("selected");
			elem.find("input[name='color']").val($(this).data("color"));
		});

		$(targetElement).html(elem);
	}

	function getUserColorCollection(callback) {
		$.getJSON("../_data/config.json", function(data) {
			userColorCollection = data["userColorCollection"];
			if (typeof(callback) == "function") {
				callback.call();
			}
		});

	}

	var userDialog = domElement.dialog({
		autoOpen: false,
		modal: true,
		width: 600,
		height: 460,
        open: function() {
            domElement.find('#UserTabs').tabs('refresh');
			getUserColorCollection(function() {
				renderUserColorCollectionForm(userColor,"#userColor")
			});
        },
        close: function() {
			closeAdministrationBox();
		}
	});

    domElement.find('#user_change_user').selectmenu({
        width: 150,
        icons: { button: "icon-angle-down" }
    });


    /* Login Box */

    loginBox.find('.loginBoxCancelButton').click(function() {
    	if(typeof userBoxCallbackCancel === 'function'){
			userBoxCallbackCancel.call();
		}
		closeLoginBox();
    });

    loginBox.find('.loginBoxTabButton').click(function(evt) {

    	loginBox.find('.loginBoxTabButton').removeClass('inactive');
    	
    	if ( $(this).attr('id') == 'LoginTabButton' ) {
    		
    		loginBox.find('#CreateAccountTabButton').addClass('inactive');
    		loginBox.find('#UserTabRegister').hide();
    		loginBox.find('#UserTabLogin').show();

    	} else {
    		
    		loginBox.find('#LoginTabButton').addClass('inactive');
    		loginBox.find('#UserTabLogin').hide();
    		loginBox.find('#UserTabRegister').show();

    	}

    });

    loginBox.find('#LoginForm').ajaxForm({

		method: 	"POST",
		url: 		"../_server/ajaxServer.php",
		dataType:   "json",
		data:       { "projectID":FrameTrail.module('RouteNavigation').projectID },

		success: function(response) {
			//console.log(response);
			switch(response.code){
				
				case 0:
					userSessionLifetime = parseInt(response.session_lifetime);
					login(response.userdata);
					loginBox.find('#LoginFormStatus').removeClass('active error success').text('');
					updateView(true);
					if(typeof userBoxCallback === 'function'){
						userBoxCallback.call();
						closeLoginBox();
					}
					break;
				
				case 1:
					loginBox.find('#LoginFormStatus').removeClass('success').addClass('active error').text('Please fill out all fields');
					break;
				case 2:
					loginBox.find('#LoginFormStatus').removeClass('success').addClass('active error').text('User not known');
					break;
				case 3:
					loginBox.find('#LoginFormStatus').removeClass('success').addClass('active error').text('Incorrect Password');
					break;
				case 4:
					loginBox.find('#LoginFormStatus').removeClass('success').addClass('active error').text('Fatal error: Could not find user database. Project deleted?');
					break;
				case 5:
					loginBox.find('#LoginFormStatus').removeClass('success').addClass('active error').text('User is not active. Please contact an admin!');
					break;
			}
			
		}

	});


	loginBox.find('#UserRegistrationForm').ajaxForm({
		method: 	"POST",
		url: 		"../_server/ajaxServer.php",
		dataType:   "json",
		data:       { "projectID":FrameTrail.module('RouteNavigation').projectID },
		success: function(response) {

			switch(response.code){
				case 0:
					loginBox.find('#LoginFormStatus').removeClass('error').addClass('active success').text('Your are registered, please login now.');
					loginBox.find('#LoginTabButton').click();
					FrameTrail.module('InterfaceModal').showStatusMessage('Updating Client Data ...');
					FrameTrail.module('Database').loadData(function() {
						FrameTrail.module('InterfaceModal').showStatusMessage('Client Data updated');
						FrameTrail.module('InterfaceModal').hideMessage(800);
					}, function() {
						FrameTrail.module('InterfaceModal').showErrorMessage('Error updating client data. Please reload the page.');
					});
					break;
				case 1:
					loginBox.find('#UserRegistrationFormStatus').removeClass('success').addClass('active error').text('Please fill out all fields! Is the mail adress valid?');
					break;
				case 2:
					loginBox.find('#UserRegistrationFormStatus').removeClass('success').addClass('active error').text('Email already exists in this project.');
					break;
				case 3:
					loginBox.find('#UserRegistrationFormStatus').removeClass('success error').addClass('active').text('You are registered, but you need to get activated by an admin before you can login!');
					break;
				
			}
		}
	});

	$('body').append(loginBox);




	/**
	 * Sometimes a routine should only execute, if we can ensure the user is logged in at this point.
	 *
	 * I serve this purpose, by checking wether the user has already logged in, and if not provide him the chance
	 * to login (or even create an account first).
	 *
	 * After the user has logged in I call the callback (the routine which shall execute only with a logged-in user).
	 *
	 * If the user aborted the offer to login, an optional cancelCallback can be called.
	 *
	 * @method ensureAuthenticated
	 * @param {Function} callback
	 * @param {Function} callbackCancel (optional)
	 * @param {Boolean} disallowCancel (optional)
	 */
	function ensureAuthenticated(callback, callbackCancel, disallowCancel){

		isLoggedIn(function(loginStatus) {

			if (loginStatus){

				callback.call()

			} else {

				userBoxCallback = callback;
				userBoxCallbackCancel = callbackCancel;

				if (disallowCancel) {
					showLoginBox(true);
				} else {
					showLoginBox();
				}
				

			}

		});


	}


	/**
	 * I check wether the user has logged in, and call the callback with a boolean to indicate this.
	 *
	 * @method isLoggedIn
	 * @param {Function} callback
	 */
	function isLoggedIn(callback) {

		if (!FrameTrail.module('RouteNavigation').environment.server) {
            window.setTimeout(function() {
            	FrameTrail.changeState({
					editMode: false,
					loggedIn: false,
					username: '',
					userColor: ''
				});
	            callback.call(window, false);
            }, 2);

            return;
        }

		$.ajax({
			method: 	"POST",
			url: 		"../_server/ajaxServer.php",
			dataType: 	"json",
            data: 		"a=userCheckLogin&projectID=" + FrameTrail.module('RouteNavigation').projectID,
			success: function(response) {
				switch(response.code){

					case 0:
						logout();
						callback.call(window, false);
						break;

					case 1:
						userSessionLifetime = parseInt(response.session_lifetime);
						login(response.response);
						callback.call(window, true);
						break;

					case 2:
						throw new Error('Project could not be found.');
						break;

				}


			}
		});

	}


	/**
	 * I am called to update my local and gloabl state __after__ the server has created a login session.
	 *
	 * @method login
	 * @param {} userData
	 * @private 
	 */
	function login(userData) {

		userID    = userData.id;
		userRole  = userData.role;
		userMail  = userData.mail;
		userRegistrationDate = userData.registrationDate;

		resetSessionTimeout();

		FrameTrail.changeState('username', userData.name);
		FrameTrail.changeState('userColor', userData.color);
		FrameTrail.changeState('loggedIn', true);
		
		updateView(true);
		
	}


	/**
	 * I am called to close the login session and update my local and global state.
	 *
	 * @method logout
	 */
	function logout() {

		$.ajax({
			method: 	"POST",
			url: 		"../_server/ajaxServer.php",
			dataType: 	"json",
            data: 		"a=userLogout&projectID=" + FrameTrail.module('RouteNavigation').projectID,
			success: function(data) {
				
				if (userID != '') {
					var loggedOutDialog = $('<div id="loggedOutDialog" title="Logged Out">'
                                      + '    <div class="message success active">You have been logged out.</div>'
                                      + '</div>');

	                loggedOutDialog.dialog({
	                  resizable: false,
	                  modal: true,
	                  close: function() {
	                    loggedOutDialog.remove();
	                    document.location.reload();
	                  },
	                  buttons: {
				        "OK": function() {
				          $( this ).dialog( "close" );
				        }
				      }
	                });
				}

				userID    = '';
				userRole  = '';
				userMail  = '';
				userRegistrationDate = '';

				FrameTrail.changeState({
					editMode: false,
					loggedIn: false,
					username: '',
					userColor: ''
				});

				updateView(false);

			}

		});

	}


	/**
	 * The UI of the UserManagement has to be updated, when the loginStatus changes.
	 *
	 * I check wether the user is an admin or a normal user, and show and hide the respective tabs (Settings and Administration) accordingly.
	 *
	 * @method updateView
	 * @param {Boolean} loginStatus
	 * @private
	 */
	function updateView(loginStatus){

		if (loginStatus){

			//domElement.find('#UserStatusMessage').addClass('active').text('Hello! Your are logged in, '+ FrameTrail.getState('username') +'.');

			domElement.find('#UserTabSettingsMenu').show();
			updateSettings();

			if (userRole === 'admin'){
				domElement.find('#UserTabAdministrationMenu').show();
				updateAdministration();
			}


		} else {

			domElement.find('#UserTabSettingsMenu').hide();
			domElement.find('#UserTabAdministrationMenu').hide();

		}


	}


	/**
	 * I update the UI elements of the tab Settings
	 * @method updateSettings
	 * @private 
	 */
	function updateSettings() {

		domElement.find('#SettingsForm_name')[0].value   = FrameTrail.getState('username');
		domElement.find('#SettingsForm_mail')[0].value   = userMail;
		//domElement.find('#SettingsForm_color')[0].value  = userColor;
		domElement.find('#SettingsForm_passwd')[0].value = '';
		domElement.find('#SettingsForm_userID')[0].value = userID;

	}


	/**
	 * I update the UI elements of the tab Administration
	 *
	 * (WAS MOVED AT A WRONG PLACE)
	 *
	 * @method updateAdministration
	 * @private
	 */
	function updateAdministration() {


		
	}


	/**
	 * I open the login box.
	 * The UI is a single DOM element
	 *
	 * @method showLoginBox
	 * @param {Boolean} disallowCancel
	 */
	function showLoginBox(disallowCancel) {
		
		if (disallowCancel) {
			loginBox.find('.loginBoxCancelButton').hide();
		} else {
			loginBox.find('.loginBoxCancelButton').show();
		}

		loginBox.find('.message').removeClass('active error').text('');
		loginBox.find('#LoginForm').resetForm();
		loginBox.find('#UserRegistrationForm').resetForm();

		loginBox.fadeIn();

	}


	/**
	 * I close the login box.
	 *
	 * @method closeLoginBox
	 */
	function closeLoginBox() {

		userBoxCallback = null;
		userBoxCallbackCancel = null;

		loginBox.fadeOut();

	}


	/**
	 * I open the user administration dialog.
	 * The UI is a single DOM element, which is displayed via jQuery UI Dialog
	 *
	 * @method showAdministrationBox
	 */
	function showAdministrationBox() {
		
		ensureAuthenticated(function() {

			updateView(true);
			domElement.dialog('open');

		});

	}


	/**
	 * I close the user administration dialog (jQuery UI Dialog).
	 *
	 * @method closeAdministrationBox
	 * @return 
	 */
	function closeAdministrationBox() {

		userDialog.dialog('close');

	}


	/**
	 * I start the (PHP) session timeout counter.
	 *
	 * @method startSessionTimeout
	 * @return 
	 */
	function startSessionTimeout() {

		// session lifetime minus 30 seconds
		var timeoutDuration = (userSessionLifetime-30) * 1000;
		//console.log('Starting Session Timeout at: ' + Math.floor( (userSessionLifetime-30) / 60 ) + ' minutes');
		userSessionTimeout = setTimeout(function() {
			// Renew Session
			//console.log('Renewing Session ...');
			isLoggedIn(function(){});
		}, timeoutDuration);

	}


	/**
	 * I reset the (PHP) session timeout counter.
	 *
	 * @method resetSessionTimeout
	 * @return 
	 */
	function resetSessionTimeout() {

		clearTimeout(userSessionTimeout);
		startSessionTimeout();

	}


	// Init the user model
	isLoggedIn(function(){});

	
	return {

		showLoginBox: 	        showLoginBox,
		closeLoginBox: 	        closeLoginBox,
		showAdministrationBox: 	showAdministrationBox,
		closeAdministrationBox: closeAdministrationBox,

		isLoggedIn: 			isLoggedIn,
		ensureAuthenticated: 	ensureAuthenticated,
		logout: 				logout,

		/**
		 * The current userID or an empty String.
		 * @attribute userID
		 */
		get userID()    { return userID.toString()   },
		/**
		 * The users mail adress as a String.
		 * @attribute userMail
		 */
		get userMail()  { return userMail            },
		/**
		 * The users role, which is either 'admin' or 'user', or – when not logged in – an empty String.
		 * @attribute userRole
		 */
		get userRole()  { return userRole            },
		/**
		 * The users registration Date, which is a Number (milliseconds since 01-01-1970)
		 * @attribute userRegistrationDate
		 */
		get userRegistrationDate() { return userRegistrationDate }

	};


});