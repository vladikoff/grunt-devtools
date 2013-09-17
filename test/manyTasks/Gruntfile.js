'use strict';

var NUM_OF_TASKS = 50;

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({ });

  grunt.loadNpmTasks('grunt-devtools');

  for (var t = 0; t <= NUM_OF_TASKS; t++) {
    grunt.registerTask('foo' + t, 'foo' + t, function(arg1, arg2) {
      grunt.log.ok('Running Task!')
    });
  }

};
