/*
 * grunt-devtools
 * https://github.com/vladikoff/grunt-devtools
 *
 * Copyright (c) 2013 vladikoff
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    watch: {
      tests: {
        files: 'test/*.js',
        tasks: ['jshint']
      }
    },

    connect: {
        site1: {
          options: {
            keepalive: true,
            port: 9000,
            base: 'www-roots/site1'
          }
        },
        site2: {
          options: {
            port: 9001,
            base: 'www-roots/site2'
          }
        }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'devtools', 'nodeunit']);
  grunt.registerTask('mycleanalias', ['clean']);
  grunt.registerTask('dev', ['watch']);
    grunt.registerTask('connectTwo', ['connect:site1']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
