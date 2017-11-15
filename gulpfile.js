const gulp = require('gulp');
const uglify = require('gulp-uglify');
const liveReload = require('gulp-livereload');
const concat = require('gulp-concat');
// concat works for css and js files
const minifyCSS = require('gulp-minify-css');
const autoprefixer = require('gulp-autoprefixer');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const del = require('del');
const zip = require('gulp-zip');

// Handlebars plugins
const handlebars = require('gulp-handlebars');
const handlebarsLib = require('handlebars');
const declare = require('gulp-declare');
const wrap = require('gulp-wrap');

// Image compression
const imagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');

// File paths
// ** grabs javascript files from folders in the scripts folder
const dist_path = 'public/dist';
const scripts_path = 'public/scripts/**/*.js';
const css_path = 'public/css/**/*.css';
const cssSource = ['public/css/reset.css', css_path];
const templates_path = 'templates/**/*.hbs';
const images_path = 'public/images/**/*.{png,jpeg,jpg,svg,gif}';

// When you are creating a gulp task, you are creating a unit of functionality

// Styles
gulp.task('styles', function () {
    console.log('Starting styles task');
    return gulp.src(cssSource)
    // You can customize the way you order css files using an array
    // Order is important when doing a general task
        .pipe(plumber(function (err) {
            console.log('Styles Task Error');
            console.log(err);
            this.emit('end');
        }))
        // plumber keeps gulp watch running when debugging
        .pipe(sourcemaps.init())
        // Source maps has two steps to hone in on error by the specific file
        // 1/2 begin the process of sourcing. init for css
        .pipe(autoprefixer())
        // autoprefixer automatically adds support for all browsers
        .pipe(concat('styles.css'))
        .pipe(minifyCSS())
        .pipe(sourcemaps.write())
        // 2/2 write it to folder. write for css
        .pipe(gulp.dest(dist_path))
        .pipe(liveReload());
});

// Scripts
gulp.task('scripts', function () {
    console.log('Starting scripts task');

    return gulp.src('public/scripts/*.js')
        .pipe(plumber(function (err) {
            console.log('Scripts Task Error');
            console.log(err);
            this.emit('end');
        }))
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())
        .pipe(concat('scripts.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(dist_path))
        .pipe(liveReload());
});

// Images
gulp.task('images', function () {
    return gulp.src(images_path)
        .pipe(imagemin(
            [
                imagemin.gifsicle(),
                imagemin.jpegtran(),
                imagemin.optipng(),
                imagemin.svgo(),
                imageminPngquant(),
                imageminJpegRecompress()
            ]
        ))
        .pipe(gulp.dest(`${dist_path}/images`));
});

// Templates
gulp.task('templates', function () {
    return gulp.src(templates_path)
        .pipe(handlebars({
            handlebars: handlebarsLib
            // Have to first call gulp handlebars function, use gulp handlebars as key
            // Then use handlebars object, Use handlebars lib as the value
        }))
        // Compile handlbar files as handlebar templates
        .pipe(wrap('Handlebars.template(<%= contents %>)'))
        // Add them into the wrap statement, this is how handlebar registers templates
        .pipe(declare({
            namespace: 'templates',
            noRedeclare: true
        }))
        // Create a templates variable, Give us access to these templates via the template variable
        .pipe(concat('templates.js'))
        // Concat into one file
        .pipe(gulp.dest(dist_path))
        // dest saves the concatenated file into the destined file path.
        .pipe(liveReload());
});

gulp.task('clean', function () {
    return del.sync([
        dist_path
    ]);
});

// gulp default bootstraps other tasks, in which you want to run one task by itself first
gulp.task('default', ['clean', 'images', 'templates', 'styles', 'scripts'], function () {
    // Second argument in default gulp tasks run all the tasks before the default task
    console.log('Starting default task');
});

gulp.task('export', function () {
    return gulp.src('public/**/*')
        .pipe(zip('website.zip'))
        .pipe(gulp.dest('./'))
});

gulp.task('watch', ['default'], function () {
    // runs default first so that we can see the latest version
    console.log('Starting watch task');
    require('./server.js');
    liveReload.listen();
    gulp.watch(scripts_path, ['scripts']);
    gulp.watch(cssSource, ['styles']);
    gulp.watch(templates_path, ['templates']);
});

// Gulp live reload is a third party plugin that requires installation
// npm install gulp-livereload@latest --save-dev
// ^^ this is the command to install gulp live reload

// Order is not important in task watching