'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    clean: {
      build: {
        src: ["tmp"]
      }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['devtools']);

};
