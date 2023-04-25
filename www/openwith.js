"use strict";

var exec = require("cordova/exec");
var PLUGIN_NAME = "OpenWithPlugin";
function initOpenwithPlugin() {
  // the returned object
  var openwith = {};

  // logging levels
  var DEBUG = (openwith.DEBUG = 0);
  var INFO = (openwith.INFO = 10);
  var WARN = (openwith.WARN = 20);
  var ERROR = (openwith.ERROR = 30);

  // actions
  openwith.SEND = "SEND";
  openwith.VIEW = "VIEW";

  //
  // state variables
  //

  // default verbosity level is to show errors only
  var verbosity;

  // list of registered handlers
  var handlers;

  // list of intents sent to this app
  //
  // it's never cleaned up, so that newly registered handlers (especially those registered a bit too late)
  // will still receive the list of intents.
  var intents;

  // the logger function (defaults to console.log)
  var logger;

  // has init() been called or not already
  var initCalled;

  // make sure a number is displayed with 2 digits
  var twoDigits = function twoDigits(n) {
    return n < 10 ? "0".concat(n) : "".concat(n);
  };

  // format a date for display
  var formatDate = function formatDate(now) {
    var date = now ? new Date(now) : new Date();
    var d = [date.getMonth() + 1, date.getDate()].map(twoDigits);
    var t = [date.getHours(), date.getMinutes(), date.getSeconds()].map(
      twoDigits
    );
    return "".concat(d.join("-"), " ").concat(t.join(":"));
  };

  // format verbosity level for display
  var formatVerbosity = function formatVerbosity(level) {
    if (level <= DEBUG) return "D";
    if (level <= INFO) return "I";
    if (level <= WARN) return "W";
    return "E";
  };

  // display a log in the console only if the level is higher than current verbosity
  var log = function log(level, message) {
    if (level >= verbosity) {
      logger(
        ""
          .concat(formatDate(), " ")
          .concat(formatVerbosity(level), " openwith: ")
          .concat(message)
      );
    }
  };

  // reset the state to default
  openwith.reset = function () {
    log(DEBUG, "reset");
    verbosity = openwith.INFO;
    handlers = [];
    intents = [];
    logger = console.log;
    initCalled = false;
  };

  // perform the initial reset
  openwith.reset();

  // change the logger function
  openwith.setLogger = function (value) {
    logger = value;
  };

  // change the verbosity level
  openwith.setVerbosity = function (value) {
    log(DEBUG, "setVerbosity()");
    if (
      value !== DEBUG &&
      value !== INFO &&
      value !== WARN &&
      value !== ERROR
    ) {
      throw new Error("invalid verbosity level");
    }
    verbosity = value;
    exec(null, null, PLUGIN_NAME, "setVerbosity", [value]);
  };

  // retrieve the verbosity level
  openwith.getVerbosity = function () {
    log(DEBUG, "getVerbosity()");
    return verbosity;
  };

  // a simple function to test that the plugin is correctly installed
  openwith.about = function () {
    log(DEBUG, "about()");
    return "cordova-plugin-openwith, (c) 2017 fovea.cc";
  };
  var findHandler = function findHandler(callback) {
    for (var i = 0; i < handlers.length; ++i) {
      if (handlers[i] === callback) {
        return i;
      }
    }
    return -1;
  };

  // registers a intent handler
  openwith.addHandler = function (callback) {
    log(DEBUG, "addHandler()");
    if (typeof callback !== "function") {
      throw new Error("invalid handler function");
    }
    if (findHandler(callback) >= 0) {
      throw new Error("handler already defined");
    }
    handlers.push(callback);
    intents.forEach(function (intent) {
      callback(intent);
    });
  };
  openwith.numHandlers = function () {
    log(DEBUG, "numHandler()");
    return handlers.length;
  };
  openwith.load = function (dataDescriptor, successCallback, errorCallback) {
    var loadSuccess = function loadSuccess(base64) {
      dataDescriptor.base64 = base64;
      if (successCallback) {
        successCallback(base64, dataDescriptor);
      }
    };
    var loadError = function loadError(err) {
      if (errorCallback) {
        errorCallback(err, dataDescriptor);
      }
    };
    if (
      dataDescriptor.base64 !== null &&
      typeof dataDescriptor.base64 !== "undefined"
    ) {
      loadSuccess(dataDescriptor.base64);
    } else {
      exec(loadSuccess, loadError, PLUGIN_NAME, "load", [dataDescriptor]);
    }
  };
  openwith.exit = function () {
    log(DEBUG, "exit()");
    exec(null, null, PLUGIN_NAME, "exit", []);
  };
  var onNewIntent = function onNewIntent(intent) {
    log(DEBUG, "onNewIntent(".concat(intent.action, ")"));
    // process the new intent
    handlers.forEach(function (handler) {
      handler(intent);
    });
    intents.push(intent);
  };

  // Initialize the native side at startup
  openwith.init = function (successCallback, errorCallback) {
    log(DEBUG, "init()");
    if (initCalled) {
      throw new Error("init should only be called once");
    }
    initCalled = true;

    // callbacks have to be functions
    if (successCallback && typeof successCallback !== "function") {
      throw new Error("invalid success callback");
    }
    if (errorCallback && typeof errorCallback !== "function") {
      throw new Error("invalid error callback");
    }
    var initSuccess = function initSuccess() {
      log(DEBUG, "initSuccess()");
      if (successCallback) successCallback();
    };
    var initError = function initError() {
      log(DEBUG, "initError()");
      if (errorCallback) errorCallback();
    };
    var nativeLogger = function nativeLogger(data) {
      var split = data.split(":");
      log(+split[0], "[native] ".concat(split.slice(1).join(":")));
    };
    exec(nativeLogger, null, PLUGIN_NAME, "setLogger", []);
    exec(onNewIntent, null, PLUGIN_NAME, "setHandler", []);
    exec(initSuccess, initError, PLUGIN_NAME, "init", []);
  };
  return openwith;
}

// Export the plugin object
module.exports = initOpenwithPlugin();
