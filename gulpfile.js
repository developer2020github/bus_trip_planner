//========================================================
//https://csstricks.com/gulpforbeginners/
//https://www.npmjs.com/package/gulp-jshint
//https://www.npmjs.com/package/gulp-csslint
//https://www.npmjs.com/package/gulp-html5-lint
//https://www.npmjs.com/package/gulp-jshint-file-reporter
//========================================================

var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var htmlmin = require('gulp-htmlmin');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var html5Lint = require('gulp-html5-lint');
var csslint = require('gulp-csslint');
var sloc = require('gulp-sloc');


gulp.task('sloc', function(){
  gulp.src(['src/js/*.js']).pipe(sloc());
});

gulp.task('lint_css', function() {
  gulp.src('src/css/*.css')
    .pipe(csslint())
    .pipe(csslint.reporter());
});

gulp.task('lint_html5', function() {
    return gulp.src('./src/*.html')
        .pipe(html5Lint());
});

gulp.task('lint_js_console', function() {
  return gulp.src('src/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('lint_js_log', function() {
  return gulp.src('src/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('gulp-jshint-file-reporter', {
      filename: __dirname + '/jshint-output.log'
    }));
});

gulp.task('prefix_css', function () {
	return gulp.src('src/css_source/*.css')
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulp.dest('src/css'));
});

gulp.task('watch', function(){
gulp.watch('src/css_source/*.css', ['prefix_css']);
})


gulp.task('useref', function(){
return gulp.src('src/*.html')
.pipe(useref())
// Minifies only if it's a JavaScript file
.pipe(gulpIf('*.js', uglify()))
// Minifies only if it's a CSS file
.pipe(gulpIf('*.css', cssnano()))
.pipe(gulp.dest('dist'))
});

//gulp.task('images', function(){
//return gulp.src('src/image/**/*.+(png|jpg|gif|svg)')
//.pipe(imagemin())
//.pipe(gulp.dest('dist/image'))
//});

gulp.task('images', function(){
return gulp.src('src/image/**/*.+(png|jpg|jpeg|gif|svg)')
// Caching images that ran through imagemin
.pipe(cache(imagemin({interlaced: true
})))
.pipe(gulp.dest('dist/image'))
});

//need to copy fonts 
gulp.task('fonts', function() {
return gulp.src('src/bower_components/bootstrap/dist/fonts/*.*')
.pipe(gulp.dest('dist/fonts'))
})

//minify HTML - since HTML gets updated by useref, minify the one in dist 
gulp.task('minify_html', function() {
  return gulp.src('dist/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'))
});

//clean up dist if needed
gulp.task('clean:dist', function() {
return del.sync('dist');
})

//clear cach if needed
gulp.task('cache:clear', function (callback) {
return cache.clearAll(callback)
})

gulp.task('build', function (callback) {
runSequence('prefix_css','clean:dist',
['useref', 'images', 'fonts'],'minify_html',
callback
)
})