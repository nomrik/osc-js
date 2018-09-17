(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.OSC = factory());
}(this, (function () { 'use strict';

function isInt(n) {
  return Number(n) === n && n % 1 === 0;
}
function isFloat(n) {
  return Number(n) === n && n % 1 !== 0;
}
function isString(n) {
  return typeof n === 'string';
}
function isArray(n) {
  return Object.prototype.toString.call(n) === '[object Array]';
}


function isBlob(n) {
  return n instanceof Uint8Array;
}

function isUndefined(n) {
  return typeof n === 'undefined';
}
function pad(n) {
  return n + 3 & ~0x03;
}
function hasProperty(name) {
  return Object.prototype.hasOwnProperty.call(typeof global !== 'undefined' ? global : window,
  name);
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

function typeTag(item) {
  if (isInt(item)) {
    return 'i';
  } else if (isFloat(item)) {
    return 'f';
  } else if (isString(item)) {
    return 's';
  } else if (isBlob(item)) {
    return 'b';
  }
  throw new Error('OSC typeTag() found unknown value type');
}
function prepareAddress(obj) {
  var address = '';
  if (isArray(obj)) {
    return '/' + obj.join('/');
  } else if (isString(obj)) {
    address = obj;
    if (address.length > 1 && address[address.length - 1] === '/') {
      address = address.slice(0, address.length - 1);
    }
    if (address.length > 1 && address[0] !== '/') {
      address = '/' + address;
    }
    return address;
  }
  throw new Error('OSC prepareAddress() needs addresses of type array or string');
}

var EncodeHelper = function () {
  function EncodeHelper() {
    classCallCheck(this, EncodeHelper);
    this.data = [];
    this.byteLength = 0;
  }
  createClass(EncodeHelper, [{
    key: 'add',
    value: function add(item) {
      var buffer = item.pack();
      this.byteLength += buffer.byteLength;
      this.data.push(buffer);
      return this;
    }
  }, {
    key: 'merge',
    value: function merge() {
      var result = new Uint8Array(this.byteLength);
      var offset = 0;
      this.data.forEach(function (data) {
        result.set(data, offset);
        offset += data.byteLength;
      });
      return result;
    }
  }]);
  return EncodeHelper;
}();

var Atomic = function () {
  function Atomic(value) {
    classCallCheck(this, Atomic);
    this.value = value;
    this.offset = 0;
  }
  createClass(Atomic, [{
    key: 'pack',
    value: function pack(method, byteLength) {
      if (!(method && byteLength)) {
        throw new Error('OSC Atomic cant\'t be packed without given method or byteLength');
      }
      var data = new Uint8Array(byteLength);
      var dataView$$1 = new DataView(data.buffer);
      if (isUndefined(this.value)) {
        throw new Error('OSC Atomic cant\'t be encoded with empty value');
      }
      dataView$$1[method](this.offset, this.value, false);
      return data;
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView$$1, method, byteLength) {
      var initialOffset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      if (!(dataView$$1 && method && byteLength)) {
        throw new Error('OSC Atomic cant\'t be unpacked without given dataView, method or byteLength');
      }
      if (!(dataView$$1 instanceof DataView)) {
        throw new Error('OSC Atomic expects an instance of type DataView');
      }
      this.value = dataView$$1[method](initialOffset, false);
      this.offset = initialOffset + byteLength;
      return this.offset;
    }
  }]);
  return Atomic;
}();

var AtomicInt32 = function (_Atomic) {
  inherits(AtomicInt32, _Atomic);
  function AtomicInt32(value) {
    classCallCheck(this, AtomicInt32);
    if (value && !isInt(value)) {
      throw new Error('OSC AtomicInt32 constructor expects value of type number');
    }
    return possibleConstructorReturn(this, (AtomicInt32.__proto__ || Object.getPrototypeOf(AtomicInt32)).call(this, value));
  }
  createClass(AtomicInt32, [{
    key: 'pack',
    value: function pack() {
      return get(AtomicInt32.prototype.__proto__ || Object.getPrototypeOf(AtomicInt32.prototype), 'pack', this).call(this, 'setInt32', 4);
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView$$1) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return get(AtomicInt32.prototype.__proto__ || Object.getPrototypeOf(AtomicInt32.prototype), 'unpack', this).call(this, dataView$$1, 'getInt32', 4, initialOffset);
    }
  }]);
  return AtomicInt32;
}(Atomic);

var AtomicFloat32 = function (_Atomic) {
  inherits(AtomicFloat32, _Atomic);
  function AtomicFloat32(value) {
    classCallCheck(this, AtomicFloat32);
    if (value && !isFloat(value)) {
      throw new Error('OSC AtomicFloat32 constructor expects value of type float');
    }
    return possibleConstructorReturn(this, (AtomicFloat32.__proto__ || Object.getPrototypeOf(AtomicFloat32)).call(this, value));
  }
  createClass(AtomicFloat32, [{
    key: 'pack',
    value: function pack() {
      return get(AtomicFloat32.prototype.__proto__ || Object.getPrototypeOf(AtomicFloat32.prototype), 'pack', this).call(this, 'setFloat32', 4);
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView$$1) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return get(AtomicFloat32.prototype.__proto__ || Object.getPrototypeOf(AtomicFloat32.prototype), 'unpack', this).call(this, dataView$$1, 'getFloat32', 4, initialOffset);
    }
  }]);
  return AtomicFloat32;
}(Atomic);

var STR_SLICE_SIZE = 65537;
var STR_ENCODING = 'utf-8';
function charCodesToString(charCodes) {
  if (hasProperty('Buffer')) {
    return Buffer.from(charCodes).toString(STR_ENCODING);
  } else if (hasProperty('TextDecoder')) {
    return new TextDecoder(STR_ENCODING)
    .decode(new Int8Array(charCodes));
  }
  var str = '';
  for (var i = 0; i < charCodes.length; i += STR_SLICE_SIZE) {
    str += String.fromCharCode.apply(null, charCodes.slice(i, i + STR_SLICE_SIZE));
  }
  return str;
}
var AtomicString = function (_Atomic) {
  inherits(AtomicString, _Atomic);
  function AtomicString(value) {
    classCallCheck(this, AtomicString);
    if (value && !isString(value)) {
      throw new Error('OSC AtomicString constructor expects value of type string');
    }
    return possibleConstructorReturn(this, (AtomicString.__proto__ || Object.getPrototypeOf(AtomicString)).call(this, value));
  }
  createClass(AtomicString, [{
    key: 'pack',
    value: function pack() {
      if (isUndefined(this.value)) {
        throw new Error('OSC AtomicString can not be encoded with empty value');
      }
      var terminated = this.value + '\0';
      var byteLength = pad(terminated.length);
      var buffer = new Uint8Array(byteLength);
      for (var i = 0; i < terminated.length; i += 1) {
        buffer[i] = terminated.charCodeAt(i);
      }
      return buffer;
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView$$1) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      if (!(dataView$$1 instanceof DataView)) {
        throw new Error('OSC AtomicString expects an instance of type DataView');
      }
      var offset = initialOffset;
      var charcode = void 0;
      var charCodes = [];
      for (; offset < dataView$$1.byteLength; offset += 1) {
        charcode = dataView$$1.getUint8(offset);
        if (charcode !== 0) {
          charCodes.push(charcode);
        } else {
          offset += 1;
          break;
        }
      }
      if (offset === dataView$$1.length) {
        throw new Error('OSC AtomicString found a malformed OSC string');
      }
      this.offset = pad(offset);
      this.value = charCodesToString(charCodes);
      return this.offset;
    }
  }]);
  return AtomicString;
}(Atomic);

var AtomicBlob = function (_Atomic) {
  inherits(AtomicBlob, _Atomic);
  function AtomicBlob(value) {
    classCallCheck(this, AtomicBlob);
    if (value && !isBlob(value)) {
      throw new Error('OSC AtomicBlob constructor expects value of type Uint8Array');
    }
    return possibleConstructorReturn(this, (AtomicBlob.__proto__ || Object.getPrototypeOf(AtomicBlob)).call(this, value));
  }
  createClass(AtomicBlob, [{
    key: 'pack',
    value: function pack() {
      if (isUndefined(this.value)) {
        throw new Error('OSC AtomicBlob can not be encoded with empty value');
      }
      var byteLength = pad(this.value.byteLength);
      var data = new Uint8Array(byteLength + 4);
      var dataView$$1 = new DataView(data.buffer);
      dataView$$1.setInt32(0, this.value.byteLength, false);
      data.set(this.value, 4);
      return data;
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView$$1) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      if (!(dataView$$1 instanceof DataView)) {
        throw new Error('OSC AtomicBlob expects an instance of type DataView');
      }
      var byteLength = dataView$$1.getInt32(initialOffset, false);
      this.value = new Uint8Array(dataView$$1.buffer, initialOffset + 4, byteLength);
      this.offset = pad(initialOffset + 4 + byteLength);
      return this.offset;
    }
  }]);
  return AtomicBlob;
}(Atomic);

