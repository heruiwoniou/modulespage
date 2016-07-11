/**
 * Author:Herui/Administrator;
 * CreateDate:2016/2/16
 *
 * Describe:
 */
var isDevelop = true,

    amdoption = {
        "css": 'libs/require-css/css.min',
        "jquery": "libs/jquery/dist/jquery.min",
        "jquery.ui": "libs/jquery-ui",
        "Class": "common/core/Class",
        "Core": "common/core/Core",
        "Guid": "common/core/Guid",
        "TPLEngine": "common/engine/tplEngine",
        "widget": "comsys/widget",
        "client": "common/client",
        "vue": "libs/vue/dist/vue"
    },

    widgets = [{
        name: "FullScreenModal",
    }],

    //引入gulp

    gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    cleancss = require('gulp-clean-css'),
    amdoptimize = require('amd-optimize'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    clean = require('gulp-clean'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('autoprefixer-stylus'),
    spriter = require('gulp-css-spriter'),
    rollup=require('gulp-rollup'),
    babel=require('rollup-plugin-babel'),
    rename=require('gulp-rename'),
    vueify = require('gulp-vueify');


gulp.task('vueify', function () {
  return gulp.src('_Runtime/Content/js/components/**/*.vue')
    .pipe(vueify())
    .pipe(gulp.dest('Runtime/Content/js/components/'));
});

gulp.task('build-css', function() {
    if (isDevelop) {
        gulp.src([
                '_Runtime/Content/style/common.styl'
            ])
            //.pipe(sourcemaps.init())
            .pipe(stylus({
                use: [autoprefixer({ browsers: ['last 2 versions', 'ie 9'], cascade: false })]
            }))
            .pipe(spriter({
                'spriteSheet': 'Runtime/Content/style/images/sprite.png',
                'pathToSpriteSheetFromCSS': 'images/sprite.png'
            }))
            //.pipe(cleancss())
            //.pipe(sourcemaps.write())
            .pipe(gulp.dest('Runtime/Content/style'));
    } else {
        gulp.src([
                '_Runtime/Content/style/common.styl'
            ])
            .pipe(stylus({
                use: [autoprefixer({ browsers: ['last 2 versions', 'ie 8'], cascade: false })]
            }))
            .pipe(spriter({
                'spriteSheet': 'Runtime/Content/style/images/sprite.png',
                'pathToSpriteSheetFromCSS': 'images/sprite.png'
            }))
            .pipe(cleancss())
            .pipe(gulp.dest('Runtime/Content/style'));
    }
});

gulp.task('build-script', function() {

    if (isDevelop) {
        gulp.src('_Runtime/Static/js/**/*.js')
            //.pipe(sourcemaps.init())
            .pipe(amdoptimize('config', {
                baseUrl: "_Runtime/Static/js",
                paths: amdoption,
                exclude: [
                    '../../Content/js/util/common'
                ]
            }))
            .pipe(concat("config.js"))
            //.pipe(sourcemaps.write())
            .pipe(gulp.dest("Runtime/Static/js"));
    } else {
        gulp.src('_Runtime/Static/js/**/*.js')
            .pipe(amdoptimize('config', {
                baseUrl: "_Runtime/Static/js",
                paths: amdoption,
                exclude: [
                    '../../Content/js/util/common'
                ]
            }))
            .pipe(concat("config.js"))
            .pipe(uglify())
            .pipe(gulp.dest("Runtime/Static/js"));
    }

    gulp.src(['_Runtime/Content/js/**/*.js', '!_Runtime/Content/js/widget/**/*.js'])
        .pipe(gulp.dest('Runtime/Content/js'));


    //widget compile
    //fullScreenModal
    widgets.forEach(function(widget) {
        // statements
        gulp.src('_Runtime/Content/js/widget/' + widget.name + '/index.js', { read: false })
            .pipe(rollup({
                //sourceMap: true,
                format: 'umd',
                moduleName: widget.name,
                plugins: [babel({ "presets": ["es2015-rollup"] })]
            }))
            .pipe(rename(widget.name + '.js'))
            //.pipe(sourcemaps.write())
            .pipe(gulp.dest('Runtime/Content/js/widget/'));
    });

     gulp.src('_Runtime/Content/js/components/**/*.vue')
        .pipe(vueify())
        .pipe(gulp.dest('Runtime/Content/js/components/'));

    // for(var i=0;i<createList.length;i++)
    // {
    //     var module=createList[i];
    //     gulp.src(['_Runtime/Content/js/**/*.js','_Runtime/Static/js/**/*.js'])
    //     .pipe(amdoptimize('../../Content/js/'+module.moduleName, {
    //             baseUrl:"_Runtime/Static/js",
    //             paths:amdoption,
    //             exclude: ['jquery','Core','Class','Guid'].concat(module.exclude)
    //         }
    //     ))
    //     .pipe(concat(module.moduleName+".js"))
    //     .pipe(gulp.dest('Runtime/Content/js'));
    // }
});

gulp.task('build-images', function() {
    gulp.src(['_Runtime/Content/style/images/**/*.jpg','_Runtime/Content/style/images/**/*.gif','_Runtime/Content/style/images/progress.png'])
        .pipe(gulp.dest('Runtime/Content/style/images/'));

    gulp.src(['_Runtime/Upload/**/*'])
        .pipe(gulp.dest('Runtime/Upload/'));
});

gulp.task('build-html', function() {
    gulp.src(['_Runtime/**/*.html', '!_Runtime/Static/js/libs/**/*.html'])
        .pipe(gulp.dest('Runtime/'));
    gulp.src(['_Runtime/Content/js/manage/components/**/*.html'])
        .pipe(gulp.dest('Runtime/Content/js/manage/components/'));
});

gulp.task('clean', function() {
    return gulp.src('Runtime')
        .pipe(clean({ force: true }));
});

gulp.task('develop', ['clean'], function() {

    gulp.run('build-css', 'build-script', 'build-html', 'build-images');

    /*build library*/

    if (isDevelop) {
        //requirejs
        gulp.src('_Runtime/Static/js/libs/requirejs/require.js')
            .pipe(uglify())
            .pipe(gulp.dest('Runtime/Static/js/libs/requirejs/'));
        //require-css
        gulp.src('_Runtime/Static/js/libs/require-css/css.min.js')
            .pipe(uglify())
            .pipe(gulp.dest('Runtime/Static/js/libs/require-css/'));
        //require-css
        gulp.src('_Runtime/Static/js/libs/require-text/text.js')
            .pipe(uglify())
            .pipe(gulp.dest('Runtime/Static/js/libs/require-text/'));
        //jquery-extend
        gulp.src('_Runtime/Static/js/libs/jquery-extend/*.js')
            .pipe(uglify())
            .pipe(gulp.dest('Runtime/Static/js/libs/jquery-extend/'));
        //echarts
        gulp.src('_Runtime/Static/js/libs/echarts/**/*.js')
            .pipe(uglify())
            .pipe(gulp.dest('Runtime/Static/js/libs/echarts/'));
        //nice-validator
        gulp.src(['_Runtime/Static/js/libs/nice-validator/**/*','!_Runtime/Static/js/libs/nice-validator/**/*.js'])
            .pipe(gulp.dest('Runtime/Static/js/libs/nice-validator/'));
        gulp.src(['_Runtime/Static/js/libs/nice-validator/**/*.js'])
            .pipe(gulp.dest('Runtime/Static/js/libs/nice-validator/'));
        //ztree
        gulp.src('_Runtime/Static/js/libs/ztree/jquery.ztree.js')
            .pipe(uglify())
            .pipe(gulp.dest('Runtime/Static/js/libs/ztree/'));
        gulp.src('_Runtime/Static/js/libs/ztree/style/*.css')
            .pipe(cleancss())
            .pipe(gulp.dest('Runtime/Static/js/libs/ztree/style/'));
        gulp.src('_Runtime/Static/js/libs/ztree/style/img/*')
            .pipe(gulp.dest('Runtime/Static/js/libs/ztree/style/img/'));
        //scrollbar
        // gulp.src('_Runtime/Static/js/libs/jquery.scrollbar/jquery.mCustomScrollbar.js')
        //     .pipe(uglify())
        //     .pipe(gulp.dest('Runtime/Static/js/libs/jquery.scrollbar/'));
        gulp.src('_Runtime/Static/js/libs/jquery.scrollbar/style/**/*')
            .pipe(gulp.dest('Runtime/Static/js/libs/jquery.scrollbar/style/'));

        gulp.src('_Runtime/Static/js/libs/jquery-ui/**/*')
            .pipe(gulp.dest('Runtime/Static/js/libs/jquery-ui/'));

    } else {
        gulp.src('_Runtime/Static/js/libs/require-css/css.min.js')
            .pipe(uglify())
            .pipe(gulp.dest('Runtime/Static/js/libs/require-css/'));

        gulp.src('_Runtime/Static/js/libs/requirejs/require.js')
            .pipe(uglify())
            .pipe(gulp.dest('Runtime/Static/js/libs/requirejs/'));

        gulp.src('_Runtime/Static/js/libs/jquery-extend/**/*.js')
            .pipe(uglify())
            .pipe(gulp.dest('Runtime/Static/js/libs/jquery-extend/'));
    }

    gulp.src('_Runtime/Static/style/fonts/*')
        .pipe(gulp.dest('Runtime/Content/style/fonts/'))

    // /*add listener*/
    // livereload.listen();
    /*add listener*/
    gulp.watch(['_Runtime/**/*.js','_Runtime/**/*.vue', '!_Runtime/Static/js/libs/**/*.js'], function() {
        gulp.run('build-script');
    });
    gulp.watch(['_Runtime/**/*.styl'], function() {
        gulp.run('build-css');
    });
    gulp.watch(['_Runtime/**/*.html', '!_Runtime/Static/**/*'], function() {
        gulp.run('build-html')
    });
});

gulp.task('default', function() {
    isDevelop = true;
    gulp.run('develop');
});
gulp.task('pack', function() {
    isDevelop = false;
    gulp.run('develop');
});
