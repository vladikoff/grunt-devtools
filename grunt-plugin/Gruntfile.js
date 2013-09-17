'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    clean: {
      build: {
        src: ["tmp"]
      }
    },
    watch: {
      gruntfile: {
          files: 'Gruntfile.js',
          tasks: ['clean']
      },
      all: {
          files: '*',
          tasks: ['clean']
      }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');
  // Just for TESTING!
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['devtools']);
};
