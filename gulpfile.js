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

var isDevelop=true;

var createList=[
    {
        moduleName:"index",
        exclude:[
            'libs/jquery-extend/jquery.scroll-column',
            'libs/jquery-extend/jquery.stellar'
        ]
    },
    {
        moduleName:"module/a",
        exclude:[
            'libs/jquery-extend/jquery.scroll-column',
            'libs/jquery-extend/jquery.stellar'
        ]
    }
]

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
    if(isDevelop)
    {
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
    }
    else
    {
        gulp.src([
            '_Runtime/Content/style/common.styl'
        ])
        .pipe(stylus({
            use: [autoprefixer({ browsers: ['last 2 versions','ie 8'],cascade: false })]
        }))
        .pipe(spriter({
            'spriteSheet':'Runtime/Content/style/images/sprite.png',
            'pathToSpriteSheetFromCSS':'images/sprite.png'
        }))
        .pipe(cleancss())
        .pipe(gulp.dest('Runtime/Content/style'));
    }
});

gulp.task('build-script', function () {

     if(isDevelop)
     {
        gulp.src('_Runtime/Static/js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(amdoptimize('config', {
                baseUrl:"_Runtime/Static/js",
                paths:amdoption
            }
        ))
        .pipe(concat("config.js"))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("Runtime/Static/js"));
    }else {
        gulp.src('_Runtime/Static/js/**/*.js')
        .pipe(amdoptimize('config', {
                baseUrl:"_Runtime/Static/js",
                paths:amdoption
            }
        ))
        .pipe(concat("config.js"))
        .pipe(uglify())
        .pipe(gulp.dest("Runtime/Static/js"));
    }


    for(var i=0;i<createList.length;i++)
    {
        var module=createList[i];
        gulp.src(['_Runtime/Content/js/**/*.js','_Runtime/Static/js/**/*.js'])
        .pipe(amdoptimize('../../Content/js/'+module.moduleName, {
                baseUrl:"_Runtime/Static/js",
                paths:amdoption,
                exclude: ['jquery','Core','Class','Guid'].concat(module.exclude)
            }
        ))
        .pipe(concat(module.moduleName+".js"))
        .pipe(gulp.dest('Runtime/Content/js'));
    }
});

gulp.task('build-images', function () {
     gulp.src(['_Runtime/Content/style/images/**/*.jpg'])
         .pipe(gulp.dest('Runtime/Content/style/images/'));
});

gulp.task('build-html', function () {
    gulp.src(['_Runtime/**/*.html','!_Runtime/Static/js/libs/**/*.html'])
        .pipe(gulp.dest('Runtime/'));
});

gulp.task('clean', function() {
    return gulp.src('Runtime')
        .pipe(clean({force: true}));
});

gulp.task('develop',['clean'],function(){

    gulp.run('build-css','build-script','build-html','build-images');

    /*build library*/
    // gulp.src('_Runtime/Static/js/libs/jquery/dist/jquery.min.js')
    //     .pipe(uglify())
    //     .pipe(gulp.dest('Runtime/Static/js/libs/jquery/dist/'));

    if(isDevelop)
    {
        gulp.src('_Runtime/Static/js/libs/require-css/css.min.js')
            .pipe(gulp.dest('Runtime/Static/js/libs/require-css/'));

        gulp.src('_Runtime/Static/js/libs/requirejs/require.js')
            .pipe(gulp.dest('Runtime/Static/js/libs/requirejs/'));

        gulp.src('_Runtime/Static/js/libs/jquery-extend/*.js')
            .pipe(gulp.dest('Runtime/Static/js/libs/jquery-extend/'));
    }
    else
    {
        gulp.src('_Runtime/Static/js/libs/require-css/css.min.js')
            .pipe(uglify())
            .pipe(gulp.dest('Runtime/Static/js/libs/require-css/'));

        gulp.src('_Runtime/Static/js/libs/requirejs/require.js')
            .pipe(uglify())
            .pipe(gulp.dest('Runtime/Static/js/libs/requirejs/'));

        gulp.src('_Runtime/Static/js/libs/jquery-extend/*.js')
            .pipe(uglify())
            .pipe(gulp.dest('Runtime/Static/js/libs/jquery-extend/'));
    }

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
    isDevelop=true;
    gulp.run('develop');
});
gulp.task('pack', function () {
    isDevelop=false;
    gulp.run('develop');
});