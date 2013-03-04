grunt-devtools (preview)
==============

grunt-devtools

## Quick Setup

* Download the [Grunt Devtools](https://chrome.google.com/webstore/detail/grunt-devtools/fbiodiodggnlakggeeckkjccjhhjndnb?hl=en)
add-on for Chrome Dev Tools from the Chrome Web Store.

* `npm install grunt-devtools` in your grunt project

* Add `grunt.loadNpmTasks('grunt-devtools');` to your `Gruntfile`

* run `grunt devtools`

* open Chrome Dev tools, find the Grunt tab. Your grunt tasks should now be accessible from Chrome.



## Dev Setup

### Chrome Extension

Load unpacked extension from the `extension` folder.

### Grunt Plugin Installation

Locally install the plugin using `npm install [folder]/grunt-plugin`

Add `grunt.loadNpmTasks('grunt-devtools');` to your `Gruntfile`

Run `grunt devtools` to get things rolling!

### Preview Screenshots

![](http://v14d.com/i/513394803d3d9.jpg)
![](http://v14d.com/i/513393cbb7e8b.jpg)
![](http://v14d.com/i/5133941ceb6b4.jpg)

### Issues

If you experience issues, make sure that the version of the Chrome extension matches the
version of `grunt devtools`.

The Chrome extension is auto-updated. However the npm module has to be manually updated.
![](http://v14d.com/i/5134559bdb23a.jpg)

### Current Limitations

* The extension will work for up to 5 instances of `grunt devtools` at a time
(this means if you like to work on more than 5 projects at a time, you will need to turn off the task)

* Background tasks disappear when done

## TODO

* Test Windows and Linux
* registerMultiTask support

### Release History

* 0.1.0.6 - Various fixes.
* 0.1.0.5 - Updating UI, Adding a way to set flags `--force` and `--verbose`, output fixes, background task updates.
* 0.1.0.4 - Adding Background Task support. You can now press `(B)` to send
the task into background and continue running other tasks.
* 0.1.0-alpha3 - Adds `Gruntfile.coffee` support

