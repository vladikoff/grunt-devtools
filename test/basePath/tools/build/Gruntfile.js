module.exports = function (grunt) {
 
  grunt.file.setBase('../../');
  grunt.initConfig({
    watch: {
       files: ['tools/**'],
       tasks: ['run']
    }
  });

  grunt.registerTask('run', function(){
    console.log('Running!');
  });

  grunt.loadNpmTasks('grunt-devtools');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['run']);

};
