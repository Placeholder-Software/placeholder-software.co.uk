module.exports = ($, gulp, config) => () => 
    gulp
        .src(config.js.src)
        .pipe($.plumber())
        //.pipe($.babel({presets: ['@babel/env']}))
        .pipe(gulp.dest('.tmp/scripts'));