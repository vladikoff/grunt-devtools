'use strict';

module.exports = function(grunt) {

  grunt.registerTask('devtools', 'Runs a server for devtools', function() {

    this.async();
    var WebSocketServer = require('websocket').server;
    var exec = require('child_process').exec;
    var http = require('http');

    var server = http.createServer(function(request, response) {
      console.log((new Date()) + ' Received request for ' + request.url);
      response.writeHead(404);
      response.end();
    });
    server.listen(61750, function() {
      console.log((new Date()) + ' Server is listening on port 61750');
    });

    var wsServer = new WebSocketServer({
      httpServer: server,
      // You should not use autoAcceptConnections for production
      // applications, as it defeats all standard cross-origin protection
      // facilities built into the protocol and the browser.  You should
      // *always* verify the connection's origin and decide whether or not
      // to accept it.
      autoAcceptConnections: false
    });

    wsServer.on('request', function(request) {
      var connection = request.accept('echo-protocol', request.origin);
      console.log((new Date()) + ' Connection accepted.');
      connection.on('message', function(message) {
        if (message.type === 'utf8') {
          var msg = message.utf8Data;
          if (msg === 'connect') {
            connection.sendUTF( JSON.stringify( {tasks: Object.keys(grunt.config.data)}) );
          }
          else if (Object.keys(grunt.config.data).indexOf(msg) > -1) {
            console.log('found task ' + msg);
            exec('grunt ' + msg + ' -no-color', function (error, stdout, stderr) {
              if(error) {
                connection.sendUTF(error);
                console.log(error);
              } else {
                console.log(stdout);
                connection.send(stdout);
              }
            });
          }
        }
      });
      connection.on('close', function() {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
      });
    });
  });
};
