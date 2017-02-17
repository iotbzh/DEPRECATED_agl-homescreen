"use strict";

module.exports = {
  paths: {
    index: ['./src/index.html'],
    ts: ['./src/**/*.ts', './typings/**/*.ts'],
    cmptRsrc: ['./src/app/**/*.{html,css}'],
    tsConfig: './tsconfig.json',
    assets: ['./src/assets/**'],
    staticFiles: [
      './src/global.css',
      './src/systemjs.config.js'
    ],
    bower_components: [
      './bower_components/foundation-sites/dist/**/*',
      './bower_components/components-font-awesome/{fonts,css}/**/*'
    ],
    node_modules: [
      './node_modules/@angular/**/*',
      './node_modules/rxjs/**/*',
      './node_modules/ng2-translate/bundles/**/*'
    ],

    dist: './build'
  },
  deploy: {
    target_ip: '127.0.0.1',
    port: '4444',
    dir: 'agl-homescreen'
  },
  inlineTemplate: {
    base: '/src',
    target: 'es6',
    indent: 0,
    useRelativePaths: true,
    removeLineBreaks: false,
    templateExtension: '.html',
    templateFunction: false,
    // templateProcessor: function (path, ext, file, callback) {
    //   console.dir(arguments);
    // },
    // styleProcessor: function (path, ext, file, callback) {
    //
    // },
    // customFilePath: function (ext, file) {
    // },
    supportNonExistentFiles: false
  }
};