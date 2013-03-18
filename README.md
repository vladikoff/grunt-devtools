grunt-devtools
==============

Grunt Task Runner Extension for Chrome Developer Tools and Adobe Brackets


## Quick Setup (Google Chrome)

* Download the [Grunt Devtools extension for Chrome Developer Tools](https://chrome.google.com/webstore/detail/grunt-devtools/fbiodiodggnlakggeeckkjccjhhjndnb?hl=en)
 from the Chrome Web Store.
* `npm install grunt-devtools` in your grunt project
* Add `grunt.loadNpmTasks('grunt-devtools');` to your `Gruntfile`
* run `grunt devtools`
* open Chrome Dev tools, find the Grunt tab. Your grunt tasks should now be accessible from Chrome.


## Quick Setup (Adobe Brackets)

* Download [brackets-grunt-devtools.zip](^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^TODO: URL_HERE^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^)
* Copy `grunt-devtools` directory into the user extension folder, which can be opened by selecting `Help > Show Extensions Folder` in Brackets.
Brackets needs to be restarted after installing a new extension.
* `npm install grunt-devtools` in your grunt project
* Add `grunt.loadNpmTasks('grunt-devtools');` to your `Gruntfile`
* run `grunt devtools`
* open Brackets, open any project folder, click on the Grunt icon in the top right corner.


## Updating from an older version

* Chrome extension updates automatically or you can force an update under `chrome://extensions` ![](http://v14d.com/i/513cbb8a20af4.png)
* Grunt plugin updates using `npm install grunt-devtools` ( auto-update might be coming soon )
* The versions of the plugin and extension should always match ( `0.1.0.1` in Chrome is `0.1.0-1` on npm )
![](http://v14d.com/i/5134559bdb23a.jpg)

## Preview Screenshots

![](http://v14d.com/i/513394803d3d9.jpg)
![](http://v14d.com/i/513393cbb7e8b.jpg)
![](http://v14d.com/i/5133941ceb6b4.jpg)

## Development Setup

See the [contributing guide](contributing.md) for local development instructions.

## Issues

If you experience issues, perform an [update first](https://github.com/vladikoff/grunt-devtools#updating-from-an-older-version).
If issues still occur - [report it](https://github.com/vladikoff/grunt-devtools/issues) or ask for help in the  `#grunt` irc channel on `freenode`

## Current Limitations

* The extension will work for up to 5 instances of `grunt devtools` at a time
(this means if you like to work on more than 5 projects at a time, you will need to turn off the task)

* Background tasks disappear when done

## TODO

* Test Windows
* support 'gruntfile.js' and 'gruntfile.coffee' lowercased.
* registerMultiTask support
* send tasks into background right away

## Release History

* 0.1.1 -
* 0.1.0.7 - Fixes, added update warnings.
* 0.1.0.6 - Various fixes.
* 0.1.0.5 - Updating UI, Adding a way to set flags `--force` and `--verbose`, output fixes, background task updates.
* 0.1.0.4 - Adding Background Task support. You can now press `(B)` to send
the task into background and continue running other tasks.
* 0.1.0-alpha3 - Adds `Gruntfile.coffee` support
