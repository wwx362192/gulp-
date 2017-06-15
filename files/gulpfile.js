'use strict';

var _require
try {
    _require = require('./util').getNPM
} catch(e) {
    _require = require
}

var gulp = _require('gulp'),
    gutil = _require('gulp-util'),
    gulpSequence = _require('gulp-sequence').use(gulp),
    del = _require('del'),
	jshint = _require('gulp-jshint'),
	uglify = _require('gulp-uglify'),
    concat = _require('gulp-concat'),
    merge = _require('gulp-merge'),
	autoprefixer = _require('gulp-autoprefixer'),
    minifyHtml = _require('gulp-minify-html'),
    minifyCss = _require('gulp-minify-css'),
	//imagemin = _require('gulp-imagemin'),
    ngAnnotate = _require('gulp-ng-annotate'),
	cache = _require('gulp-cache'),
    //livereload = _require('gulp-livereload'),
	//pngquant = _require('imagemin-pngquant'),
    ngTemplate = _require('gulp-ng-template');

var destPath = "app/build";

gulp.task('clean',function(cb){
  del([destPath+'/**/*.*'], {force:true}, cb);
});


gulp.task('jshint', function () {
     gulp.src(['js/** /*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter())
        .pipe(jshint.reporter('fail'));
});

gulp.task('images', function () {
    gulp.src(['theme/default/images/** /*.*'])
        .pipe(gulp.dest(destPath + '/images/'));
});

gulp.task('js', function () {
   return gulp.src(['app/js/* /*.js'])
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .pipe(uglify())
      .pipe(concat('app.js'))
      .pipe(gulp.dest(destPath));
});


gulp.task('concat-js', function () {
    merge(
        gulp.src(['app/js/app.js', 'app/js/**/*.js']),
        gulp.src(['app/partials/*.html'])
            .pipe(minifyHtml({empty: true, quotes: true}))
			.pipe(ngTemplate({
                moduleName: 'singleview',
                prefix: 'partials/'
            }))
    )
    /*
	.pipe(jshint())
	.pipe(jshint.reporter('default'))
	.pipe(ngAnnotate({single_quotes: true}))
	.pipe(uglify())
	*/
	.pipe(concat('all.js'))
	.pipe(gulp.dest(destPath))
});

gulp.task('css', function() {
    gulp.src('theme/default/css/*.css')
		.pipe(rename({ suffix: '.min' }))
		.pipe(minifycss())
		.pipe(gulp.dest(destPath))
});

/*
gulp.task('images', function () {
    gulp.src('theme/default/images/** /*.{png,jpg,gif,ico}')
        .pipe(cache(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()] 
        })))
        .pipe(gulp.dest(destPath + "/images"));
});
*/

gulp.task('default', gulpSequence(['clean', 'jshint','concat-js']));

//logEvents(gulp)
process.nextTick(function () {
    gulp.start.call(gulp, 'default')
})

function logEvents(gulpInst) {
    gulpInst.on('err', function () {
        failed = true;
    });

    gulpInst.on('task_start', function (e) {
        // TODO: batch these
        // so when 5 tasks start at once it only logs one time with all 5
        gutil.log('Starting', '\'' + gutil.colors.cyan(e.task) + '\'...');
    });

    gulpInst.on('task_stop', function (e) {
        gutil.log(
            'Finished', '\'' + gutil.colors.cyan(e.task) + '\'',
            'after', gutil.colors.magenta(formatTime(e.hrDuration))
        );
    });

    gulpInst.on('task_err', function (e) {
        var msg = e.err || e.message || 'error'
        gutil.log(
            '\'' + gutil.colors.cyan(e.task) + '\'',
            gutil.colors.red('errored after'),
            gutil.colors.magenta(formatTime(e.hrDuration))
        );
        gutil.log(msg);
    });

    gulpInst.on('task_not_found', function (err) {
        gutil.log(
            gutil.colors.red('Task \'' + err.task + '\' is not in your gulpfile')
        );
        gutil.log('Please check the documentation for proper gulpfile formatting');
        process.exit(1);
    });
}

function formatTime(time) {
    var totalSeconds = time[0] + time[1] / 1e9;
    return (totalSeconds * 1000).toPrecision(9) + 'ms'
}
