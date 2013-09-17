/*global define, brackets, $, window, PathUtils */

define(function (require, exports, module) {
  'use strict';

  require('js/vendor/lodash.min');

  // get helpers
  var devtools = require('js/lib/brackets-devtools');

  // Brackets modules
  var AppInit = brackets.getModule('utils/AppInit'),
    DocumentManager = brackets.getModule('document/DocumentManager'),
    EditorManager = brackets.getModule('editor/EditorManager'),
    ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
    Resizer = brackets.getModule('utils/Resizer'),
    NodeConnection = brackets.getModule('utils/NodeConnection'),
    ProjectManager = brackets.getModule('project/ProjectManager');

  // frame and panel templates
  var frameHTML = require('text!frame.html'),
    panelHTML = require('text!panel.html');
  // jQuery objects
  var $icon,
    $iframe,
    $extPanel,
    $panelControl;

  // Other vars
  var currentDoc,
  // Create a new node connection. Requires the following extension:
  // https://github.com/joelrbrandt/brackets-node-client
    nodeConnection = new NodeConnection(),
    visible = false,
    realVisibility = false,
    gruntRunning = false;

  function _resizeIframe() {
    if ($iframe) {
      var iframeWidth = $extPanel.innerWidth();
      var iframeHeight = $extPanel.outerHeight();
      $iframe.attr('width', iframeWidth + 'px');
      $iframe.attr('height', iframeHeight + 'px');
    }
  }

  function _setPanelVisibility(isVisible) {
    if (isVisible === realVisibility) {
      return;
    }

    realVisibility = isVisible;
    if (isVisible) {
      if (!$extPanel) {
        $extPanel = $(frameHTML);
        $iframe = $extPanel.find('#panel-grunt-devtools-frame');
        $panelControl = $extPanel.find('#panel-grunt-devtools-panel-control');

        $panelControl.on('click', function () {
          _setPanelControl();

          _resizeIframe();
          EditorManager.resizeEditor();
          $extPanel.trigger('mousemove');
        });

        $extPanel.insertBefore('#status-bar');
        // make panel resizeable
        Resizer.makeResizable($extPanel.get(0), 'vert', 'top', 26, false);
        $extPanel.on('panelResizeUpdate', function (e, newSize) {
          $iframe.attr('height', newSize);
          if (newSize === 26) {
            $panelControl.text('^');
          } else {
            $panelControl.text('');
          }
        });

        $iframe.attr('height', $extPanel.height());
        window.setTimeout(_resizeIframe);
      }

      if ($iframe) {
        var panelTpl = _.template(panelHTML);

        var panelData = {
          css: require.toUrl('./css/devtools.css'),
          icon128: require.toUrl('./img/icon128.png'),
          cssSkin: require.toUrl('./css/devtools-brackets.css'),
          devtoolsSrc: require.toUrl('./js/devtools.js')
        };
        $iframe.attr('srcdoc', panelTpl(panelData));
      }
      $extPanel.show();
      _setPanelControl('min');
    } else {
      $extPanel.hide();
    }
    //$icon.toggleClass('active');
    EditorManager.resizeEditor();
  }

  // run grunt from brackets via a node process
  function _enableGruntFromProject() {
    var $fileContainer = $('#project-files-container'),
      gFile = $fileContainer
        .find('a:contains("Gruntfile.coffee"),a:contains("Gruntfile.js"),a:contains("gruntfile.coffee"),a:contains("gruntfile.js")');

    // Helper function to connect to node
    function connect() {
      var connectionPromise = nodeConnection.connect(true);
      connectionPromise.fail(function () {
        console.error('[brackets-grunt-node] failed to connect to node');
      });
      return connectionPromise;
    }

    // Helper function that loads our domain into the node server
    function loadGruntDomain() {
      var path = ExtensionUtils.getModulePath(module, 'node/GruntDomain');
      var loadPromise = nodeConnection.loadDomains([path], true);
      loadPromise.fail(function () {
        console.log('[brackets-grunt-node] failed to load domain');
      });
      return loadPromise;
    }

    // Helper function that runs the grunt.startDevtools command and
    // logs the result to the console
    function startDevtools() {
      // get the path to the project
      var fullProjectPath = ProjectManager.getProjectRoot().fullPath,
      // get the name of the Gruntfile
        gruntfileName = $.trim(gFile.text()),
      // start devtools via a node connection
        memoryPromise = nodeConnection.domains.grunt.startDevtools(fullProjectPath, gruntfileName);

      memoryPromise.fail(function (err) {
        console.error('[brackets-grunt-node] failed to run grunt.startDevtools', err);
      });
      memoryPromise.done(function (data) {
        // get the grunt button
        var gruntBtn = $('.grunt-devtools-file').parent().find('.grunt-devtools-run');
        // enable the button
        gruntBtn.prop('disabled', false);

        if (data.pid) {
          gruntRunning = true;
          _setPanelVisibility(true);
        } else {
          gruntRunning = false;
        }
      });
      return memoryPromise;
    }


    function _runDevtools() {
      var gruntBtn = $('.grunt-devtools-file').parent().find('.grunt-devtools-run');
      if (gruntRunning) {
        nodeConnection.domains.grunt.stopDevtools();
        gruntBtn.removeClass('running');
        gruntRunning = false;
      } else {
        devtools.chain(connect, loadGruntDomain, startDevtools);
        gruntBtn.addClass('running');
        gruntRunning = true;
      }
    }

    // if found a grunt file
    if (gFile.length > 0) {
      // new native connection

      gFile
        .addClass('grunt-devtools-file')
        .parent().on('click', '.grunt-devtools-run', function () {
          _runDevtools();
        });

      $('<button class="grunt-devtools-run"></button>').appendTo(gFile.first().parent());
      _runDevtools();
    }
  }

  function _setPanelControl(sizeMode) {
    if ($panelControl) {
      if (sizeMode === 'min') {
        $panelControl.text('^');
        $extPanel.height(26);
      } else {
        $panelControl.text('');
        $extPanel.height(400);
      }
    }

  }

  function _toggleVisibility() {
    visible = !visible;
    _setPanelVisibility(visible);
  }

  // Insert CSS for this extension
  ExtensionUtils.loadStyleSheet(module, 'css/grunt-devtools-brackets-ui.css');

  // Add toolbar icon
  $icon = $('<a>')
    .attr({
      id: 'grunt-preview-icon',
      href: '#'
    })
    .css({
      display: 'none'
    })
    .click(_toggleVisibility)
    .insertAfter($('#toolbar-go-live'));

  // currentDocumentChange is *not* called for the initial document. Use
  // appReady() to set initial state.
  AppInit.appReady(function () {
    _enableGruntFromProject();

    // switching projects, try to enable grunt-devtools for the next project.
    $(ProjectManager).on('beforeProjectClose', function () {
      if (gruntRunning) {
        nodeConnection.domains.grunt.stopDevtools();
        gruntRunning = false;
      }
      _setPanelControl('min');
      _enableGruntFromProject();
    });

    // new project open, shut down current grunt
    $(ProjectManager).on('projectOpen', function () {
      _enableGruntFromProject();
    });

    // closing brackets, make sure to close grunt-devtools
    $(ProjectManager).on('beforeAppClose', function () {
      if (gruntRunning) {
        nodeConnection.domains.grunt.stopDevtools();
        gruntRunning = false;
      }
    });
  });

  // iframe resize
  $(window).on('resize', _resizeIframe);
});
