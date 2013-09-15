module.exports = function () {

  var exec = require('child_process').exec;
  var spawn = require('child_process').spawn;
  // path to the custom devtools task
  var devtoolsTask = __dirname + '/../tasks';

  // command to load the custom devtools task and run the _devtools_config task
  var cmd = 'grunt -no-color -tasks ' + devtoolsTask + ' _devtools_config';

  // run the command to get the task list
  exec(cmd, function (err, stdout, stderr) {

    if (stderr && stderr.length > 0) {
      console.log(stderr.toString());
    }

    var idx = null;
    var response = stdout.toString().split('\n');

    // find the index offset of config objects
    response.forEach(function (block, i) {
      if (typeof block === 'string' && block.indexOf('Running') === 0) {
        idx = i;
      }
      if (typeof block === 'string' && block.indexOf('Fatal error') === 0) {
        console.log(block);
      }
    });

    // if no index, then stop
    if (idx == null) {
      console.log('Failed to find your Gruntfile. \nAre you running \'grunt-devtools\' in a directory with a Gruntfile?');
      return;
    }

    // gets Grunt raw config
    var gruntRaw = response[idx + 1];
    // gets Grunt task config
    var gruntTasks = response[idx + 2];

    var configRaw = null;
    var configTasks = null;

    // try to parse grunt raw and task config
    try {
      configRaw = JSON.parse(gruntRaw);
      configTasks = JSON.parse(gruntTasks);
    } catch (e) {
      console.log(e);
    }

    if (configRaw === null || configTasks === null) {
      console.log('Failed to parse your Gruntfile. Please report this issue...');
      return;
    }

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
          // add to Core task list
          coreTasks.push(task);
        }

      }
    });

    var devtools = spawn('grunt', [
      // no color output for this task
      '-no-color',
      // load core tasks from the array
      '--core',
      JSON.stringify(coreTasks),
      // load alias tasks from the array
      '--alias',
      JSON.stringify(aliasTasks),
      // add devtools plugin tasks to project's Grunt
      '--tasks',
      devtoolsTask,
      'devtools'
    ]);

    devtools.stdout.on('data', function (data) {
      if (data && data.length > 0) {
        console.log(data.toString());
      }
    });

    devtools.stderr.on('data', function (data) {
      if (data && data.length > 0) {
        console.log(data.toString());
      }
    });

    function killWorkers() {
      process.kill(devtools.pid);
      process.exit();
    }

    process.on("uncaughtException", killWorkers);
    process.on("SIGINT", killWorkers);
    process.on("SIGTERM", killWorkers);

  });
};
