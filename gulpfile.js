var gulp = require('gulp');
var uglify = require('gulp-uglify');
var htmlreplace = require('gulp-html-replace');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var streamify = require('gulp-streamify');

var path = {
    HTML: 'src/index.html',
    MINIFIED_OUT: 'build.min.js',
    OUT: 'build.js',
    DEST: 'dist',
    DEST_BUILD: 'dist/build',
    DEST_SRC: 'dist/src',
    ENTRY_POINT: './src/js/app.js'
};

/* ---------- for developing ---------- */
gulp.task('replaceHTMLsrc', function() {
    gulp.src(path.HTML)
        .pipe(htmlreplace({
            'js': 'src/' + path.OUT
        }))
        .pipe(gulp.dest(path.DEST));
});

gulp.task('watch', ['replaceHTMLsrc'], function() {
    gulp.watch(path.HTML, ['replaceHTMLsrc']);

    var watcher = watchify(browserify({
        entries: [path.ENTRY_POINT],
        transform: [["babelify", { "presets": ["es2015", "react"] }]],
        debug: true,
        cache: {}, packageCache: {}, fullPaths: true
    }));

    return watcher.on('update', function() {
        watcher.bundle()
            .pipe(source(path.OUT))
            .pipe(gulp.dest(path.DEST_SRC));
        console.log('Updated');
    }).bundle().on('error', function(err) {
        console.log(err.message);
        this.end();
    }).pipe(source(path.OUT))
      .pipe(gulp.dest(path.DEST_SRC));
});

gulp.task('default', ['watch']);

/* ---------- for production ---------- */
gulp.task('build', function() {
    browserify({
        entries: [path.ENTRY_POINT],
        transform: [reactify]
    }).bundle()
      .pipe(source(path.MINIFIED_OUT))
      .pipe(streamify(uglify()))
      .pipe(gulp.dest(path.DEST_BUILD));
});

gulp.task('replaceHTML', function(){
    gulp.src(path.HTML)
        .pipe(htmlreplace({
            'js': 'build/' + path.MINIFIED_OUT
        }))
        .pipe(gulp.dest(path.DEST));
});

gulp.task('production', ['replaceHTML', 'build']);