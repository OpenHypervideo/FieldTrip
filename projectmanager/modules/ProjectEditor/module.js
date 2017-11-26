/**
 * @module ProjectManager
 */

/**
 * I am the ProjectEditor. I provide an interface where the user can edit the settings of a selected poject, or register new users, or edit the user data of the selected project.
 * 
 * @class ProjectEditor
 * @static
 * @main
 */

 FrameTrail.defineModule('ProjectEditor', function(){


 	/**
	 * I am the sole method of my module. I bring up a jeryUI dialog wich has several tabs to edit the configuration of a project.
	 * 
	 * @method editProject
	 * @param {String} projectId
	 * @param {Function} success
	 */
 	function editProject(projectId, success) {

 		var project = FrameTrail.module('ProjectsModel').projects[projectId],

 			domElement = $(     '<div id="ProjectEditor" title="Edit Project">'
 							+   '    <div id="ProjectTabs">'
							+	'        <ul id="ProjectTabMenu">'
							+	'            <li id="ProjectTabSettingsMenu">'
							+   '                <a href="#ProjectTabSettings">Settings</a>'
							+   '            </li>'
							+	'            <li id="ProjectTabRegistrationMenu">'
							+   '                <a href="#ProjectTabRegistration">Register new user</a>'
							+   '            </li>'
							+	'            <li id="ProjectTabAdministrationMenu">'
							+   '                <a href="#ProjectTabAdministration">User Administration</a>'
							+   '            </li>'
							+	'        </ul>'
							+	'        <div id="ProjectTabSettings">'
							+   '            <form id="EditProjectForm" method="post">'
	                        +   '                <div class="projectData">'
	                        +   '                    <div>Project Settings:</div>'
	                        +   '                    <input type="text" name="name" placeholder="Name of Project" value="'+ project.data.name +'"><br>'
	                        +   '                    <textarea name="description" placeholder="Project Description">'+ project.data.description +'</textarea><br>'
	                        +   '                    <div style="width: 280px;">Default user role:</div>'
                            +   '                    <input type="radio" name="defaultUserRole" id="user_role_admin" value="admin" '+((project.data.defaultUserRole == "admin") ? "checked" : "")+'>'
                            +   '                    <label for="user_role_admin">Admin</label>'
                            +   '                    <input type="radio" name="defaultUserRole" id="user_role_user" value="user" '+((project.data.defaultUserRole == "user") ? "checked" : "")+'>'
                            +   '                    <label for="user_role_user">User</label><br><br>'
                            +   '                    <div style="width: 280px;">Do registered users need to be confirmed by a project admin before they can login?</div>'
                            +   '                    <input type="checkbox" name="userNeedsConfirmation" id="user_confirmation" value="true" '+((project.data.userNeedsConfirmation.toString() == "true") ? "checked" : "")+'>'
                            +   '                    <label for="user_confirmation">only confirmed users</label><br><br>'
                            +   '                    <div style="width: 280px;">Should hypervideos in this project be hidden from other users by default?</div>'
	                        +   '                    <input type="checkbox" name="defaultHypervideoHidden" id="hypervideo_hidden" value="true" '+ ((project.data.defaultHypervideoHidden.toString() == "true") ? "checked" : "") +'>'
	                        +   '                    <label for="hypervideo_hidden">hidden</label>'
	                        +   '                </div>'
	                        +   '                <div style="clear: both;"></div>'
	                        +   '                <button type="submit">Save changes</button>'
	                        +   '                <div style="margin-top: 10px;" class="message resp"></div>'
	                        +   '            </form>'
							+	'        </div>'
							+	'        <div id="ProjectTabRegistration">'
							+	'             <form id="RegistrationForm" method="post">'
							+	'             	<p id="RegistrationFormStatus" class="message"></p>'
							+	'             	<input type="text" name="name" placeholder="Username">'
							+	'             	<input type="text" name="mail" placeholder="Mail"><br>'
							+	'             	<input type="password" name="passwd" placeholder="Password"><br>'
							+	'             	<input type="hidden" name="a" value="userRegister">'
							+	'             	<input type="hidden" name="projectID" value=""><br>'
							+	'             	<input type="submit" value="Register new user!">'
							+	'             </form>'
							+	'        </div>'
							+	'        <div id="ProjectTabAdministration">'
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
 							+   '</div>')


	 	$('#MainContainer').append(domElement);

	 	domElement.find('#ProjectTabs').tabs({
	        heightStyle: 'auto'
	    });

		domElement.find('#EditProjectForm').ajaxForm({
            method:     'POST',
            url:        '../_server/ajaxServer.php',
            dataType:   'json',
            data: {'a': 'projectsEdit', 'projectID':projectId },
            success: function(response) {
                switch(response.code) {
                    case 0:
                        domElement.dialog('widget').find('.message.resp').removeClass('error').addClass('active success').html(response.string);
                        break;
                    default:
                        domElement.dialog('widget').find('.message.resp').removeClass('success').addClass('active error').html(response.string);
                        break;
                }
            }
        });

	 	domElement.find('#RegistrationForm').ajaxForm({
			method: 	"POST",
			url: 		"../_server/ajaxServer.php",
			dataType:   "json",
			data:       { "projectID": projectId },
			success: function(response) {

				switch(response.code){
					case 0:
						domElement.find('#RegistrationFormStatus').removeClass('error').addClass('active success').text('User has been registered.');
						break;
					case 1:
						domElement.find('#RegistrationFormStatus').removeClass('success').addClass('active error').text('Please fill out all fields! Is the mail adress valid?');
						break;
					case 2:
						domElement.find('#RegistrationFormStatus').removeClass('success').addClass('active error').text('Email already exists in this project.');
						break;
					case 3:
						domElement.find('#RegistrationFormStatus').removeClass('success error').addClass('active').text('User has been registered, but you need to activate him via the User Administration panel!');
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
	            data: 		"a=userGet&projectID=" + projectId,
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
										"projectID": projectId,
										"userID": $("#user_change_user option:selected").val()
									},

							success: function(ret) {
								console.log(ret);
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

		domElement.find('#user_change_user').selectmenu({
	        width: 150,
	        icons: { button: "icon-angle-down" }
	    });

		domElement.find('#AdministrationFormRefresh').click(refreshAdministrationForm);
		refreshAdministrationForm();


		domElement.find("#AdministrationForm").ajaxForm({
			method: 	"POST",
			url: 		"../_server/ajaxServer.php",
			dataType: 	"json",
			data: {"projectID":projectId},
			success: function(response) {
				
				refreshAdministrationForm();
				
				switch(response.code){
					case 0:
						domElement.find('#AdministrationFormStatus').removeClass('error').addClass('active success').text('The settings were successfully changed.');
						break;
					case 1:
						domElement.find('#AdministrationFormStatus').removeClass('success').addClass('active error').text('Error: User database could not be found.');
						break;
					case 2:
						domElement.find('#AdministrationFormStatus').removeClass('success').addClass('active error').text('Error: You are not logged in anymore!');
						break;
					case 3:
						domElement.find('#AdministrationFormStatus').removeClass('error success').addClass('active').text('The settings were saved, except the mail adress, because it was not valid!');
						break;
					case 4:
						domElement.find('#AdministrationFormStatus').removeClass('success').addClass('active error').text('Error: You are not logged in anymore!');
						break;
					case 6:
						domElement.find('#AdministrationFormStatus').removeClass('success').addClass('active error').text('Fatal error: your user was not found in the database.');
						break;
					
				}

			}
		});

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

	 	domElement.dialog({
	 		modal: true,
	        resizable: false,
	        width:      725,
	        height:     580,
	        create: function() {
	            
	        },
	        close: function() {
	            
	            $(this).dialog('close');
	            $(this).remove();
	            success.call();

	        }
	 	});
	 	
 	}

    
    return {
    	editProject: editProject
    };

});