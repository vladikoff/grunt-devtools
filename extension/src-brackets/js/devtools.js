'use strict';

var extVersion = manifest.version;

// Grunt project setting
var socket,
  projects = [],
  currentProject;

// Port settings
var startPort = 61749,
  currentPort = startPort,
  maxPort = currentPort + 5;

// Templates
var projectListTpl = _.template("<% if (typeof(projects) != 'undefined') { %><% _.each(projects, function(project, i) { %><% if ((project) != null) { %><button value='<%= i %>'><%= project.name %></button>"+
    "<% } %><% }); %><% } %>"),
  taskListTpl = _.template(
    "<% if (typeof(buttons) != 'undefined') { %>"+
"<% _.each(buttons, function(name) { %>"+
"<li>"+
" <% if (typeof(name) != 'undefined') { %>"+
"     <button class='task' value='<%= name %>'><%= name %></button>"+
"     <% } %>"+
""+
"      <button title='Set --verbose' class='b b-second b-flag b-verbose' value='-v'>V</button>"+
"      <button title='Set --force' class='b b-first b-flag b-force' value='-f'>F</button>"+
""+
"      <button title='Add to Background Tasks' class='b b-second b-bg'>B</button>"+
"      <button title='Kill Task' class='b b-first b-kill'>X</button>"+
"    </li>"+
"    <% }); %>"+
"  <% } %>"

  ),
  bgTasksTpl = _.template($("#bgTaskList").html());
  console.log($("#projectList").html());
// UI Selectors
var $output = $("#placeOutput"),
  $outputWrap = $('#output'),
  $body = $('body'),
  $tasks = $('#tasks'),
  $bgSection = $('#backgroundTasks'),
  $bgTasks = $('#placeBackgroundTasks'),
  $regularTasks = $('#placeTasks'),
  $aliasTasks = $('#placeAliasTasks'),
  $projects = $('#placeProjects'),
  $warning = $('#updateWarning');

/**
 * Connect to a devtools socket
 */
