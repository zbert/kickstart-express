'use strict';
//node modules
var path = require('path');

// node_modules modules
var _                 = require('lodash');
var browserify        = require("browserify");
var browserSync       = require("browser-sync").create();
var bsreload          = browserSync.reload;
var del               = require('del');
var fs                = require('fs');
var nodemon           = require('nodemon');
var mergeStream       = require('merge-stream');
var q                 = require('q');
var source            = require('vinyl-source-stream');
var watchify          = require('watchify');

// gulp modules
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var hb = require('gulp-hb');

// user project configuration
var config = require('./config.js');

var browserSyncLoadDelay = 750;

// error handler
var onError = function (err, cb) {
    plugins.util.beep();
    plugins.util.log(plugins.util.colors.red(err));

    if (typeof this.emit === 'function') this.emit('end');
};

// clean task
gulp.task('clean', function (cb) {
    return del([
        config.dest.base,
        'styleguide'
    ], cb);
});

// styles task
gulp.task('styles', function () {
    return gulp.src(config.src.styles)
        .pipe(plugins.plumber({ errorHandler: onError }))
        .pipe(plugins.sass(config.sass.settings))
        .pipe(plugins.cssUrlAdjuster({
            prepend: config.dest.images
        }))
        //.pipe(plugins.if(!config.dev, plugins.combineMediaQueries()))
        .pipe(plugins.autoprefixer(config.sass.autoprefixer))
        .pipe(plugins.if(!config.dev, plugins.csso()))
        .pipe(gulp.dest(config.dest.styles))
        .pipe(plugins.if(config.dev, bsreload({ stream: true })));
});

// scripts task
gulp.task('scripts', function () {

    var browserifyTask = function () {

        var browserifyThis = function (bundleConfig) {
            if (config.dev) {
                _.extend(config.src.scriptBundles, watchify.args, { debug: true });

                bundleConfig = _.omit(bundleConfig, ['external', 'require']);
            }

            var b = browserify(bundleConfig);

            var bundle = function () {

                return b
                    .bundle()
                    .on('error', onError)
                    .pipe(source(bundleConfig.outputName))
                    .pipe(gulp.dest(bundleConfig.dest))
                    .pipe(plugins.if(config.dev, bsreload({ stream: true })));
            };

            if (config.dev) {
                b = watchify(b);
                b.on('update', bundle);
            } else {
                if (bundleConfig.require) b.require(bundleConfig.require);
                if (bundleConfig.external) b.external(bundleConfig.external);
            }

            return bundle();
        };

        return mergeStream.apply(gulp, _.map(config.scriptBundles, browserifyThis));

    }

    return browserifyTask();

});

// images task
gulp.task('images', function () {
    return gulp.src(config.src.images)
        .pipe(plugins.changed(config.dest.images))
        .pipe(plugins.if(!config.dev, plugins.imagemin(config.images)))
        .pipe(gulp.dest(config.dest.images))
        .pipe(plugins.if(config.dev, bsreload({ stream: true })));
});

// fonts task
gulp.task('fonts', function () {
    return gulp.src(config.src.fonts)
        .pipe(gulp.dest(config.dest.fonts));
});

gulp.task('compile:html', function() {
    require.extensions['.html'] = function (module, filename) {
       module.exports = hb.handlebars.compile(fs.readFileSync(filename, 'utf8'));
    };
    return gulp
        .src('./src/templates/views/*.html')
        .pipe(hb({
            debug: 0,
            partials: './src/templates/views/partials/**/*.html',
            helpers: './src/templates/helpers/**/*.js',
            data: './src/public/data/**/*.{js,json}'
        }))
        .pipe(gulp.dest('./site'));
});

// copy extra files task
gulp.task('copy:extras', function () {
    return gulp.src('./src/public/*.{ico,txt}')
        .pipe(gulp.dest(config.dest.base));
});

// Move
gulp.task('moveFiles', function (done) {
    for (var i = config.src.moveFiles.length - 1; i >= 0; i--) {
        gulp.src(config.src.moveFiles[i])
            .pipe(gulp.dest(config.dest.moveFiles[i]));
    }
    done();
});

gulp.task('browser-sync', function () {
    return browserSync(config.browserSync);
});

gulp.task('copy:js', function () {
    gulp.src(config.src.customScripts)
        .pipe(gulp.dest(config.dest.customScripts))
});

// watch task
gulp.task('watch', function () {

    plugins.watch(config.src.styles, function () {
        gulp.start('styles')
    });

    plugins.watch(config.src.images, function () {
        gulp.start('images')
    });

    plugins.watch(config.src.customScripts, function () {
        gulp.start('copy:js')
    });
});

// test performance task
gulp.task('test:performance', function () {
    //TODO: write the performance tasks
});

// performance task entry point
gulp.task('perf', ['test:performance']);

// SERVER
gulp.task('serve', function() {
    return nodemon({
        script: 'app.js',
        ignore: [
            './node_modules/**',
            './site/**',
            'gulpfile.js'
        ],
        tasks: []
    })
    .on('restart', function() {
        setTimeout(function() {
            bsreload();
        }, browserSyncLoadDelay);
    });
});

// production build task
gulp.task('build:production', ['clean'], function (done) {
    config.dev = false;
    plugins.sequence(
        ['fonts', 'images', 'styles', 'scripts', 'copy:js', 'copy:extras', 'moveFiles'],
        'compile:html',
        done
    );
});

gulp.task('build', ['clean'], function(done) {

    function initBrowserSync() {
        setTimeout(function() {
            browserSync.init({
                proxy: 'localhost:3000',
                port: '3030',
                files: [
                    config.dest.styles + '/*.css',
                    config.dest.scripts + '/**/*.js',
                    config.src.data,
                    config.src.includes,
                    config.src.pages
                ]
            });
        }, browserSyncLoadDelay);
    }

    plugins.sequence(
        ['fonts', 'images', 'styles', 'scripts'],
        ['copy:extras','copy:js','moveFiles'],
        ['watch', 'serve'],
        initBrowserSync
    );
});

gulp.task('default', ['build']);

//Sitecore specefic Task
gulp.task('styles:sitecore', function() {
    return gulp.src(config.dest.styles+'/*.css')
        .pipe(gulp.dest('../../../../Website/assets/site/public/css'));
});
gulp.task('scripts:sitecore', function() {
    return gulp.src(config.dest.scripts+'/*.js')
        .pipe(gulp.dest('../../../../Website/assets/site/public/js'));
});
gulp.task('scripts:sitecore-custom', function() {
    return gulp.src(config.dest.customScripts+'/**/*.js')
        .pipe(gulp.dest('../../../../Website/assets/site/public/js/custom'));
});
gulp.task('cshtml', function() {
    gulp.src('../Areas/Main/Views/**/*.cshtml', {
        base: '../Areas/Main//Views/'
    })
    .pipe(gulp.dest('../../../../Website/Areas/Main/Views/'));
});

gulp.task('watch-sitecore',function() {
    gulp.watch(config.dest.styles+'/*.css', ['styles:sitecore']);
    gulp.watch(config.dest.scripts+'/*.js',['scripts:sitecore']);
    gulp.watch(config.dest.customScripts+'/**/*.js',['scripts:sitecore-custom']);
    gulp.watch('../Areas/Main/Views/**/*.cshtml', ['cshtml']);
});
