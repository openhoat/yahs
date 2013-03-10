var fs = require('fs')
  , path = require('path');

module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadTasks('tasks');
  grunt.registerTask('default', ['clean', 'build']);
  var gruntConfig = {
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      default: 'dist'
    },
    build: {
      /*
      srcFile: 'demo/nodejs-presentation/index.html',
      distFile: 'dist/nodejs-presentation/index.html'
       */
      srcFile: ['demo/presentation/index.html', 'demo/nodejs-presentation/index.html'],
      distFile: ['dist/presentation/index.html', 'dist/nodejs-presentation/index.html']
    }
  };
  grunt.initConfig(gruntConfig);
};
