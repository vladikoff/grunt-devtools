/*
 * grunt-devtools
 * https://github.com/vladikoff/grunt-devtools
 *
 * Copyright (c) 2013 vladikoff
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'grunt-plugin/tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      all: ['tmp', 'extension/build']
    },

    copy: {
      core: {
        files: [
          {expand: true, cwd: 'extension/src/', src: ['css/**', 'img/**', 'js/**'], dest: 'extension/build/build-chrome/'}
        ]
      },
      chrome: {
        files: [
          { expand: true, cwd: 'extension/src-chrome/', src: ['*', 'js/**'], dest: 'extension/build/build-chrome/'}
        ]
      }
    },

    less: {
      chrome: {
        files: {
          "extension/build/build-chrome/css/devtools.css": "extension/src/less/devtools.less"
        }
      }
    },

    watch: {
      tests: {
        files: 'extension/**/*',
        tasks: ['build']
      }
    }
  });

  //grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('dev', ['watch']);
  grunt.registerTask('connectTwo', ['connect:site1']);

  grunt.registerTask('default', ['jshint', 'build']);

  grunt.registerTask('build:chrome', [
    'clean:all',
    'copy:core',
    'copy:chrome',
  ]);

  /*
   grunt.registerTask('build:brackets', [
   'coffee:compile',
   'urequire',
   'copy:amd',
   'concat:amd',
   'uglify:amd',
   'compress:amd',
   ]);
   */
  // build all extensions
  grunt.registerTask('build', ['build:chrome', 'build:brackets']);


};
