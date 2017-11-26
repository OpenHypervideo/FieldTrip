/**
 * @module ProjectManager
 */

/**
 * I am the ProjectsView, which is the main interface element of the ProjectManager. I have a set of ui controls (at the moment only a "New Project" button) and
 * hold the list of thumbnails for all projects.
 * 
 * @class ProjectsView
 * @static
 * @main
 */

 FrameTrail.defineModule('ProjectsView', function(){


 	var domElement = $(   '<div id="ProjectsView">'
 						+ '    <div id="ProjectManagerOptions">'
 						+ '        <button type="button" id="NewProject">New Project</button>'
 						+ '    </div>'
 						+ '    <div id="ProjectsList"></div>'
 						+ '</div>'),

 		NewProject      = domElement.find('#NewProject'),
 		ProjectsList 	= domElement.find('#ProjectsList');



 	/**
	 * I create the interface elements and add functionality to the user control elements
	 * 
	 * @method create
	 */
 	function create() {

 		$('#MainContainer').append(domElement);


 		NewProject.click(function(){
 			FrameTrail.module('ProjectCreator').newProject(function() { 
				FrameTrail.module('ProjectsModel').updateModel(
					function(){
						updateList();
					},
					function(){ /*fail*/ }
				);
			})
 		});


 		ProjectsList.on('click', '.deleteButton', function(evt){
 			
 			FrameTrail.module('ProjectsModel').deleteProject(
 				$(evt.currentTarget).parents('.projectThumb').attr('data-projectid'),
 				function() { 
 					FrameTrail.module('ProjectsModel').updateModel(
 						function(){
 							updateList();
 						},
 						function(){ /*fail*/ }
 					);
 				},
 				function() { /*fail*/ }
 			);

 		});

 		ProjectsList.on('click', '.editButton', function(evt){
 			
 			FrameTrail.module('ProjectEditor').editProject(
 				$(evt.currentTarget).parents('.projectThumb').attr('data-projectid'),
 				function() { 
 					FrameTrail.module('ProjectsModel').updateModel(
 						function(){
 							updateList();
 						},
 						function(){ /*fail*/ }
 					);
 				}
 			)

 		});


 		updateList();

 		initWindowResizeHandler();

 		
 	}

 	
 	/**
	 * I fetch the array of projects from the model and render their thumbs into the ProjectsList div element.
	 * 
	 * @method updateList
	 */
 	function updateList() {

 		ProjectsList.empty();

 		var projects = FrameTrail.module('ProjectsModel').projects;

 		for (var id in projects) {

 			ProjectsList.append(projects[id].renderThumb());

 		}

 		$(window).resize();

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

            
            $('#ProjectsList').css({
                height: height - 40 - $('#Titlebar').height() - $('#ProjectManagerOptions').height() + 'px'
            });
            FrameTrail.changeState('viewSize', [width, height])

        });

        _window.resize();

        
    }



 	



    
    return {
    	create: create
    };

});