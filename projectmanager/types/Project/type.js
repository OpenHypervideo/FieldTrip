/**
 * @module ProjectManager
 */

/**
 * I am the type definition of a Project.
 *
 * @class Project
 * @category TypeDefinition
 */



FrameTrail.defineType(

    'Project',

    function(projectData, id){

    	this.data = projectData;
    	this.id = id;

    },

    {
        /**
         * I create a thumbnail element for the project's data
         *
         * @method renderThumb
         */
    	renderThumb: function() {

    		var href = ('../player?project=' + this.id),

                thumbElement    =   $('<div class="projectThumb" data-projectId="'+ this.id +'" data-name="'+ this.data.name +'">'
                                    + '    <a href="'+ href +'" class="projectTitle">' + this.data.name + '</a>'
                                    + '    <div class="projectDescription">'+ this.data.description +'</div>'
                                    + '    <div class="projectsOptions">'
                                    + '        <button type="button" class="deleteButton" data-tooltip-left="Delete Project"><span class="icon-trash"></span></button>'
                                    + '        <button type="button" class="editButton" data-tooltip-left="Edit Project"><span class="icon-cog"></span></button>'
                                    + '    </div>'
                                    + '</div>');

            return thumbElement;


    	}
        
    }

);
