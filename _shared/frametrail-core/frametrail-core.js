
(function(){


	var APPNAME = "FrameTrail";
	

	var state			= {},
		modules 		= {},
		updateQueue 	= [],
		inUpdateThread  = false,
		defs_modules 	= {},
		defs_types	    = {};



	function _start(mainModule, runtimeConfig) {

		state = runtimeConfig || {};
		_initModule(mainModule);

	}

	
	function _defineModule(name, definition) {

		if (typeof definition !== 'function') {
			throw new Error('Module definition must be a function object, which returns a public interface.');
		}

		defs_modules[name] = definition;

	}


	function _initModule(name) {

		if (!defs_modules[name]) {
			throw new Error('The module to initialize (named "'+name+'") is not defined.')
		}

		var publicInterface = defs_modules[name].call(this);


		if(typeof publicInterface === 'object' && publicInterface !== null){

			modules[name] = publicInterface;
			return publicInterface;
			
		}

	}


	function _unloadModule(name) {

		if (!modules[name]) {
			throw new Error('The module to unload (named "'+name+'") is not defined.')
		}

		if (modules[name].onUnload && typeof modules[name].onUnload === 'function') {
			modules[name].onUnload.call(this);
		}

		delete modules[name];

	}


	function _module(name) {

		return modules[name];

	}


	function _modules() {

		return modules;

	}


	function _getState(key) {

		return key ? state[key] : state;

	}


	function _changeState(param1, param2) {


		if (typeof param1 === 'string') {

			updateQueue.push([param1, param2, state[param1]]);

		} else if (typeof param1 === 'object' && param1 !== null) {

			for (var key in param1) {

				updateQueue.push([key, param1[key], state[key]]);

			}

		} else {

			throw new Error('Illegal arguments.')

		}


		if(!inUpdateThread){

			inUpdateThread = true;

			while (updateQueue[0]) {

				var updateFrame = updateQueue.splice(0, 1)[0];

				state[updateFrame[0]] = updateFrame[1];

				for(var name in modules){

					if (typeof modules[name].onChange === 'object' && modules[name].onChange !== null){

						if (typeof modules[name].onChange[updateFrame[0]] === 'function'){

							modules[name].onChange[updateFrame[0]].call(this, updateFrame[1], updateFrame[2]);

						}

					}

				}


			}

			inUpdateThread = false;

		}

	}



	function _defineType(name, def1, def2, def3) {

		var obj, proto, parent, type, attribute, newProto;

		if (typeof def1 === 'string') {

			parent = defs_types[def1];

			if (typeof def2 === 'function') {

				obj = def2

				if (typeof def3 === 'object') {

					proto = def3

				}

			} else if (typeof def2 === 'object') {

				proto = def2

			}

		} else {

			if (typeof def1 === 'function') {

				obj = def1

				if (typeof def2 === 'object') {

					proto = def2

				}

			} else if (typeof def1 === 'object') {

				obj = function(){};
				proto = def1

			}

		}


		if (parent) {

			type = function() {
				parent.apply(this, arguments);
				obj.apply(this, arguments);
				return this;
			}

			newProto = {};

			for (attribute in parent.prototype) { 
				newProto[attribute] = parent.prototype[attribute];
			}

			for (attribute in proto) { 
				newProto[attribute] = proto[attribute];
			}

			type.prototype = newProto

		} else {

			type = obj;
			type.prototype = proto;

		}


		defs_types[name] = type;


	}


	function _type(name) {

		return defs_types[name];

	}


	function _newObject(name, param1, param2, param3, param4, param5, param6, param7) {

		return new defs_types[name](param1, param2, param3, param4, param5, param6, param7);

	}




	this[APPNAME] = {

		start: 			_start,

		defineModule: 	_defineModule,

		initModule: 	_initModule,

		unloadModule: 	_unloadModule,

		modules: 		_modules,

		module: 		_module,

		getState: 		_getState,

		changeState: 	_changeState,

		defineType: 	_defineType,

		//TODO: Check if it's ok to export the types
		types: 			defs_types,

		type: 			_type,

		newObject: 		_newObject

	}



}).call(this);