/*global define, brackets, $, window, PathUtils */

define(function (require, exports, module) {
  "use strict";

  require('js/vendor/lodash.min');

  var devtools = require('js/lib/brackets-devtools');

  // Brackets modules
  var AppInit = brackets.getModule("utils/AppInit"),
    DocumentManager = brackets.getModule("document/DocumentManager"),
    EditorManager = brackets.getModule("editor/EditorManager"),
    ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
    Resizer = brackets.getModule("utils/Resizer"),
    NodeConnection = brackets.getModule("utils/NodeConnection"),
    ProjectManager = brackets.getModule("project/ProjectManager");

  // Local modules
  var frameHTML = require("text!frame.html"),
    panelHTML = require("text!panel.html");
  // jQuery objects
  var $icon,
    $iframe,
    $panel;

  // Other vars
  var currentDoc,
    visible = false,
    realVisibility = false,
    gruntRunning = false;

  // Create a new node connection. Requires the following extension:
  // https://github.com/joelrbrandt/brackets-node-client
  var nodeConnection;



  function _loadDoc(doc, preserveScrollPos) {
    if (doc && visible && $iframe) {
      var panelTpl = _.template(panelHTML);

      var panelData = {
        css: require.toUrl('./css/devtools.css'),
        icon128: require.toUrl('./img/icon128.png'),
        cssSkin: require.toUrl('./css/devtools-brackets.css'),
        devtoolsSrc: require.toUrl('./js/devtools.js')
      };

      $iframe.attr("srcdoc", panelTpl(panelData));
    }
  }

  function _documentChange(e) {
    _loadDoc(e.target, true);
  }

  function _resizeIframe() {
    if (visible && $iframe) {
      var iframeWidth = $panel.innerWidth();
      $iframe.attr("width", iframeWidth + "px");
    }
  }

  function _setPanelVisibility(isVisible) {
    if (isVisible === realVisibility) {
      return;
    }

    realVisibility = isVisible;
    if (isVisible) {
      if (!$panel) {
        $panel = $(frameHTML);
        $iframe = $panel.find('#panel-grunt-devtools-frame');

        $panel.insertBefore('#status-bar');
        // make panel resizeable
        Resizer.makeResizable($panel.get(0), 'vert', 'top', 26, false);
        $panel.on('panelResizeUpdate', function (e, newSize) {
          $iframe.attr('height', newSize);
        });
        $iframe.attr('height', $panel.height());
        window.setTimeout(_resizeIframe);
      }
      _loadDoc(DocumentManager.getCurrentDocument());
      $icon.toggleClass('active');
      $panel.show();
    } else {
      $icon.toggleClass('active');
      $panel.hide();
    }
    EditorManager.resizeEditor();
  }

  function _currentDocChangedHandler() {
    var doc = DocumentManager.getCurrentDocument(),
      ext = doc ? PathUtils.filenameExtension(doc.file.fullPath).toLowerCase() : '';

    if (currentDoc) {
      //$(currentDoc).off("change", _documentChange);
      currentDoc = null;
    }

    if (doc) {
      currentDoc = doc;
      //$(currentDoc).on("change", _documentChange);
      $icon.css({display: 'inline-block'});
      _setPanelVisibility(visible);
      _loadDoc(doc);
    } else {
      $icon.css({display: 'none'});
      _setPanelVisibility(false);
    }
  }

  function _enableGruntFromProject() {
    var $fileContainer = $('#project-files-container'),
      gFile = $fileContainer.find('a:contains("Gruntfile.coffee"),a:contains("Gruntfile.js")');


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
        var gruntBtn = $('.gruntFile').find('.runGrunt');
        // enable the button
        gruntBtn.prop('disabled', false);

        console.log('[brackets-grunt-node] Pid: %d', data.pid);

        if (data.pid) {
          gruntRunning = true;
          gruntBtn.addClass('running');
        } else {
          gruntBtn.removeClass('running');
          gruntRunning = false;
        }
      });
      return memoryPromise;
    }

    console.log(gFile);

    // if found a grunt file
    if (gFile.length > 0) {
      gFile
        .addClass('gruntFile')
        .append('<button class="runGrunt"></button>')
        .on('click', '.runGrunt', function () {
          // disable button
          $(this).prop('disabled', true);

          // new native connection
          nodeConnection = new NodeConnection();
          // call all the helper functions in order
          devtools.chain(connect, loadGruntDomain, startDevtools);
        });
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
    console.log('appReady');
    _enableGruntFromProject();

    _currentDocChangedHandler();

    $(ProjectManager).on('beforeProjectClose', function() {
      if (gruntRunning) {
        nodeConnection.domains.grunt.stopDevtools();
      }
      console.log('beforeProjectClose');
      _enableGruntFromProject();
    });

    $(ProjectManager).on('projectOpen', function() {
      console.log('projectOpen');
      _enableGruntFromProject();
    });

    $(ProjectManager).on('beforeAppClose', function() {
      if (gruntRunning) {
        nodeConnection.domains.grunt.stopDevtools();
      }
      console.log('oh deer');
    });

  });

  $(window).on('resize', _resizeIframe);
});
