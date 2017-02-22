"use strict";

const gulp = require('gulp'),
    gulpif = require('gulp-if'),
    conf = require('./gulp.conf.js'),
    clean = require('gulp-clean'),
    useref = require('gulp-useref'),
    cleanCSS = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    ts = require('gulp-typescript'),
    tsConfig = require(conf.paths.tsConfig),
    inlineNg2Template = require('gulp-inline-ng2-template'),
    gulpSequence = require('gulp-sequence'),
    browserSync = require("browser-sync"),
    rsync = require("gulp-rsync");

const IS_PRODUCTION = true;  // use yor ENV variable here instead of true/false

gulp.task('clean', function () {
  return gulp.src(conf.paths.dist)
      .pipe(clean({
        force: true
      }));
});

gulp.task('index', function () {
  return gulp.src(conf.paths.index)
      .pipe(gulpif(IS_PRODUCTION, useref()))
      .pipe(gulpif(IS_PRODUCTION && '*.js', uglify()))
      .pipe(gulpif(IS_PRODUCTION && '*.js', sourcemaps.write()))
      .pipe(gulp.dest(conf.paths.dist))
      .pipe(browserSync.stream());
});

gulp.task('compile', function () {
  return gulp
      .src(conf.paths.ts)
      .pipe(sourcemaps.init())
      .pipe(inlineNg2Template(conf.inlineTemplate))
      .pipe(ts(tsConfig.compilerOptions))
      //FIXME: currently prevent debugging .pipe(uglify())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(conf.paths.dist))
      .pipe(browserSync.stream());
});

gulp.task('static', function () {
  return gulp.src(conf.paths.staticFiles)
      .pipe(gulpif(IS_PRODUCTION && '*.js', uglify()))
      .pipe(gulpif(IS_PRODUCTION && '*.css', cleanCSS()))
      .pipe(gulp.dest(conf.paths.dist))
      .pipe(browserSync.stream());
});

gulp.task('copy:assets', function () {
  return gulp.src(conf.paths.assets)
      .pipe(gulp.dest(conf.paths.dist + '/assets'));
});

gulp.task('copy:node_modules', function () {
  return gulp.src(conf.paths.node_modules, {base: './node_modules/'})
      .pipe(gulp.dest(conf.paths.dist + '/node_modules'));
});

gulp.task('copy:bower_components', function () {
  return gulp.src(conf.paths.bower_components, {base: './bower_components'})
      .pipe(gulp.dest(conf.paths.dist + '/bower_components'));
});

gulp.task('watch', function () {
  gulp.watch(conf.paths.index, ['index']);
  gulp.watch(conf.paths.ts, ['compile']);
  gulp.watch(conf.paths.cmptRsrc, ['compile']);
  gulp.watch(conf.paths.staticFiles, ['index']);
  gulp.watch(conf.paths.assets, ['copy:assets']);
});

gulp.task('dependencies', gulp.series(['copy:node_modules', 'copy:bower_components']));

gulp.task('build', gulp.series(['index', 'compile', 'static', 'copy:assets']));

gulp.task('rsync', function() {
  return gulp.src(conf.paths.dist)
    .pipe(rsync({
      root: conf.paths.dist,
      username: 'root',
      hostname: conf.deploy.target_ip,
      port: conf.deploy.port,
      archive: true,
      recursive: true,
      compress: true,
      progress: false,
      incremental: true,
      destination: conf.deploy.dir
    }));
});

gulp.task('deploy', gulp.series(['build', 'dependencies', 'rsync']));

gulp.task('deployts', gulp.series(['build', 'rsync']));

gulp.task('serve', function () {
  browserSync.init({
    open: true,
    browser: 'default',
    server: {
      baseDir: "./build",
      routes: {}
    },
    port: 8000
  });
});

gulp.task('default', gulpSequence('clean','dependencies', 'build', 'serve', 'watch'));