'use strict';

define(function (require, exports, module) {
  var exports = {};

  // Helper function that chains a series of promise-returning
  // functions together via their done callbacks.
  var chain = function () {
    var functions = Array.prototype.slice.call(arguments, 0);
    if (functions.length > 0) {
      var firstFunction = functions.shift();
      var firstPromise = firstFunction.call();
      firstPromise.done(function () {
        chain.apply(null, functions);
      });
    }
  };

  exports.chain = chain;

  return exports;
});
