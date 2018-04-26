module.exports = ($, gulp, config) => () => {
    return gulp.src([
        'app/**/*.unitypackage',
        'app/**/*.zip',
    ]).pipe(gulp.dest('dist'));
}