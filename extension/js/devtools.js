var socket;

// TODO: organize templates
var projectListTpl = "<% _.each(projects, function(project, i) { %><button value='<%= i %>'><%= project.name %></button><% }); %>";
var taskListTpl = "<% _.each(buttons, function(name) { %> <li><button class='task' value='<%= name %>'><%= name %></button><button title='Add to Background Tasks' class='b b-bg'>B</button><button title='Kill Task' class='b b-kill'>X</button></li><% }); %>";
var bgTasksTpl = "<% _.each(tasks, function(task) { %> <li><button value='<%= task.name %>'><%= task.name %></button><button title='Kill Task' class='b b-kill' data-pid='<%= task.pid %>'>X</button></li><% }); %>";

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
  socket.send('handleSocketOpen');
}

function handleSocketMessage(event) {
  // TODO: please fix this later, this will handle most actions via JSON
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
    // process done
    else if (data && data.action === 'done') {
      enableActivity();
    }
    // process started
    else if (data && data.action === 'start') {
      currentTask = {name: data.name, pid: data.pid};
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
  $projects.html(_.template(projectListTpl, projects));
}

function updateTaskList() {
  // set the tasks
  $regularTasks.html(_.template(taskListTpl, {buttons:currentProject.tasks}));
  $aliasTasks.html(_.template(taskListTpl, {buttons:currentProject.alias}));

  if(currentProject.backgroundTasks.length > 0) {
    $bgSection.addClass('show');
    $bgTasks.html(_.template(bgTasksTpl, {tasks: currentProject.backgroundTasks}));
  } else {
    $bgSection.removeClass('show');
  }
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
      updateTaskList();
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
$tasks.on('click', '.task', function () {
  $tasks.find('li').removeClass('active-task');
  $(this).parent().addClass('active-task');
  currentProject.socket.send($(this).val());
  disableActivity();
});

// switch projects
$projects.on('click', 'button', function () {
  var idx = $(this).val();
  setProject(idx);
});

// send task to background
$tasks.on('click', '.b-bg',function () {
  // TODO: there will be a problem here if socket is slow
  if(currentTask) {
    currentProject.backgroundTasks.push(currentTask);
    currentTask = null;
    $output.html('');
    updateTaskList();
    enableActivity();
  }
});

// kill current task
$tasks.on('click','.b-kill',function () {
  var btn = $(this),
    // get pid info from current task
    taskInfo = currentTask;

  // if there's a pid, use it instead
  if (btn.data('pid')) {
    taskInfo = {name: btn.val(), pid: btn.data('pid')};
    // TODO: validate this?
    currentProject.backgroundTasks = _.reject(currentProject.backgroundTasks, function (task) {
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
  running = true;
  $body.addClass('running');
  $('#tasks .task, #projects .task').prop('disabled',true);
}

function enableActivity() {
  running = false;
  $body.removeClass('running');
  $('#tasks .task, #projects .task').prop('disabled',false);
}
