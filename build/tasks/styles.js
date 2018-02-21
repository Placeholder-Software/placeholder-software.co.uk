module.exports = ($, gulp, config) => () =>
    gulp.src(config.sass.src)
        .pipe($.plumber())
        .pipe($.sass({
            outputStyle: 'compressed',
            precision: 4,
            includePaths: ['.']
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer(config.autoprefixer))
        .pipe(gulp.dest('.tmp/styles'));