const gulp = require('gulp');
require('gulp-stats')(gulp);

const gulpLoadPlugins = require('gulp-load-plugins');
const del = require('del');
const nunjucksRender = require('gulp-nunjucks-render');
const flatmap = require('gulp-flatmap');
const path = require('path');
const argv = require('yargs').argv;
const fs = require('fs');
const debug = require('gulp-debug');
const cache = require('gulp-cached');

const $ = gulpLoadPlugins();

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
});

gulp.task('scripts', () => {
  return gulp
    .src('app/scripts/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/scripts'))
});

gulp.task('html', ['styles', 'scripts'], () => {

  var base_path = argv.base_path || "";
  console.log("Base path is: '" + base_path + "'");

  var pages = sitepages();
  var data = {
    base_path: base_path,
    now: new Date().toISOString(),
    site: pages,
    all_pages: flatten(pages)
  }

  return gulp.src('app/pages/**/*.+(html|nunjucks)')
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
            var ext = path.extname(fileName);
            var dir = path.basename(path.dirname(filePath));
            if (name != "index" && (ext == ".html" || ext == ".nunjucks" )) {

              //Attempt to parse a date out of the title
              var date = new Date();
              if (name.includes('-')) {
                var parts = name.split('-').slice(0, 3).map(function(a) { return parseInt(a); });
                if (parts.length == 3 && parts[0] && parts[1] && parts[2]) {
                  date = new Date(parts[0], parts[1] - 1, parts[2])
                }
              }
              
              //Parse version out of title
              var version = null;
              if (dir == "releases") {
                var parts = name.split('.').slice(0, 3).map(a => parseInt(a));
                if (parts.length == 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
                  version = {
                    major: parts[0],
                    minor: parts[1],
                    patch: parts[2],
                    name: parts[0] + "." + parts[1] + "." + parts[2]
                  };
                }
              }

              var d = {
                file: true,
                directory: false,
                name: name,
                path: templateRoot + '/' + fileName,
                timestamp: date.getTime(),
                version: version,
                date: {
                  day: date.getDate(),
                  month: date.toLocaleString("en-gb", { month: "long" }),
                  year: date.getFullYear(),
                  iso: date.toISOString()
                },
                url: (urlRoot + '/' + fileName).replace("nunjucks", "html").replace("md", "html").replace("index.html", "")
              };
              
              if (version !== null) {
                d.version_major = version.major;
                d.version_minor = version.minor;
                d.version_patch = version.patch;
                d.has_version = true;
              } else {
                d.has_version = false;
              }
              
              files.pages.push(d);
            }
          }
      });
      
      files.pages.sort(function(a,b) {
        
        //Sort by version
        if (a.has_version && b.has_version) {
          var maj = a.version_major - b.version_major;
          if (maj !== 0) { return maj; }
          
          var min = a.version_minor - b.version_minor;
          if (min !== 0) { return min; }
          
          return a.version_patch - b.version_patch;
        }
        
        //No version sorting, so sort by date
        return a.timestamp - b.timestamp;
        
      });

      return files;
    }

    return getFilesRecursive('./app/pages', '', 'pages')
}
