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

![](http://v14d.com/i/512d9cc72f55d.jpg)

![](http://v14d.com/i/512d9d063f584.jpg)

![](http://v14d.com/i/512d79e6a08e9.png)

![](http://v14d.com/i/512db0deea5fd.jpg)

### Current Limitations

* The extension will work for up to 5 instances of `grunt devtools` at a time
(this means if you like to work on more than 5 projects at a time, you will need to turn off the task)

* Background tasks are work in progress.
