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

    jst: {
      chrome: {
        files: {
          "extension/build/build-chrome/tmp/templates.js": ["extension/src/templates/**/*.*"]
        }
      },
      brackets: {
        files: {
          "extension/build/build-brackets/tmp/templates.js": ["extension/src/templates/**/*.*"]
        }
      }
    },

    concat: {
      options: {
        separator: ';'
      },
      chrome: {
        src: [
          'extension/src/js/vendor/*.js',
          'extension/build/build-chrome/tmp/templates.js',
          'extension/src-chrome/js/*.js',
          'extension/src/js/*.js'

        ],
        dest: 'extension/build/build-chrome/grunt-devtools/js/devtools.js'
      },
      brackets: {
        src: [
          'extension/src/js/vendor/*.js',
          'extension/build/build-brackets/tmp/templates.js',
          'extension/src-brackets/js/*.js',
          'extension/src/js/*.js'
        ],
        dest: 'extension/build/build-brackets/grunt-devtools/js/devtools.js'
      }
    },

    copy: {
      chrome: {
        files: [
          { expand: true, cwd: 'extension/src/',
            src: ['*', 'css/**', 'img/**', '!less', '!templates'],
            dest: 'extension/build/build-chrome/grunt-devtools'},
          { expand: true, cwd: 'extension/src-chrome/',
            src: ['*'],
            dest: 'extension/build/build-chrome/grunt-devtools'}
        ]
      },
      brackets: {
        files: [
          { expand: true, cwd: 'extension/src/',
            src: ['*', 'css/**', 'img/**', 'js/vendor/**', '!less', '!templates'],
            dest: 'extension/build/build-brackets/grunt-devtools' },
          { expand: true, cwd: 'extension/src-brackets/',
            src: ['*', 'node/**', 'img/**', 'js/lib/**', '!less', 'templates/**'],
            dest: 'extension/build/build-brackets/grunt-devtools' }
        ]
      }
    },

    less: {
      chrome: {
        files: {
          "extension/build/build-chrome/grunt-devtools/css/devtools.css": "extension/src/less/devtools.less"
        }
      },
      brackets: {
        files: {
          "extension/build/build-brackets/grunt-devtools/css/devtools.css": "extension/src/less/devtools.less",
          "extension/build/build-brackets/grunt-devtools/css/devtools-brackets.css": "extension/src-brackets/less/grunt-devtools-brackets-skin.less",
          "extension/build/build-brackets/grunt-devtools/css/grunt-devtools-brackets-ui.css": "extension/src-brackets/less/grunt-devtools-brackets-ui.less"
        }
      }
    },

    watch: {
      extension: {
        files: [
          'extension/src/**/*',
          'extension/src-chrome/**/*',
          'extension/src-brackets/**/*'
        ],
        tasks: ['build']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jst');
  grunt.loadNpmTasks('grunt-devtools');

  grunt.registerTask('dev', ['watch']);

  grunt.registerTask('default', ['clean', 'build']);

  grunt.registerTask('build:chrome', [
    'copy:chrome',
    'jst:chrome',
    'concat:chrome',
    'less:chrome'
  ]);

  grunt.registerTask('build:brackets', [
    'copy:brackets',
    'jst:brackets',
    'concat:brackets',
    'less:brackets'
  ]);

  // build all extensions
  grunt.registerTask('build', ['build:chrome', 'build:brackets']);
};
