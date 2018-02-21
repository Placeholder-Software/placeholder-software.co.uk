module.exports = ($, gulp, config) => () => {
    return gulp.src([
        'app/**/*.unitypackage'
    ]).pipe(gulp.dest('dist'));
}