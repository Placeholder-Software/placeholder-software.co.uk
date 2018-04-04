const nunjucksRender = require('gulp-nunjucks-render');
const cache = require('gulp-cached');
const flatmap = require('gulp-flatmap');
const site_data = require('./../site_data.js');
const nunjucksMarkdown = require('nunjucks-markdown');
const marked = require('marked');

const data = site_data.site_data();

marked.setOptions({
    baseUrl: data.base_path,
    gfm: true,
    tables: true,
    breaks: true,
})

function manageEnv(environment) {
    nunjucksMarkdown.register(environment, marked);
}

module.exports = ($, gulp, config) => () => {
    return gulp.src(config.html.src)
        .pipe(nunjucksRender({
            path: 'app',
            data: data,
            manageEnv: manageEnv
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