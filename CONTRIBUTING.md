## Contribute

### Branch

Please file pull requests against the `dev` branch.

### Syntax

* Two space indents. Don't use tabs anywhere. Use `\t` if you need a tab character in a string.
* No trailing whitespace, except in markdown files where a linebreak must be forced.
* Don't go overboard with the whitespace.
* No more than [one assignment](http://benalman.com/news/2012/05/multiple-var-statements-javascript/) per `var` statement.
* Delimit strings with single-quotes `'`, not double-quotes `"`.
* Prefer `if` and `else` to ["clever"](http://programmers.stackexchange.com/a/25281) uses of `? :` conditional or `||`, `&&` logical operators.
* Comments are great. Just put them _before_ the line of code, _not_ at the _end_ of the line.
* **When in doubt, follow the conventions you see used in the source already.**

## Development Setup

* clone this project
* From project root:
  * `npm install`
  * Run `grunt` to build everything

### Using the grunt plugin without NPM

* Follow the development steps, make your changes, build the extensions
* In your other project:
  * Locally install the plugin using `npm install [folder]/grunt-plugin`
  * Add `grunt.loadNpmTasks('grunt-devtools');` to your `Gruntfile`
  * run `grunt devtools`

### Installing local Chrome Extension

Load unpacked extension from the `extension/build/build-chrome/grunt-devtools` folder.

### Installing local Brackets Extension

Get to the Brackets extension folder. On OS X it's `~/Library/Application Support/Brackets/extensions/user`.
Either copy the `grunt-devtools` folder from `extension/build/build-brackets/grunt-devtools` into the Brackets extension folder or
create a symlink via `ln -s ~/NodeProjects/grunt-devtools/extension/build/build-brackets/grunt-devtools grunt-devtools`

### Making changes

After you made some changes, you can run `grunt build` to build both extensions.
Use `grunt watch` to automatically watch for that.
Then to reload the extension


## Project TODO

* Test Windows
* support 'gruntfile.js' and 'gruntfile.coffee' lowercased.
* registerMultiTask support
* send tasks into background right away

