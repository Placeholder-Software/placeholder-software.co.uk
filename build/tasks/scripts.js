module.exports = ($, gulp, config) => () => 
    gulp
        .src(config.js.src)
        .pipe($.plumber())
        .pipe($.babel())
        .pipe(gulp.dest('.tmp/scripts'));