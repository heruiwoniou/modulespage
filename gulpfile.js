/**
 * Author:Herui/Administrator;
 * CreateDate:2016/2/16
 *
 * Describe:
 */
var isDevelop = true,
    fs = require('fs'),
    path = require('path'),
    //引入gulp
    gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    cleancss = require('gulp-clean-css'),
    amdoptimize = require('amd-optimize'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('autoprefixer-stylus'),
    spriter = require('gulp-css-spriter'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace');

var doingstylus = function(sm,dest,module){
        var sprite = (module ? 'sprite-' + module : 'sprite') + '.png';
        if(isDevelop) sm = sm.pipe(sourcemaps.init())
        sm = sm.pipe(stylus({use: [autoprefixer({ browsers: ['last 2 versions', 'ie 9'], cascade: false })]}))
        .pipe(spriter({
                'spriteSheet': 'Runtime/Content/style/images/' + sprite,
                'pathToSpriteSheetFromCSS': '../images/' + sprite
            }))//.pipe(cleancss({processImport : false}));
        if( module ) sm = sm.pipe(replace(/^([\s\S]*)$/g,"@import url('./../common/common.css');\n@import url('./../modules_business/" + module + ".css');\n$1;"))
        if( isDevelop ) sm = sm.pipe(sourcemaps.write());
        sm.pipe(gulp.dest(dest));
    }

gulp.task('build-css', function() {
    var arr = fs.readdirSync(path.join(__dirname, './_Runtime/Content/style/modules_base')).filter(o => o.indexOf('.styl') > -1);
    var i,module;

    doingstylus(gulp.src('_Runtime/Content/style/common/common.styl'),'Runtime/Content/style/common');
    for(i = 0 ; i < arr.length ; i++)
    {
        module = arr[i].substr(0, arr[i].lastIndexOf('.'));
        doingstylus(gulp.src('_Runtime/Content/style/modules_base/' + module + '.styl'),'Runtime/Content/style/modules_base', module);
    }

    doingstylus(gulp.src('_Runtime/Content/style/common/datapicker/datapicker.styl'),'Runtime/Content/style/common/datapicker');

    gulp.src('_Runtime/Content/style/modules_business/**/*').pipe(cleancss({processImport : false})).pipe(gulp.dest('Runtime/Content/style/modules_business/'));

    gulp.src('_Runtime/Static/js/libs/jquery.scrollbar/style/**.*').pipe(gulp.dest('Runtime/Content/style/common/jquery.scrollbar'))
});

gulp.task('build-script', function() {

    var arr = fs.readdirSync(path.join(__dirname, './_Runtime/Content/js/modules_base')).filter(o => o.indexOf('.js') > -1);
    var i,module,option = {
        baseUrl:"_Runtime",
        paths:{
            "css": 'Static/js/libs/require-css/css',
            'text':'Static/js/libs/require-text/text',

            "jquery": "Static/js/libs/jquery/dist/jquery.min",
            "jquery.ui": "Static/js/libs/jquery-ui",

            "Class": "Static/js/common/core/Class",
            "Core": "Static/js/common/core/Core",
            "Guid": "Static/js/common/core/Guid",
            "TPLEngine": "Static/js/common/engine/tplEngine",

            "widget": "Static/js/comsys/widget",
            "client": "Static/js/common/client",
            "comsys": "Static/js/comsys",
            "common": "Static/js/common",
            "libs": "Static/js/libs"
        },
        exclude: ['jquery','Content/js/common/util']
    }
    for(i = 0 ; i < arr.length ; i++)
    {
        module = arr[i];
        var sm = gulp.src('_Runtime/**/*.js');
        if(isDevelop) sm = sm.pipe(sourcemaps.init())
        sm = sm.pipe(amdoptimize('Content/js/modules_base/' + module.split('.').shift(), option)).pipe(concat(module))//.pipe(uglify());
        if(isDevelop) sm = sm.pipe(sourcemaps.write());
        sm.pipe(gulp.dest("Runtime/Content/js/modules_base/"));
    }

    gulp.src('_Runtime/Content/js/modules_business/**/*.js')
        .pipe(gulp.dest('Runtime/Content/js/modules_business/'));

    gulp.src('_Runtime/Content/js/common/util.js')
        .pipe(gulp.dest('Runtime/Content/js/common/'));

    gulp.src('_Runtime/Static/js/libs/requirejs/require.js')
        .pipe(uglify())
        .pipe(gulp.dest('Runtime/Content/js/common/'));

    gulp.src('_Runtime/Static/js/libs/jquery/dist/jquery.js')
        .pipe(uglify())
        .pipe(gulp.dest('Runtime/Content/js/common/'));
});

gulp.task('build-images', function() {
    gulp.src(['_Runtime/Content/style/images/**/*.jpg','_Runtime/Content/style/images/**/*.gif', '_Runtime/Content/style/images/service-center.png','_Runtime/Static/style/images/progress.png'])
        .pipe(gulp.dest('Runtime/Content/style/images/'));

    gulp.src('_Runtime/Upload/**.*').pipe(gulp.dest('Runtime/Content/Upload/'))
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

    gulp.src('_Runtime/Static/style/fonts/*')
        .pipe(gulp.dest('Runtime/Content/style/fonts/'))

    gulp.src('_Runtime/Content/style/fonts/*')
        .pipe(gulp.dest('Runtime/Content/style/fonts/'))

    gulp.watch(['_Runtime/**/*.js'], function() {
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