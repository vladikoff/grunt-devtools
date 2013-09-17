'use strict';

module.exports = function (grunt) {

  grunt.registerTask('_devtools_config', 'Prints out grunt config', function () {
    process.stdout.write(JSON.stringify(grunt.config.getRaw()));
    process.stdout.write('\n');
    process.stdout.write(JSON.stringify(grunt.task._tasks));
  });
};
