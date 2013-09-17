'use strict';

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    clean: ['tmp'],
    watch: {
      one: {
        options: {
          atBegin: true
        },
        files: [
          'Gruntfile.js'
        ],
        tasks: ['clean']
      },
      two: {
        options: {
          atBegin: true
        },
        files: [
          'Gruntfile.js'
        ],
        tasks: ['clean']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-devtools');

  grunt.registerTask('run:clean', ['clean']);
  grunt.registerTask('default', ['clean']);
  grunt.registerTask('run_watch_two_target', ['watch:two']);
};