var Message = function () {
  function Message() {
    classCallCheck(this, Message);
    this.offset = 0;
    this.address = '';
    this.types = '';
    this.args = [];
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (args.length > 0) {
      if (!(isString(args[0]) || isArray(args[0]))) {
        throw new Error('OSC Message constructor first argument (address) must be a string or array');
      }
      this.address = prepareAddress(args.shift());
      this.types = args.map(function (item) {
        return typeTag(item);
      }).join('');
      this.args = args;
    }
  }
  createClass(Message, [{
    key: 'add',
    value: function add(item) {
      if (isUndefined(item)) {
        throw new Error('OSC Message needs a valid OSC Atomic Data Type');
      }
      this.args.push(item);
      this.types += typeTag(item);
    }
  }, {
    key: 'pack',
    value: function pack() {
      if (this.address.length === 0 || this.address[0] !== '/') {
        throw new Error('OSC Message has an invalid address');
      }
      var encoder = new EncodeHelper();
      encoder.add(new AtomicString(this.address));
      encoder.add(new AtomicString(',' + this.types));
      if (this.args.length > 0) {
        var argument = void 0;
        this.args.forEach(function (value) {
          if (isInt(value)) {
            argument = new AtomicInt32(value);
          } else if (isFloat(value)) {
            argument = new AtomicFloat32(value);
          } else if (isString(value)) {
            argument = new AtomicString(value);
          } else if (isBlob(value)) {
            argument = new AtomicBlob(value);
          } else {
            throw new Error('OSC Message found unknown argument type');
          }
          encoder.add(argument);
        });
      }
      return encoder.merge();
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView$$1) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      if (!(dataView$$1 instanceof DataView)) {
        throw new Error('OSC Message expects an instance of type DataView.');
      }
      var address = new AtomicString();
      address.unpack(dataView$$1, initialOffset);
      var types = new AtomicString();
      types.unpack(dataView$$1, address.offset);
      if (address.value.length === 0 || address.value[0] !== '/') {
        throw new Error('OSC Message found malformed or missing address string');
      }
      if (types.value.length === 0 && types.value[0] !== ',') {
        throw new Error('OSC Message found malformed or missing type string');
      }
      var offset = types.offset;
      var next = void 0;
      var type = void 0;
      var args = [];
      for (var i = 1; i < types.value.length; i += 1) {
        type = types.value[i];
        if (type === 'i') {
          next = new AtomicInt32();
        } else if (type === 'f') {
          next = new AtomicFloat32();
        } else if (type === 's') {
          next = new AtomicString();
        } else if (type === 'b') {
          next = new AtomicBlob();
        } else {
          throw new Error('OSC Message found non-standard argument type');
        }
        offset = next.unpack(dataView$$1, offset);
        args.push(next.value);
      }
      this.offset = offset;
      this.address = address.value;
      this.types = types.value;
      this.args = args;
      return this.offset;
    }
  }]);
  return Message;
}();

return Message;

})));
