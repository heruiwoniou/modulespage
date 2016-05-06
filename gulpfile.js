/**
 * Author:Herui/Administrator;
 * CreateDate:2016/2/16
 *
 * Describe:
 */
var amdoption={
    "css": 'libs/require-css/css.min',
    "jquery": "libs/jquery/dist/jquery.min",
    "jquery.ui": "libs/jquery-ui",
    "Class": "common/core/Class",
    "Core": "common/core/Core",
    "Guid": "common/core/Guid",
    "TPLEngine": "common/engine/tplEngine",
    "widget":"comsys/widget",
    "client":"common/client"
}

//引入gulp
var gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    cleancss = require('gulp-clean-css'),
    amdoptimize = require('amd-optimize'),
    concat = require('gulp-concat'),
    jshint=require('gulp-jshint'),
    clean = require('gulp-clean'),
    uglify=require('gulp-uglify'),
    sourcemaps=require('gulp-sourcemaps'),
    autoprefixer = require('autoprefixer-stylus'),
    spriter = require('gulp-css-spriter');


gulp.task('build-css', function () {
    gulp.src([
            '_Runtime/Content/style/common.styl'
        ])
        .pipe(sourcemaps.init())
        .pipe(stylus({
            use: [autoprefixer({ browsers: ['last 2 versions','ie 8'],cascade: false })]
        }))
        .pipe(spriter({
            'spriteSheet':'Runtime/Content/style/images/sprite.png',
            'pathToSpriteSheetFromCSS':'images/sprite.png'
        }))
        //.pipe(cleancss())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('Runtime/Content/style'));
});

gulp.task('build-script', function () {

    gulp.src('_Runtime/Static/js/**/*.js')
        // .pipe(jshint())
        // .pipe(jshint.reporter('default'))
        .pipe(sourcemaps.init())
        .pipe(amdoptimize('config', {
                baseUrl:"_Runtime/Static/js",
                paths:amdoption
                //,exclude: ['jquery']
            }
        ))
        .pipe(concat("config.js"))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("Runtime/Static/js"));

    // gulp.src('_Runtime/Static/js/config.js')
    //     // .pipe(jshint())
    //     .pipe(gulp.dest('Runtime/Static/js/'));

    var createList=["index"]

    for(var i=0;i<createList.length;i++)
    {
        var moduleName=createList[i];
        gulp.src(['_Runtime/Content/js/**/*.js','_Runtime/Static/js/**/*.js'])
        .pipe(jshint())
        .pipe(amdoptimize('../../Content/js/'+moduleName, {
                baseUrl:"_Runtime/Static/js",
                paths:amdoption,
                exclude: ['jquery','Core','Class','Guid']
            }
        ))
        .pipe(concat(moduleName+".js"))
        .pipe(gulp.dest('Runtime/Content/js'));
    }
});

// gulp.task('build-images', function () {
//     gulp.src(['_Runtime/**/*.png', '_Runtime/**/*.jpg','!_Runtime/Static/js/libs/**/*.png'])
//         .pipe(gulp.dest('Runtime/'));
// });

gulp.task('build-html', function () {
    gulp.src('_Runtime/**/*.html')
        .pipe(gulp.dest('Runtime/'));
});

gulp.task('clean', function() {
    return gulp.src('Runtime')
        .pipe(clean({force: true}));
});

gulp.task('develop',['clean'],function(){

    gulp.run('build-css','build-script','build-html'/*,'build-images'*/);

    /*build library*/
    // gulp.src('_Runtime/Static/js/libs/jquery/dist/jquery.min.js')
    //     .pipe(uglify())
    //     .pipe(gulp.dest('Runtime/Static/js/libs/jquery/dist/'));

    gulp.src('_Runtime/Static/js/libs/require-css/css.min.js')
        .pipe(uglify())
        .pipe(gulp.dest('Runtime/Static/js/libs/require-css/'));

    gulp.src('_Runtime/Static/js/libs/requirejs/require.js')
        .pipe(uglify())
        .pipe(gulp.dest('Runtime/Static/js/libs/requirejs/'));

    gulp.src('_Runtime/Static/style/fonts/*')
        .pipe(gulp.dest('Runtime/Content/style/fonts/'))

    // /*add listener*/
    // livereload.listen();
    /*add listener*/
    gulp.watch(['_Runtime/**/*.js','!_Runtime/Static/js/libs/**/*.js'], function () {
        gulp.run('build-script');
    });
    gulp.watch(['_Runtime/**/*.styl'],function(){
        gulp.run('build-css');
    });
    gulp.watch(['_Runtime/**/*.html','!_Runtime/Static/**/*'],function(){
        gulp.run('build-html')
    });
});

gulp.task('default', function () {
    gulp.run('develop');
});