function connect() {
  // find a project where the port is currentPort
  var exists = _.find(projects, function (project) {
    return project.port === currentPort;
  });

  // if no project on that port
  if (!exists) {
    var socketAddr = 'ws://localhost:' + currentPort;

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

/**
 * Handle socket open event
 */
function handleSocketOpen(e) {
  $body.removeClass('offline').addClass('online');
  socket.send('handleSocketOpen');
}

/**
 * Handle socket message for an event
 */
function handleSocketMessage(event) {
  var data = event.data;

  // TODO: please fix this later, this will handle most actions via JSON
  try {
    data = JSON.parse(event.data);
    if (data && data.project) {
      // connecting a new project
      // add this new project
      projects.push({
        name: data.project,
        port: parseInt(data.port),
        socket: socket,
        taskListAlias: data.alias,
        taskListGeneric: data.tasks,
        tasks: [],
        running: false,
        devtoolsVersion: data.devtoolsVersion
      });
      // add new project button
      updateProjectList();
      // set to current to latest, if not running
      setProject(projects.length - 1);
    }
    // process done
    else if (data && data.action === 'done') {
      currentProject.tasks = _.reject(currentProject.tasks, function (task) {
        return task.pid === data.pid;
      });
      updateTaskList();
      currentProject.running = false;
      enableActivity();
    }
    // process started
    else if (data && data.action === 'start') {
      currentProject.currentTask = {name: data.name, pid: data.pid, output: []};
      currentProject.tasks.push(currentProject.currentTask);
      updateTaskList();
    }
  } catch (e) {
    // new task
    if (data.indexOf('Running Task:') === 0) {
      $output.html('');
    } else if (data.length > 1) {
      if (currentProject.tasks.length > 0) {
        var msg = data.split("|"),
          pid = msg[0],
          timestamp = new Date().toString().split(' ')[4],
          output = '<pre>' + timestamp + ' - ' + _.escape(msg[1]) + '</pre>';

        // find a task with a process id of the message
        var pidTask = _.find(currentProject.tasks, function (task) {
          return task.pid === parseInt(pid);
        });

        // if we found a task with a pid
        if (pidTask) {
          pidTask.output.push(output);
        }

        // append output to the current view if the process id matches
        if (currentProject.currentTask && parseInt(pid) === currentProject.currentTask.pid) {
          $output.append(output);
          $outputWrap.scrollTop($output.height());
        }
      }
    }
  }
}

/**
 * Handle a socket close
 * @param e event
 */
function handleSocketClose(e) {
  // port that was just closed
  var closedPort = parseInt(e.currentTarget.URL.split(':')[2].replace(/\D/g, ''));
  // remove this project
  var newProjects = _.reject(projects, function (el) {
    return el.port === closedPort;
  });

  // if disconnected a real socket
  if (newProjects && newProjects.length !== projects.length) {
    // if we disconnected the active project and it was running
    if (closedPort === currentProject.port && currentProject.running) {
      currentProject.running = false;
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
  console.log('Something went really wrong, please report this...');
}

function updateProjectList() {
  // update project list

  $projects.html(projectListTpl(projects));
}

function updateTaskList() {
  // set the tasks
  $regularTasks.html(taskListTpl({buttons: currentProject.taskListGeneric}));
  $aliasTasks.html(taskListTpl({buttons: currentProject.taskListAlias}));

  if (currentProject.currentTask) {
    $('.task[value="' + currentProject.currentTask.name + '"]')
      .siblings('.b-kill').data('pid', currentProject.currentTask.pid).end()
      .parent().addClass('active-task');
  }

  var bgTasks = currentProject.tasks;
  if (currentProject.currentTask) {
    bgTasks = _.reject(currentProject.tasks, function (task) {
      return task.pid === currentProject.currentTask.pid;
    });
  }

  if (bgTasks.length > 0) {
    $bgSection.addClass('show');
    $bgTasks.html(bgTasksTpl({tasks: bgTasks}));
  } else {
    $bgSection.removeClass('show');
  }

  if (currentProject.running) {
    $('#tasks .task, #projects .task').prop('disabled', true);
  }
}

function setProject(idx) {
  // if not running, change the active project. Otherwise it stays the same

  // TODO: bug here, need to check if the task is running
  // get project by index
  currentProject = projects[idx];
  // update project tab style
  var buttons = $projects.find('button');
  buttons.removeClass('active');
  $(buttons.get(idx)).addClass('active');

  // check version
  if (currentProject &&
    (currentProject.devtoolsVersion == null || currentProject.devtoolsVersion.replace(/-/g, '.') !== extVersion)) {
    $warning.addClass('show');
  } else {
    $warning.removeClass('show');
  }

  // clear output
  if (currentProject && currentProject.currentTask) {
    $output.html(currentProject.currentTask.output);
  } else {
    $output.html('');
  }
  // update task lists for this project
  if (currentProject) {
    updateTaskList();
  }
  enableActivity();
}

/**
 * Connect!
 */
connect();

/**
 * Button Events
 */

// execute task
$tasks.on('click', '.task', function () {
  var cmd = $(this).val();

  currentProject.running = true;
  $tasks.find('.b-on').each(function () {
    cmd += ' ' + $(this).val();
  });
  currentProject.socket.send(cmd);
  disableActivity();
});

// execute task
$tasks.on('click', '.bgTask', function () {
  var pid = $(this).siblings('.b-kill').data('pid');
  currentProject.currentTask = _.find(currentProject.tasks, function (task) {
    return task.pid === pid;
  });
  if (currentProject.currentTask) {
    $output.html(currentProject.currentTask.output);
  }
  currentProject.currentTask = null;
  updateTaskList();
  currentProject.running = false;
  enableActivity();
});

// switch projects
$projects.on('click', 'button', function () {
  var idx = $(this).val();
  setProject(idx);
  currentProject.running ? disableActivity() : enableActivity();
});

// send task to background
$tasks.on('click', '.b-bg', function () {
  if (currentProject.currentTask) {
    currentProject.currentTask = null;
    $output.html('');
    updateTaskList();
    currentProject.running = false;
    enableActivity();
  }
});

// set flags
$tasks.on('click', '.b-flag', function () {
  var bData = $(this);
  bData.hasClass('b-on') ? bData.removeClass('b-on') : bData.addClass('b-on');
});

// kill current task
$tasks.on('click', '.b-kill', function () {
  var btn = $(this),
  // get pid info from current task
    taskInfo = currentProject.currentTask;

  // if there's a pid, use it instead
  if (btn.data('pid')) {
    taskInfo = {name: btn.val(), pid: btn.data('pid')};
    // TODO: validate this?
    currentProject.tasks = _.reject(currentProject.tasks, function (task) {
      return task.pid === btn.data('pid');
    });
    updateTaskList();
  }
  currentProject.socket.send(JSON.stringify({
    action: 'killTask',
    task: taskInfo
  }));
});

function disableActivity() {
  $body.addClass('running');
  $('#tasks .task').prop('disabled', true);
}

function enableActivity() {
  $body.removeClass('running');
  $('#tasks .task').prop('disabled', false);
}
