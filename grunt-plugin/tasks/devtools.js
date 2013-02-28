'use strict';

module.exports = function (grunt) {

  grunt.registerTask('devtools', 'Runs a server for devtools', function () {
    this.async();
    var WebSocketServer = require('websocket').server;
    var fs = require("fs");
    var spawn = require("child_process").spawn;
    var workers = [];
    var http = require('http');
    var portscanner = require('portscanner');

    var version = 0; // TODO
    var pjson = require('../package.json');
    if (pjson.version) {
      version = pjson.version;
    }

    // TODO: update this
    var projectPath = process.cwd().split('/');
    var projectName = projectPath[projectPath.length - 1];
    var aliasTasks = getAliasTasks();
    var allTasks = Object.keys(grunt.task._tasks);
    var basicTasks = grunt.util._.difference(allTasks, aliasTasks);

    var server = http.createServer(function (request, response) {
      response.writeHead(404);
      response.end();
    });

    // TODO: update this
    var projectPort = 61750;
    portscanner.findAPortNotInUse(projectPort, projectPort + 4, 'localhost', function (error, port) {
      projectPort = port;
      if (projectPort) {
        server.listen(port, function () {
          grunt.log.ok("Grunt Devtools v" + version + " is ready! Proceed to the Chrome extension.");
        });
      } else {
        grunt.fail.warn("You're running too many Grunt Devtools, please close one.");
      }
    });

    var wsServer = new WebSocketServer({
      httpServer:server,
      autoAcceptConnections:false
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
                  worker.kill();
                  connection.send("Task Killed: " + msg.task.name);
                }
              });
            }
          } else {
            if (msg === 'handleSocketOpen') {
              connection.sendUTF(JSON.stringify({
                tasks:basicTasks,
                alias:aliasTasks,
                project:projectName,
                port:projectPort
              }));
            }
            else if (allTasks.indexOf(msg) > -1) {
              var watcher = spawn('grunt', [msg, '-no-color']);
              watcher.key = key;
              workers.push(watcher);
              connection.sendUTF(JSON.stringify({
                action:'start',
                name:msg,
                pid:watcher.pid
              }));
              connection.send("Running Task: " + msg);
              watcher.stdout.on('data', function (data) {
                if (data) {
                  connection.send(data.toString());
                }
              });
              watcher.stdout.on('end', function (data) {
                if (data) {
                  connection.send(data.toString());
                }
                connection.sendUTF(JSON.stringify({ action:'done'}));
              });
              watcher.stderr.on('data', function (data) {
                if (data) {
                  connection.send(data.toString());
                }
              });
              watcher.on('exit', function (code) {
                if (code !== 0) {
                  connection.send("Process Exited with code: " + code);
                }
              });
            }
          }
        }
      });
      connection.on('close', function () {
        killWorkers(key);
      });
    });


    /**
     * Clean up child processes
     */
    var killWorkers = function (key) {
      workers.forEach(function (worker) {
        if (key) {
          if (worker.key === key) {
            worker.kill();
          }
        } else {
          process.kill(worker);
        }
      });

      if (!key) {
        process.exit();
      }
    };

    process.on("uncaughtException", killWorkers);
    process.on("SIGINT", killWorkers);
    process.on("SIGTERM", killWorkers);

    // TODO: move this later please
    /**
     * Get sidebar list for section from Home.md
     */
    function getAliasTasks() {
      var l,
        aliasTasks = [];

      var gruntFile = 'Gruntfile.js',
        gruntFileCoffee = 'Gruntfile.coffee';
      // check if Gruntfile.coffee
      if (grunt.file.exists(gruntFileCoffee)) {
        gruntFile = gruntFileCoffee;
      }
      // make sure Gruntfile exists, otherwise exit
      if (grunt.file.exists(gruntFile)) {
        // TODO: add grunt read file here?
        var lines = fs.readFileSync(gruntFile).toString().split('\n');
        for (l in lines) {
          var line = lines[l].replace(/ /g, '');
          if (line.indexOf('grunt.registerTask') === 0) {
            aliasTasks.push(line.split(/'/)[1]);
          }
        }
        return aliasTasks;
      } else {
        grunt.fail.warn('Cannot find Gruntfile.js or Gruntfile.coffee');
      }
    }
  });
};
