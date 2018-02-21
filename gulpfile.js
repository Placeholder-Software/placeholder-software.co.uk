const gulp = require('gulp');
require('gulp-stats')(gulp);

const del = require('del');
const $ = require('gulp-load-plugins')();

const config = require('./build/config.js');

gulp.task('images', require("./build/tasks/images.js")($, gulp, config));
gulp.task('fonts', require("./build/tasks/fonts.js")($, gulp, config));
gulp.task('copy', require("./build/tasks/copy.js")($, gulp, config));
gulp.task('styles', require("./build/tasks/styles.js")($, gulp, config));
gulp.task('scripts', require("./build/tasks/scripts.js")($, gulp, config));
gulp.task('html', ['styles', 'scripts'], require("./build/tasks/html.js")($, gulp, config));

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));
gulp.task('build', ['html', 'images', 'fonts', 'copy'], () => gulp.src('dist/**/*').pipe($.size({ title: 'build', gzip: true })));
gulp.task('default', ['clean'], () => gulp.start('build'));
