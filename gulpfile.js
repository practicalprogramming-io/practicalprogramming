var gulp = require('gulp')
  , less = require('gulp-less')
;

gulp.task('build-less', function () {
  return gulp.src('./public/less/*.less')
    .pipe(less())
    .pipe(gulp.dest('./public/css/'))
  ;
});

gulp.task('watch', function () {
  return gulp.watch(
    ['./public/less/*.less'],
    ['build-less'])
  ;
});

gulp.task('default', ['watch']);