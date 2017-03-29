## Introduction
gulp-google-closure-compiler-post is a plugin for [gulp](https://github.com/wearefractal/gulp).
It is designed to use the Google Closure Compiler without installing it.

## Installation
Install this package with NPM and add it to your development dependencies:
`npm install --save-dev gulp-google-closure-compiler-post`

## Usage

```js
var closure = require('gulp-google-closure-compiler-post');

gulp.task('javascript', function() {
  return gulp.src('./javascript/*.js')
    .pipe(concat('all.js'))
    .pipe(closure('./path/all.min.js'))
    .pipe(gulp.dest('./path/'));
});
```
