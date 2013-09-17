module.exports = function () {

  var shell = require('shelljs');
  var spawn = require('child_process').spawn;
  // path to the custom devtools task
  var devtoolsTask = __dirname + '/../tasks';
  if (process.platform === 'win32') {
    devtoolsTask = __dirname + '\\..\\tasks';
  }

  // command to load the custom devtools task and run the _devtools_config task
  var cmd = 'grunt -no-color -tasks ' + devtoolsTask + ' _devtools_config';

  // run the command to get the task list  
  var result = shell.exec(cmd, { silent: true });

  var idx = null;
  var response = result.output.toString().split('\n');
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
    console.log('Failed to find your Gruntfile or \'grunt\' node module. \nAre you running \'grunt-devtools\' in a directory with a Gruntfile?');
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
        delete task.meta;
        delete task.info;

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

        if (task.targets.length === 0) {
          delete task.targets;
        }

        delete task.meta;
        delete task.info;
        // add to Core task list
        coreTasks.push(task);
      }

    }
  });

  var spawnArgs = [
    // add devtools plugin tasks to project's Grunt
    '--tasks',
    devtoolsTask,
    'devtools',
    // no color output for this task
    '-no-color',
    // load core tasks from the array
    '--core',
    JSON.stringify(coreTasks),
    // load alias tasks from the array
    '--alias',
    JSON.stringify(aliasTasks)
  ];
  var spawnCmd = (process.platform === 'win32') ? 'grunt.cmd' : 'grunt';
  var devtools = spawn(spawnCmd, spawnArgs);

  devtools.stdout.pipe(process.stdout);
  devtools.stderr.pipe(process.stderr);

  function killWorkers() {
    process.kill(devtools.pid);
    process.exit();
  }

  process.on("uncaughtException", killWorkers);
  process.on("SIGINT", killWorkers);
  process.on("SIGTERM", killWorkers);


};
