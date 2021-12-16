/*!!
 * Power Panel Events <https://github.com/carlos-sweb/pp-events>
 * @author Carlos Illesca
 * @version 1.2.1 (2020/05/14 18:12 PM)
 * Released under the MIT License
 */
(function(global,factory){

  var root = typeof self == 'object' && self.self === self && self ||
    typeof global == 'object' && global.global === global && global;
    if (typeof define === 'function' && define.amd) {
      define(['ppIs','exports'], function(ppIs, exports) {
        root.ppEvents = factory( root , exports , ppIs );
      });
    } else if (typeof exports !== 'undefined') {
      var ppIs = {};
      try { ppIs = require('pp-is'); } catch (e) {}
      module.exports = factory(root, exports, ppIs );
    } else {
      root.ppEvents = factory(root, {}, root.ppIs );
    }

})(this,function( root, exports , ppIs ){
	/**
	*@var {object} events - Container of events
	*/
  var events = {};
  /*
  *@var {function} ppEvents - main function
  */
  var ppEvents = function(){},
	/*
	*@var {object} proto - link to prototype from main function
	*/
  proto = ppEvents.prototype;
  /**
	*on
	*@param {string} eventName - name event
	*@returns {boolean}
  *@description -> check if events var have callbacks assign
	*/
  proto.checkOn = function( eventName ){
    return ppIs.isString(eventName) ?  events.hasOwnProperty(eventName) : false;
  }
	/**
	*on
	*@param {string} eventName - name event
	*@param {function} callbacks - Function for execute when emit event name
	*@returns {void}
	*/
	proto.on = function( eventName , callbacks ){
	  if( ppIs.isString( eventName ) && ppIs.isFunction(callbacks) ){
	    if( !events.hasOwnProperty(eventName) ){
	      events[ eventName ] = []
	    }
	    events[ eventName ].push( callbacks );
	  }
	}
	/**
	*emit
	*@param {string} eventName - name for events call
	*@returns {void}
	*/
	proto.emit = function( eventName ){
		var i, listeners, length, args = [].slice.call(arguments, 1);
		if (typeof events[eventName] === 'object') {
		  listeners = events[eventName].slice();

		  for (i = 0; i < listeners.length; i++) {
		      listeners[i].apply(this, args);
		  }

		}
	}
	/**
	*removeListener
	*@param {string} eventName - name for events call
	*@param {funcion} function - funcion will be remove
	*@returns {void}
	*/
	proto.removeListener = function( eventName , callbacks ){
			var idx;
			if( typeof events[eventName] === 'object' ){
				idx = events[eventName].indexOf(callbacks);
				if( idx > -1 ){
					events[eventName].splice(idx,1);
				}
			}
	}
  return ppEvents;
});
