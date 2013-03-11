var path = require('path')
  , jsdom = require('jsdom')
  , async = require('async')
  , Step = require('step')
  , config
  , srcDir
  , baseDir = path.join(__dirname, '..');

function computeLessFiles(grunt, window, $, callback) {
  var less, lessLinks, cssContent;
  less = require('less');
  lessLinks = 'head > link[rel="stylesheet/less"]';
  cssContent = '';
  async.eachSeries($(lessLinks), function (item, next) {
    var lessUrl, lessContent, parser;
    lessUrl = item.href;
    lessContent = grunt.file.read(path.join(srcDir, lessUrl)).toString();
    parser = new (less.Parser)({
      paths: [path.join(srcDir, lessUrl, '..')],
      filename: path.basename(lessUrl)
    });
    try {
      parser.parse(lessContent, function (e, tree) {
        cssContent += tree.toCSS({ compress: true });
        next();
      });
    } catch (error) {
      next(error);
    }
  }, function (err) {
    var pattern, matches, i, match, url, ext, mimeType, inlineValue;
    if (err) throw err;
    pattern = /(url\('[^)]*'\))+/g;
    while (true) {
      matches = cssContent.match(pattern);
      if (matches === null)break;
      for (i = 0; i < matches.length; i++) {
        match = matches[i];
        url = match.substring(5);
        url = url.substring(0, url.length - 2);
        ext = path.extname(url).substring(1);
        mimeType = ext === 'woff' ? 'application/font-woff' : 'image/' + ext;
        inlineValue = grunt.file.read(path.join(srcDir, 'styles', url), {encoding: 'base64'});
        cssContent = cssContent.replace("url('" + url + "')", 'url(data:' + mimeType + ';base64,' + inlineValue + ')');
      }
    }
    $(lessLinks + ':last').after('<style>' + cssContent + '</style>');
    $(lessLinks).remove();
    callback();
  });
}

function computeScriptFiles(grunt, window, $) {
  var UglifyJS, scripts, head;
  UglifyJS = require('uglify-js');
  scripts = $('script[src]');
  head = window.document.getElementsByTagName('head')[0];
  $.each(scripts, function (index, item) {
    var code, result, script;
    code = grunt.file.read(path.join(srcDir, item.src)).toString();
    result = UglifyJS.minify(code, {fromString: true}).code;
    script = window.document.createElement('script');
    script.text = result;
    head.appendChild(script);
  });
  scripts.remove();
}

function computeImageFiles(grunt, window, $) {
  $.each($('img[src]'), function (index, item) {
    var content = grunt.file.read(path.join(srcDir, item.src), {encoding: 'base64'});
    item.src = 'data:image/png;base64,' + content;
  });
  $.each($('link[rel="shortcut icon"]'), function (index, item) {
    var content = grunt.file.read(path.join(srcDir, item.href), {encoding: 'base64'});
    item.href = 'data:image/png;base64,' + content;
  });

}

module.exports = function (grunt) {
  "use strict";
  grunt.registerTask('build', 'Minify and build the dist html5 page', function () {
    var done, srcFiles, distFiles, i, next;
    done = this.async();
    config = grunt.config('build');
    if (config.srcFile instanceof Array) {
      srcFiles = config.srcFile;
      distFiles = config.distFile;
    } else {
      srcFiles = [config.srcFile];
      distFiles = [config.distFile];
    }
    i = 0;
    next = function () {
      var srcFile, distFile;
      srcFile = srcFiles[i];
      distFile = distFiles[i];
      Step(
        function () {
          grunt.log.write('Reading html source file [' + srcFile + ']... ');
          var that = this;
          srcDir = path.join(baseDir, path.dirname(srcFile));
          jsdom.env({
            html: grunt.file.read(srcFile).toString(),
            scripts: [path.join(baseDir, 'lib', 'jquery.min.js')],
            done: function (errors, window) {
              var $ = window.$;
              window.console = console;
              $('.jsdom').remove();
              that(errors, window, $);
            }
          });
        }, function (err, window, $) {
          var that = this;
          if (err) throw err;
          grunt.log.ok();
          grunt.log.write('Compiling less files... ');
          computeLessFiles(grunt, window, $, function () {
            that(null, window, $);
          });
        }, function (err, window, $) {
          if (err) throw err;
          grunt.log.ok();
          grunt.log.write('Building javascript code from files... ');
          computeScriptFiles(grunt, window, $);
          this(null, window, $);
        }, function (err, window, $) {
          if (err) throw err;
          grunt.log.ok();
          grunt.log.write('Inlining images... ');
          computeImageFiles(grunt, window, $);
          this(null, window, $);
        }, function (err, window, $) {
          var htmlMinifier, content, result;
          if (err) throw err;
          grunt.log.ok();
          htmlMinifier = require('html-minifier');
          content = '<!DOCTYPE html>';
          content += window.document.innerHTML;
          grunt.log.write('Building html result [' + distFile + ']... ');
          result = htmlMinifier.minify(content, {
            removeComments: true,
            useShortDoctype: true,
            removeEmptyElements: false,
            collapseWhitespace: true,
            collapseBooleanAttributes: true
          });
          grunt.file.write(distFile, result);
          grunt.log.ok();
          if (i < srcFiles.length - 1) {
            i++;
            next();
          } else {
            done();
          }
        });
    };
    next();
  });
};