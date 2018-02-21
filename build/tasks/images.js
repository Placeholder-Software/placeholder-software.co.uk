module.exports = ($, gulp, config) => () => {
    return gulp.src(config.images.src)
        .pipe($.cache($.imagemin(config.imagemin)))
        .pipe(gulp.dest('dist/images'));
};