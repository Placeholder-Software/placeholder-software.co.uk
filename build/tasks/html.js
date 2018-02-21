const nunjucksRender = require('gulp-nunjucks-render');
const cache = require('gulp-cached');
const flatmap = require('gulp-flatmap');
const site_data = require('./../site_data.js');

module.exports = ($, gulp, config) => () => {

    var data = site_data.site_data();

    return gulp.src(config.html.src)
        .pipe(nunjucksRender({
            path: 'app',
            data: data
        })).pipe($.useref({
            searchPath: ['.tmp', '.'],
        }))
        .pipe(cache('html_file_preprocessing'))
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: false})))
        .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
        .pipe(flatmap((stream, file) => { console.log(file.path); return stream; }))
        .pipe(gulp.dest('.tmp'))
        .pipe(gulp.dest('dist'));
};