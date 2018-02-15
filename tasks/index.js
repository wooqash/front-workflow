import gulp from "gulp";
import gulpif from "gulp-if";
import path from "path";
import del from "del";
import browserSync from "browser-sync";
import autoprefixer from "autoprefixer";
import plumber from "gulp-plumber";
import notify from 'gulp-notify';
import notifier from 'node-notifier';
import gutil from "gulp-util";

import htmlValidator from "gulp-html";
import htmlmin from "gulp-htmlmin";
import sourcemaps from "gulp-sourcemaps";
import sass from "gulp-sass";
import sassLint from "gulp-sass-lint";
import cssnano from "cssnano";
import postcss from "gulp-postcss";
import imagemin from 'gulp-imagemin';
import imageminSvgo from 'imagemin-svgo';
import imageminGifsicle from 'imagemin-gifsicle';
import imageminPngquant from 'imagemin-pngquant';
import imageminJpegRecompress from 'imagemin-jpeg-recompress';

import { scripts } from "./webpack";
import { server }  from "./server";

const dirs = {
    src: path.resolve(__dirname, "../src"),
    dist: path.resolve(__dirname, "../dist")
};

const config ={
	autoprefixer: {
        browsers: ["last 3 versions", "ie >= 10"]
    },
    sassLint: {
        configFile: ".sass-lint.yml"
    },
    htmlMin: {
    	collapseWhitespace: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true
    }
}

const paths = {
	build: { //Paths where files are builded
		html: dirs.dist,
		js: dirs.dist + "/js/",
		css: dirs.dist + "/css/",
		img: dirs.dist + "/img/",
		fonts: dirs.dist + "/fonts/"
	},
	src: { //Paths where files are edited
		html: dirs.src + "/html/**/*.html",
		js: dirs.src + "/js/**/*.js",
		style: dirs.src + "/styles/**/*.s+(a|c)ss",
		img: dirs.src + "/img/**/*.*",
		fonts: dirs.src + "/fonts/**/*.*"
	},
};

const isProduction = process.env.NODE_ENV ? process.env.NODE_ENV.trim() === "production" : false;

const html = () =>{
	return gulp.src(paths.src.html)
        .pipe(plumber(function (err) {
            gutil.log(gutil.colors.red("Html error:"));
            gutil.log(gutil.colors.yellow(err.message));
            this.emit("end");
        }))
		.pipe(htmlValidator())
		.pipe(gulpif(isProduction, htmlmin(config.htmlMin)))
		.pipe(gulp.dest(paths.build.html));
};

const style = () =>{
	var plugins = [
        autoprefixer(config.autoprefixer)
    ];

    isProduction ? plugins.push(cssnano()) : null;

    return gulp.src(paths.src.style)
        .pipe(plumber(function (err) {
            notifier.notify({title: "SASS error", message: err.message});
            gutil.log(gutil.colors.red("Sass error:"));
            gutil.log(gutil.colors.yellow(err.message));
            this.emit("end");
        }))
        .pipe(gulpif(!isProduction, sourcemaps.init()))
        .pipe(sassLint(config.sassLint))
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError())
        .pipe(sass())
        .pipe(postcss(plugins))
        .pipe(gulpif(!isProduction, sourcemaps.write()))
        .pipe(gulp.dest(paths.build.css));
};

const js = () =>{
 	return scripts();  
};

const img = () =>{
    return gulp.src(paths.src.img)
        .pipe(plumber(function (err) {
            notifier.notify({title: "IMG error", message: err.message});
            gutil.log(gutil.colors.red("Img error:"));
            gutil.log(gutil.colors.yellow(err.message));
            this.emit("end");
        }))
        .pipe(gulpif(isProduction, imagemin([
            imageminSvgo({plugins: [{removeViewBox: false}]}),
            imageminGifsicle({interlaced: true}),
            imageminJpegRecompress({
                progressive: true,
                max: 80,
                min: 70
            }),
            imageminPngquant({quality: '80'})
        ])))
        .pipe(gulp.dest(paths.build.img));
};

const fonts = () =>{
    return gulp.src(paths.src.fonts)
        .pipe(gulp.dest(paths.build.fonts));
};

const clean = () => {
    return del([ dirs.dist ]);
};

export const watch = () => {
    gulp.watch(paths.src.html, html).on("change", ()=>{
        notifier.notify({title: "HTML", message: "Html files were updated"});
        return browserSync.reload(); 
    });
    gulp.watch(paths.src.style, style).on("change", ()=>{
        notifier.notify({title: "STYLE", message: "Styles were updated"});
        return browserSync.reload(); 
    });
    gulp.watch(paths.src.js, js).on("change", ()=>{
        notifier.notify({title: "SCRIPTS", message: "Scripts were updated"});
        return browserSync.reload(); 
    });
    gulp.watch(paths.src.img, img).on("change", ()=>{
        notifier.notify({title: "IMAGES", message: "Images were updated"});
        return browserSync.reload(); 
    });
    gulp.watch(paths.src.fonts, fonts).on("change", ()=>{
        notifier.notify({title: "FONTS", message: "Fonts were updated"});
        return browserSync.reload(); 
    });
};

const dev = gulp.series(clean, gulp.parallel(html, style, js, img, fonts), server, watch);
const build = gulp.series(clean, gulp.parallel(html, style, js, img, fonts));

gulp.task("dev", dev);
gulp.task("build", build);
gulp.task("default", dev);
