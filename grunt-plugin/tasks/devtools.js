'use strict';

module.exports = function (grunt) {

  grunt.registerTask('devtools', 'Runs a server for devtools', function () {
    // run forever until the user kills the task
    this.async();

    var WebSocketServer = require('websocket').server,
      fs = require("fs"),
      spawn = require("child_process").spawn,
      exec = require("child_process").exec,
      http = require('http'),
      portscanner = require('portscanner');

    // collects all process workers
    var workers = [];
    var pkg = require('../package.json'),
      version = pkg.version;

    // set path split character
    var splitChar = '/';
    // on Windows we need a different path split
    if (process.platform === 'win32') splitChar = '\\';

    // split the project path
    var projectPath = process.cwd().split(splitChar);
    // get the project name from the last piece in the path
    var projectName = projectPath[projectPath.length - 1];
    // get alias tasks from the Gruntfile
    // TODO: update this
    var allTasks = [];

    if (grunt.option('core') && grunt.option('alias')) {
      allTasks.core = JSON.parse(grunt.option('core'));
      allTasks.alias = JSON.parse(grunt.option('alias'));
    } else {
      allTasks = require('../lib/local').init(grunt).getTasks();
    }

    var aliasTasks = allTasks.alias;
    var basicTasks = allTasks.core;
    var allTasks = allTasks.core.concat(allTasks.alias);

    var server = http.createServer(function (request, response) {
      response.writeHead(404);
      response.end();
    });

    // TODO: update this
    // set start port
    var projectPort = 61750;
    // use portscanner to find a suitable port for this project
    portscanner.findAPortNotInUse(projectPort, projectPort + 4, 'localhost', function (error, port) {
      projectPort = port;
      // if we found a good port
      if (projectPort) {
        // start the server on that port
        server.listen(port, function () {
          grunt.log.ok("Grunt Devtools v" + version + " is ready! Proceed to the Chrome extension.");
        });
      } else {
        grunt.fail.warn("You're running too many Grunt Devtools, please close one.");
      }
    });

    var wsServer = new WebSocketServer({
      httpServer: server,
      autoAcceptConnections: false
    });

    wsServer.on('request', function (request) {
      var key = request.key;
      var connection = request.accept('echo-protocol', request.origin);
      connection.on('message', function (message) {
        if (message.type === 'utf8') {
          var msg = message.utf8Data;

          try {
            msg = JSON.parse(message.utf8Data);
          } catch (e) {
          }
          if (msg.action) {
            if (msg.action === 'killTask') {
              workers.forEach(function (worker) {
                if (worker.pid === msg.task.pid) {
                  connection.send(worker.pid + '|' + 'Task Killed: ' + msg.task.name);
                  // TODO: update this
                  // TODO: Also need to clean up tmp directory here.
                  if (process.platform === 'win32') {
                    exec('taskkill /pid ' + worker.pid + ' /T /F');
                  } else {
                    worker.kill();
                  }
                  connection.sendUTF(JSON.stringify({ action: 'done', pid: worker.pid }));
                  workers = grunt.util._.reject(workers, function (w) {
                    return w.pid === worker.pid
                  });
                }
              });
            }
          } else {
            // get the command from the request
            var cmd = msg.split(' ');
            // default spawn command
            var spawnCmd = 'grunt';
            // task name we want to run
            var taskName = cmd[0];

            if (process.env && process.env.PWD) {
              // TODO: this might break win32
              process.chdir(process.env.PWD);
            }

            // if Windows  need to change a few things
            if (process.platform === 'win32') {
              // add cmd to spawn properly
              spawnCmd = 'grunt.cmd';
            }

            // if running in Adobe Brackets env
            if (grunt.option('env') === 'brackets') {
              // need a full node path
              spawnCmd = '/usr/local/bin/node';
              // add grunt to our list
              cmd.unshift('/usr/local/bin/grunt');
            }

            if (taskName === 'handleSocketOpen') {
              // build a list of core tasks with targets
              var basicWithTargets = [];
              // for every core tasks
              basicTasks.forEach(function(task) {
                // push the core task into the list
                basicWithTargets.push(task);
                // if this task has targets
                if (task.targets) {
                  task.targets.forEach(function (target) {
                    // create a new mini task that has a name of the core task plus target name
                    basicWithTargets.push({ name: task.name + ':' + target });
                  });
                }
              });

              // send a list of tasks and the project info to the connection
              connection.sendUTF(JSON.stringify({
                tasks: basicWithTargets,
                alias: aliasTasks,
                project: projectName,
                port: projectPort,
                devtoolsVersion: version
              }));
            }
            else if (grunt.util._.where(allTasks, { 'name': taskName.split(':')[0] })) {
              var watcher = spawn(spawnCmd, cmd);
              watcher.key = key;
              workers.push(watcher);
              connection.sendUTF(JSON.stringify({
                action: 'start',
                name: cmd[0],
                pid: watcher.pid
              }));
              // TODO: fix bug here with running task return
              connection.send('Running Task: ' + taskName);
              grunt.log.ok('Running Task: ' + taskName);
              watcher.stdout.on('data', function (data) {
                if (data) {
                  connection.send(watcher.pid + '|' + data.toString());
                }
              });
              watcher.stdout.on('end', function (data) {
                if (data) {
                  connection.send(watcher.pid + '|' + data.toString());
                }
                connection.sendUTF(JSON.stringify({ action: 'done', pid: watcher.pid }));
              });
              watcher.stderr.on('data', function (data) {
                if (data) {
                  connection.send(watcher.pid + '|' + data.toString());
                }
              });
              watcher.on('exit', function (code) {
                if (code !== 0) {
                  connection.send(watcher.pid + '|' + 'Process Exited with code: ' + code);
                }
                // TODO BUG: need to clean up 'workers' here
              });
            }
          }
        }
      });

      // when this session ends stop all workers
      connection.on('close', function () {
        killWorkers({type: 'connection'});
      });
    });

    /**
     * Clean up child processes
     */
    var killWorkers = function (opts) {
      var opts = opts ? opts : {};

      workers.forEach(function (worker) {
        if (process.platform === 'win32') {
          exec('taskkill /pid ' + worker.pid + ' /T /F');
        } else {
          try {
            process.kill(worker.pid);
          } catch (e) {
            //console.log(e);
          }
        }
      });

      // if we are killing workers not from the connection close
      // TODO: this might break things
      if (opts.type !== 'connection') {
        process.exit();
      }
    };

    process.on("uncaughtException", killWorkers);
    process.on("SIGINT", killWorkers);
    process.on("SIGTERM", killWorkers);

  });
};
