const gulp = require('gulp');
require('gulp-stats')(gulp);

const del = require('del');
const $ = require('gulp-load-plugins')();

const config = require('./build/config.js');

//Create the basic tasks
gulp.task('images', require("./build/tasks/images.js")($, gulp, config));
gulp.task('fonts', require("./build/tasks/fonts.js")($, gulp, config));
gulp.task('copy', require("./build/tasks/copy.js")($, gulp, config));
gulp.task('styles', require("./build/tasks/styles.js")($, gulp, config));
gulp.task('scripts', require("./build/tasks/scripts.js")($, gulp, config));

//Create a pre-html task which runs the HTML task depenedencies in parallel. Then depend on that in the HTML task
gulp.task('pre-html', (cb) => $.multiProcess(['styles', 'scripts'], cb, true));
gulp.task('html', ['pre-html'], require("./build/tasks/html.js")($, gulp, config));

//Default action runs the build after cleaning the output directory. Once completed print out summary information about the build result.
gulp.task('default', ['clean', 'build'], () => gulp.src('dist/**/*').pipe($.size({ title: 'build', gzip: true })));

//Clean deletes the output and .tmp directories
gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

//Run all the work of the build (each task in parallel)
gulp.task('build', (cb) => $.multiProcess(['html', 'images', 'fonts', 'copy'], cb, true));