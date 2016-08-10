const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync');
const del = require('del');
const wiredep = require('wiredep').stream;
const template = require('gulp-template');
const nunjucksRender = require('gulp-nunjucks-render');
const flatmap = require('gulp-flatmap');
const path = require('path');
const argv = require('yargs').argv;
const data = require('gulp-data');
const fs = require('fs');
const marked = require('gulp-marked');
const nunjucksMarkdown = require('nunjucks-markdown');
const frontMatter = require('front-matter');
const debug = require('gulp-debug');
const wrap = require('gulp-wrap');
const through = require('through2');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', () => {
  return gulp.src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true}));
});

function lint(files, options) {
  return gulp.src(files)
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint(options))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint('app/scripts/**/*.js', {
    fix: true
  })
    .pipe(gulp.dest('app/scripts'));
});

gulp.task('lint:test', () => {
  return lint('test/spec/**/*.js', {
    fix: true,
    env: {
      mocha: true
    }
  })
    .pipe(gulp.dest('test/spec/**/*.js'));
});

gulp.task('html', ['styles', 'scripts'], () => {

  var base_path = argv.base_path || "";
  console.log("Base path is: '" + base_path + "'");

  var data = {
    base_path: base_path,
    now: new Date().toISOString(),
    site: sitepages(),
    all_pages: flatten(sitepages())
  }

  return gulp.src('app/pages/**/*.+(html|nunjucks)')
    .pipe(flatmap((stream, file) => {
      return stream
        .pipe($.if('*.nunjucks', nunjucksRender({
          path: ['app'],
          data: data
        })))
        .pipe($.useref({
          searchPath: ['.tmp', '.'],
        }))
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: false})))
        .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
        .pipe(gulp.dest('.tmp'))
        .pipe(gulp.dest('dist'));
    }))
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
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
    'app/*.*',
    'app/*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('reload', () => {
    reload();
});

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:test', ['scripts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/scripts': '.tmp/scripts',
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

gulp.task('wiredep', () => {
  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      exclude: ['bootstrap-sass'],
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});

function flatten(hierarchy, pages) {
  if (!pages) {
    pages = [];
  }

  for (var i in hierarchy.pages) {
    var value = hierarchy.pages[i];
    if (value.file) {
      pages.push(value);
    }
  }

  for (var key in hierarchy) {
    if (key === "pages" || !hierarchy.hasOwnProperty(key)) {
      continue;
    }

    var value = hierarchy[key];
    if (value.directory) {
      pages.push(value);
      flatten(value.children, pages)
    }
  }

  return pages;
}

function sitepages() {

    function getFilesRecursive(searchRoot, urlRoot, templateRoot) {
      var fileContents = fs.readdirSync(searchRoot);

      var files = { pages: [] };
      fileContents.forEach(function (fileName) {
          var filePath = searchRoot + '/' + fileName;
          var stats = fs.lstatSync(filePath);

          if (stats.isDirectory()) {
            files[fileName] = {
              file: false,
              directory: true,
              name: fileName,
              url: (urlRoot + '/' + fileName),
              children: getFilesRecursive(searchRoot + '/' + fileName, urlRoot + '/' + fileName, templateRoot + "/" + fileName)
            };
          } else {
            var name = path.parse(fileName).name;
            var ext = path.extname(fileName)
            if (name != "index" && (ext == ".html" || ext == ".nunjucks" )) {

              //Attempt to parse a date out of the title
              var date = new Date();
              if (name.includes('-')) {
                var parts = name.split('-').slice(0, 3).map(function(a) { return parseInt(a); });
                if (parts.length == 3 && parts[0] && parts[1] && parts[2]) {
                  date = new Date(parts[0], parts[1] - 1, parts[2])
                }
              }

              files.pages.push({
                file: true,
                directory: false,
                name: name,
                path: templateRoot + '/' + fileName,
                timestamp: date.getTime(),
                date: {
                  day: date.getDate(),
                  month: date.toLocaleString("en-gb", { month: "long" }),
                  year: date.getFullYear(),
                  iso: date.toISOString()
                },
                url: (urlRoot + '/' + fileName).replace("nunjucks", "html").replace("md", "html").replace("index.html", "")
              });
            }
          }
      });

      return files;
    }

    return getFilesRecursive('./app/pages', '', 'pages')
}
