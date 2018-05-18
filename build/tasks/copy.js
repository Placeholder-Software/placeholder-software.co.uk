module.exports = ($, gulp, config) => () => gulp.src(config.copy.src).pipe(gulp.dest('dist'));
