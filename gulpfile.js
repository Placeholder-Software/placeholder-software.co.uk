const gulp = require('gulp');
require('gulp-stats')(gulp);

const gulpLoadPlugins = require('gulp-load-plugins');
const del = require('del');
const nunjucksRender = require('gulp-nunjucks-render');
const flatmap = require('gulp-flatmap');
const debug = require('gulp-debug');
const cache = require('gulp-cached');
const $ = gulpLoadPlugins();

const config = require('./build/config.js');
const site_data = require('./build/site_data.js');

gulp.task('styles', () => {
  return gulp.src(config.sass.src)
    .pipe($.plumber())
    .pipe($.sass({
      outputStyle: 'compressed',
      precision: 4,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe(gulp.dest('.tmp/styles'))
});

gulp.task('scripts', () => {
  return gulp
    .src(config.js.src)
    .pipe($.plumber())
    .pipe($.babel())
    .pipe(gulp.dest('.tmp/scripts'))
});

gulp.task('html', ['styles', 'scripts'], () => {

  var data = site_data.site_data();

  return gulp.src(config.html.src)
    .pipe(nunjucksRender({
      path: 'app',
      data: data
    }))
    .pipe($.useref({
      searchPath: ['.tmp', '.'],
    }))
    .pipe(cache('html_file_preprocessing'))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(flatmap((stream, file) => { console.log(file.path); return stream; }))
    .pipe(gulp.dest('.tmp'))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src(config.images.src)
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}],    // don't remove IDs from SVGs, they are often used as hooks for embedding and styling
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .concat('app/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/**/*.unitypackage'
  ]).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('build', ['html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
