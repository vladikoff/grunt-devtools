var socket;

var $output = $("#placeOutput");
var $body = $('body');
var $tasks = $('#tasks');
var $bgSection = $('#backgroundTasks');
var $bgTasks = $('#placeBackgroundTasks');
var $regularTasks = $('#placeTasks');
var $aliasTasks = $('#placeAliasTasks');
var $projects = $('#placeProjects');

var currentProject;
var startPort = 61749;
var currentPort = startPort;
var maxPort = currentPort + 5;
var projects = [];
var running = false;
var currentTask;

/**
 * Connect to a devtools socket
 */
function connect(port) {
  var exists = _.find(projects, function (project) {
    return project.port === currentPort;
  });

  if (!exists) {
    var socketAddr = 'ws://localhost:' + currentPort;
    if (port) {
      socketAddr = 'ws://localhost:' + port;
    }
    socket = new WebSocket(socketAddr, 'echo-protocol');
    socket.onopen = handleSocketOpen;
    socket.onmessage = handleSocketMessage;
    socket.onclose = handleSocketClose;
    socket.onerror = handleSocketError;
  }

  if (maxPort === currentPort) {
    currentPort = startPort;
  }
  currentPort++;
  setTimeout(connect, 1000);
}

function handleSocketOpen(e) {
  $body.removeClass('offline').addClass('online');
  socket.send('connect');
}

function handleSocketMessage(event) {
  // TODO: please fix this later
  try {
    var data = JSON.parse(event.data);
    if (data && data.project) {
      // connecting a new project
      // add this new project
      projects.push({
        name:data.project,
        port:parseInt(data.port),
        socket:socket,
        alias:data.alias,
        tasks:data.tasks,
        backgroundTasks: []
      });
      // add new project button
      updateProjectList();
      // set to current to latest, if not running
      setProject(projects.length - 1);

    }
    else if (data && data.action === 'done') {
      enableActivity();
    }
  } catch (e) {
    // new task
    if (event.data.indexOf('Running Task:') === 0) {
      $output.html('');
    } else if (event.data.length > 1) {
      // append output
      $output.append('<pre>' + new Date().toString().split(' ')[4] + ' - ' + event.data + '</pre>');
    }
  }
}

/**
 * Handle a socket close
 * @param e event
 */
function handleSocketClose(e) {
  //console.log(projects);
  // port that was just closed
  var closedPort = parseInt(e.currentTarget.URL.split(':')[2].replace(/\D/g, ''));
  // remove this project
  var newProjects = _.reject(projects, function (el) {
    return el.port === closedPort;
  });

  // if disconnected a real socket
  if (newProjects.length !== projects.length) {
    // if we disconnected the active project and it was running
    if (closedPort === currentProject.port && running) {
      enableActivity();
    }

    projects = newProjects;
    updateProjectList();
    setProject(projects.length - 1);
  } else {
    projects = newProjects;
  }
  // if nothing left
  if (projects.length === 0) {
    $body.removeClass('online').addClass('offline');
  }
}

/**
 * Handle socket error
 */
function handleSocketError() {
  // TODO: update this
  alert('Something went really wrong, please report this...');
}

function updateProjectList() {
  // update project list
  var projectListTpl = "<% _.each(projects, function(project, i) { %> <button value='<%= i %>'><%= project.name %></button><% }); %>";
  $projects.html(_.template(projectListTpl, projects));
}

function setProject(idx) {
  // if not running, change the active project. Otherwise it stays the same
  if (!running) {
    // get project by index
    currentProject = projects[idx];
    // update project tab style
    var buttons = $projects.find('button');
    buttons.removeClass('active');
    $(buttons.get(idx)).addClass('active');
    // clear output
    $output.html('');
    // update task lists for this project
    if (currentProject) {
      // set the tasks
      var taskListTpl = "<% _.each(buttons, function(name) { %> <button value='<%= name %>'><%= name %></button><% }); %>";
      $regularTasks.html(_.template(taskListTpl, {buttons:currentProject.tasks}));
      $aliasTasks.html(_.template(taskListTpl, {buttons:currentProject.alias}));
      if(currentProject.backgroundTasks.length > 0) {
        $bgSection.addClass('show');
        $bgTasks.html(_.template(taskListTpl, {buttons:currentProject.backgroundTasks}));
      } else {
        $bgSection.removeClass('show');
      }
    }
  }
}

/**
 * Connect!
 */
connect();

/**
 * Button Events
 */

// execute task
$tasks.on('click', 'button', function () {
  currentProject.socket.send($(this).val());
  currentTask = {name:$(this).val(), output: ''};
  disableActivity();
});

// switch projects
$projects.on('click', 'button', function () {
  var idx = $(this).val();
  setProject(idx);
});

// send task to background
$('#sendBackground').on('click',function () {
  //console.log('sendingToBackground');
  if(currentTask) {
    currentProject.backgroundTasks.push(currentTask);
  }
  connect(currentProject.port);
  enableActivity();
});

// kill current task
$('#killTask').on('click',function () {
  //console.log('killingTask');
});


function disableActivity() {
  running = true;
  $body.addClass('running');
  $('#tasks button, #projects button').prop('disabled',true);
}

function enableActivity() {
  running = false;
  $body.removeClass('running');
  $('#tasks button, #projects button').prop('disabled',false);
}