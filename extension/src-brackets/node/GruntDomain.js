(function () {
  "use strict";

  var spawn = require("child_process").spawn;

  var currentProcess = null;

  // TODO: move this
  function shellEscape(str) {
    return str.replace(/(["\s'$`\\])/g, '\\$1');
  }

  function stopDevtoolsHandler() {
    killWorkers();
  }

  function startDevtoolsHandler(path, gruntfile) {
    if (currentProcess) {
      console.log('I already have a currentProcess with ' + currentProcess.pid);
      killWorkers();
      return {pid: null};
    } else {

      // change into project directory
      process.chdir(path);

      // TODO: Windows support here, check paths
      console.log('|' + gruntfile + '|');
      var gruntFilePath = path + gruntfile;
      console.log(gruntFilePath);
      var spawnCmd = '/usr/local/bin/node';

      var cmd = [
        '/usr/local/bin/grunt',
        '--gruntfile',
        gruntFilePath,
        '--base',
        process.cwd(),
        'devtools',
        '--env',
        'brackets'
      ];

      currentProcess = spawn(spawnCmd, cmd);
      currentProcess.stdout.on('data', function (data) {
        if (data) {
          console.log(data.toString());
        }
      });
      /*
       currentProcess = cp.exec(command, function (err, stdout, stderr) {
       //console.log(stderr);
       console.log(process.execPath);

       });
       */
      console.log(currentProcess.pid);
      return {pid: currentProcess.pid};
    }
  }

  function init(DomainManager) {
    if (!DomainManager.hasDomain("grunt")) {
      DomainManager.registerDomain("grunt", {major: 0, minor: 1});
    }
    // startDevtools command
    DomainManager.registerCommand(
      "grunt", // domain
      "startDevtools", // command
      startDevtoolsHandler, // handler
      false, // sync
      "Starts grunt-devtools", // description
      // params
      [
        {
          name: "path",
          type: "string",
          description: "full path to the project"
        },
        {
          name: "grunt",
          type: "string",
          description: "Gruntfile"
        }
      ],
      // returns
      [
        {name: "grunt",
          type: "{pid: currentProcess.pid}",
          description: "Process id"}
      ]
    );

    // startDevtools command
    DomainManager.registerCommand(
      "grunt", // domain
      "stopDevtools", // command
      stopDevtoolsHandler, // handler
      false, // sync
      "Stops grunt-devtools", // description
      // params
      [],
      // returns
      []
    );
  }

  /**
   * Clean up child processes
   */
  var killWorkers = function (key) {
    if (currentProcess) {
      currentProcess.kill();
    }

    currentProcess = null;
  };

  process.on("uncaughtException", killWorkers);
  process.on("SIGINT", killWorkers);
  process.on("SIGTERM", killWorkers);

  exports.init = init;

}());
