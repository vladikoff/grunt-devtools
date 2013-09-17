'use strict';

exports.init = function (grunt) {
  var exports = {};

  /**
   * Returns arrays of core and alias tasks
   * @returns {{core: Array, alias: Array}}
   */
  exports.getTasks = function () {

    // gets Grunt raw config
    var configRaw = grunt.config.getRaw();
    // gets Grunt task config
    var configTasks = grunt.task._tasks;

    // collect tasks
    var coreTasks = [];
    var aliasTasks = [];

    Object.keys(configTasks).forEach(function (name) {
      var task = configTasks[name];

      // exclude certain tasks
      if (task.name !== '_devtools_config' && task.name !== 'devtools') {

        // if this task has info and starts with 'Alias for'
        if (task.info && task.info.indexOf('Alias for') === 0) {
          // add to Alias task list
          aliasTasks.push(task);
        }
        // else regular task
        else {
          // if its a multitask we want to collect the targets
          if (task.multi) {
            task.targets = [];

            for (var prop in configRaw[name]) {
              // exclude options target
              if (prop !== 'options') {
                var target = configRaw[name][prop];

                // collect object properties
                if (typeof target === 'object' && !(target instanceof Array)) {
                  task.targets.push(prop);
                }
              }
            }

          }
          // add to Core task list
          coreTasks.push(task);
        }

      }
    });

    return {
      core: coreTasks,
      alias: aliasTasks
    };

  };

  return exports;
};
