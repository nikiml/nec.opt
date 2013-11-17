(function(){
	var proto = Array.prototype, minIndex = "minIndex", maxIndex = "maxIndex", indexOf = "indexOf", length="length",
		maxValue = "maxValue", minValue = "minValue", forEach = "forEach", map = "map", some = "some", every = "every",
		math = Math, func = 'function',
		checkThis = function(self, callback)
		{
			if (self == null) {
			  throw new TypeError("this is null or not defined");
			}
			if (typeof callback !== func) {
				throw new TypeError(callback + "is not a function");
			}
			return self;
		};
	if (!proto[indexOf]) {
		proto[indexOf] = function(elt /*, from*/) {
			var self = this, len = self[length], from = Number(arguments[1]) || 0;
			from = (from < 0) ? math.ceil(from) : math.floor(from);
			if (from < 0) { from += len; }

			for (; from < len; from++) {
				if (from in self && self[from] === elt) { return from; }
			}
			return -1;
		};
	}


	if (!proto[maxIndex]) {
		proto[maxIndex] = function() {
			var self = this, maxi = 0, len = self[length], i = 1;
			if (!len) return -1;
			for (; i < len; ++i)
				if (self[maxi] < self[i])
				maxi = i;
			return maxi;
		};
	}

	if (!proto[minIndex]) {
		proto[minIndex] = function() {
			var self = this, mini = 0, len = self[length], i = 1;
			if (!len) return -1;
			for (; i < len; ++i)
				if (self[mini] > self[i])
				mini = i;
			return mini;
		};
	}

	if (!proto[maxValue]) {
		proto[maxValue] = function() {
			var self = this;
			if (!self[length]) return undefined;
			return self[self[maxIndex]()];
		}
	};

	if (!proto[minValue]) {
		proto[minValue] = function() {
			var self = this;
			if (!self[length]) return undefined;
			return self[self[minIndex]()];
		};
	}

	// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
	if (!proto[forEach]) {
	  proto[forEach] = function forEach(callback, thisArg) {
		'use strict';
		var k, self = checkThis(this, callback),
			kValue,O = Object(self),len = O[length] >>> 0; // Hack to convert O[length] to a UInt32
		k = 0;
		while (k < len) {
		  if (k in O) {
			kValue = O[k];
			callback.call(thisArg, kValue, k, O);
		  }
		  k++;
		}
	  };
	}

	//from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
	if (!proto[map]) {
	  proto[map] = function(callback, thisArg) {

		var A, k, self = checkThis(this, callback),
			O = Object(self), len = O[length] >>> 0;
		A = new Array(len);
		k = 0;
		while(k < len) {
		  var kValue, mappedValue;
		  if (k in O) {
			kValue = O[ k ];
			mappedValue = callback.call(thisArg, kValue, k, O);
			A[ k ] = mappedValue;
		  }
		  k++;
		}
		return A;
	  };      
	}

	//from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every
	if (!proto[every]) {
	  proto[every] = function(fun , thisp ) {
		'use strict';
		var self = checkThis(this, fun),t = Object(self), len = t[length] >>> 0, i;

		for (i = 0; i < len; i++) {
		  if (i in t && !fun.call(thisp, t[i], i, t)) {
			return false;
		  }
		}

		return true;
	  };
	}

	//from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
	if (!proto[some]) {
	  proto[some] = function(fun , thisp) {
		'use strict';
		var i, self = checkThis(this, fun), t = Object(self), len = t[length] >>> 0;

		for (i = 0; i < len; i++) {
		  if (i in t && fun.call(thisp, t[i], i, t)) {
			return true;
		  }
		}

		return false;
	  };
	}

})();