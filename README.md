grunt-devtools 0.2.1
==============
![](http://v14d.com/u/grunt-devtools-main.png)

__Grunt Task Runner Extension for Chrome Developer Tools and Adobe Brackets__


## Quick Setup (Google Chrome)

* Download the [Grunt Devtools extension for Chrome Developer Tools](https://chrome.google.com/webstore/detail/grunt-devtools/fbiodiodggnlakggeeckkjccjhhjndnb?hl=en)
 from the Chrome Web Store.
* Global Install (Want a local plugin install? See [local setup](#local-setup)).
  * __`npm install -g grunt-devtools`__
  * run __`grunt-devtools`__ in a directory with a Gruntfile!
* open Chrome Dev tools, find the __Grunt tab__. Your grunt tasks should now be accessible from Chrome.


## Screenshots

![](http://v14d.com/i/513393cbb7e8b.jpg)
![](http://v14d.com/i/5133941ceb6b4.jpg)

## Local Setup

* `npm install grunt-devtools` in your grunt project
* Add `grunt.loadNpmTasks('grunt-devtools');` to your `Gruntfile`
* run `grunt devtools`
* open Chrome Dev tools, find the Grunt tab. Your grunt tasks should now be accessible from Chrome.


## Updating from an older version

* Chrome extension updates automatically or you can force an update under `chrome://extensions` ![](http://v14d.com/i/513cbb8a20af4.png)
* Grunt plugin updates using `npm install grunt-devtools@latest`
* The versions of the plugin and extension should always match (`0.2.1` in Chrome is `0.2.1` on npm)


## Issues

If you experience issues, perform an [update first](https://github.com/vladikoff/grunt-devtools#updating-from-an-older-version).
If issues still occur - [report it](https://github.com/vladikoff/grunt-devtools/issues) or ask for help in the  `#grunt` irc channel on Freenode

See the [CHANGELOG](CHANGELOG) for release history .
See the [contributing guide](CONTRIBUTING.md) for local development instructions.

