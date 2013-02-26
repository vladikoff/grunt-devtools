var socket;
var tasks;

var $connection = $("#connection");
var $output = $("#output");
var $body = $('body');
var $tasks = $('#tasks');

function connect() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
  }
  socket = new WebSocket('ws://localhost:61750', 'echo-protocol');
  socket.onopen = handleSocketOpen;
  socket.onmessage = handleSocketMessage;
  socket.onclose = handleSocketClose;
  socket.onerror = handleSocketError;
}

function toolsOnline() {
  $connection.removeAttr('value');
  $body.removeClass('offline').addClass('online');
}

function toolsOffline() {
  $body.removeClass('online').addClass('offline');
  $connection.attr('value', 0);
}


function disconnect() {
  socket.close();
}

function log(data) {
  if (window['console'] && window['console']['log'])
    console.log(data)
}

function handleSocketOpen() {
  log("Socket opened.");
  toolsOnline();
  socket.send('connect');
}

function handleSocketMessage(event) {
  // TODO: please fix this later
  try {
    var data = JSON.parse(event.data);
    console.log(data);
    var list = "<% _.each(tasks, function(name) { %> <button value='<%= name %>'><%= name %></button><% }); %>";
    $tasks.html(_.template(list, data));
  } catch (e) {
    $output.html(event.data);
  }
}

function handleSocketClose() {
  log("Socket closed.");
  toolsOffline();
}

function handleSocketError() {
  log("Socket error.");
  toolsOffline();
}

/**
 * Connect!
 */
connect();

$("#reconnect").click(function () {
  connect();
});

$("#tasks").on('click', 'button', function () {
  var btn = $(this);
  socket.send(btn.val());
});