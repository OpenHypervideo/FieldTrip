/**
 * @module Shared
 */


/**
 * I am the RouteNavigation.
 *
 * I parse the query and the hash fragment of the current URL, and expose those parameters to the app.
 * Also, I listen to changes in the hash fragment, and can call callbacks for them.
 *
 * @class RouteNavigation
 * @static
 */



FrameTrail.defineModule('RouteNavigation', function(){


	var projectID    = getQueryVariable('project'),
		hypervideoID = getQueryVariable('hypervideo'),
		annotationID = '',
		hashTime     = '',

		oldAnnotationID = '',
		onAnnotationChange,

		oldHashTime     = '',
		onHashTimeChange;


	/**
	 * I return a complete path (or URL) for a resource file based on the src attribute of a resource object.
	 * @method getResourceURL
	 * @param {String} src
	 * @return String
	 */
	function getResourceURL(src) {

		if (/^https?:/.exec(src)) {
	        
	        return src;

	    } else {
	    
	    	return '../_data/projects/' + projectID + '/resources/' + src;

	    }

	};


	/**
	 * I return the value of a query parameter.
	 * @method getQueryVariable
	 * @param {String} variable
	 * @return String
	 * @private
	 */
	function getQueryVariable(variable) {

		var query = window.location.search.substring(1),
			vars = query.split("&"),
			pair;

		for (var i = 0; i < vars.length; i++) {
			pair = vars[i].split("=");
			if (pair[0] == variable) {
				return pair[1];
			}
		}

	}

	/**
	 * I return the value of a hash parameter.
	 * @method getHashVariable
	 * @param {String} variable
	 * @return String
	 * @private 
	 */
	function getHashVariable(variable) {

		var hash = window.location.hash.substring(1),
			vars = hash.split("&"),
			pair;

		for (var i = 0; i < vars.length; i++) {
			pair = vars[i].split("=");
			if (pair[0] == variable) {
				return pair[1];
			}
		}

	}

	/**
	 * I return an object with various info about the execution environment.
	 * @method checkEnvironment
	 * @return Object
	 * @private 
	 */
	function checkEnvironment() {

		var environmentObj = {
			'server': (document.location.protocol == 'file:') ? false : true,
			'hostname': document.location.hostname
		}
		
		return environmentObj;

	}

	/**
	 * I set the hypervideo id 
	 * (in case it changes while the application is running).
	 * @method setHashVariable
	 * @param {String} id
	 * @private
	 */
	function setHypervideoID(id) {

		hypervideoID = id;

	}

	/**
	 * I change the value of a hash parameter.
	 * @method setHashVariable
	 * @param {String} key
	 * @param {String} value
	 * @private
	 */
	function setHashVariable(key, value) {

		var hash = window.location.hash.substring(1),
			vars = hash.split("&"),
			pair;

		for (var i = 0; i < vars.length; i++) {
			pair = vars[i].split("=");
			if (pair[0] == key) {
				pair[1] =  value.toString();
			}
			vars[i] = pair.join('=')
		}

		 window.location.hash = vars.join('&')

	}


	/**
	 * I update the application state, when the hash fragment has changed.
	 *
	 * Currently, I am only listing to changes of the parameter "annotations" and "t" (hashTime).
	 *
	 * @method routeHasChanged
	 * @private
	 */
	function routeHasChanged(){
		
		annotationID = getHashVariable('annotations');

		if (annotationID !== oldAnnotationID) {
			oldAnnotationID = annotationID;
			onAnnotationChange && onAnnotationChange.call();
		}

		hashTime = getHashVariable('t');

		if (hashTime !== oldHashTime) {
			oldHashTime = hashTime;
			onHashTimeChange && onHashTimeChange.call();
		}

	}

	
	$(window).on('hashchange', routeHasChanged);

	
	$(window).on('popstate', function(event) {
         
        /* 
        * when accessed from the overview panel, 
        * event.originalEvent.state.editMode
        * contains the previous editMode state
        */

    	//console.log(FrameTrail.module('RouteNavigation').hypervideoID, getQueryVariable('hypervideo'));

    	var hypervideoID = getQueryVariable('hypervideo');

    	if ( hypervideoID ) {
    		    		
    		if ( FrameTrail.getState('editMode') ) {
    			FrameTrail.changeState('editMode', false);
    			FrameTrail.module('HypervideoModel').updateHypervideo(hypervideoID, true);
    		} else if (FrameTrail.module('RouteNavigation').hypervideoID != hypervideoID) {
    			//console.log('change');
    			FrameTrail.module('HypervideoModel').updateHypervideo(hypervideoID);
    		}

    		
    	}
    	

     });


	routeHasChanged();



	
   	return {


   		/**
	     * The projectID, as parsed from the query part of the URL.
	     * @attribute projectID
	     * @type String
	     * @readOnly
	     */
	    get projectID()    {  return projectID    },


		/**
	     * The hypervideoID, as parsed from the query part of the URL.
	     * @attribute hypervideoID
	     * @type String
	     * @readOnly
	     */
	    get hypervideoID() {  return hypervideoID },

	    /**
	     * Manually set the hypervideo id.
	     *
	     * @attribute id
	     * @type String
	     */
	    set hypervideoID(id) { return setHypervideoID(id) },

		/**
	     * NOT USED YET
	 	 *
	     * @attribute annotationID
	     * @type String
	     */
	    get annotationID()   { return annotationID                       },
	    set annotationID(id) { return setHashVariable('annotations', id) },

		/**
	     * NOT USED YET
	     *
	     * Will be called, when the hash fragment's annotationID changes.
	     *
	     * @attribute onAnnotationChange
	     * @type Function
	     */
	    set onAnnotationChange(handler) { return onAnnotationChange = handler },

	    /**
	 	 * I get or set the hashTime (#t=) fragment
	     * @attribute hashTime
	     * @type String
	     */
	    get hashTime()        { return hashTime                       },
	    set hashTime(seconds) { return setHashVariable('t', seconds)  },

	    /**
	 	 * I get the object containing various info about the execution environment
	     * @type Object
	     */
	    get environment()        { return checkEnvironment() },

		/**
	     * Will be called, when the hashTime (#t=) fragment changes.
	     *
	     * @attribute onHashTimeChange
	     * @type Function
	     */
	    set onHashTimeChange(handler) { return onHashTimeChange = handler },


   		getResourceURL: getResourceURL


   	};

});