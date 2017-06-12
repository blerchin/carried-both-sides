import gulp from "gulp";
import cp from "child_process";
import gutil from "gulp-util";
import BrowserSync from "browser-sync";
import webpack from "webpack";
import webpackStream from "webpack-stream";
import webpackConfig from "./webpack.conf";

const browserSync = BrowserSync.create();
const hugoBin = "hugo";
const defaultArgs = ["-d", "../.tmp", "-s", "site", "-v"];


gulp.task("hugo", (cb) => buildSite(cb));
gulp.task("hugo-preview", (cb) => buildSite(cb, ["--buildDrafts", "--buildFuture"]));

gulp.task("build", ["hugo", "webpack"]);

gulp.task("webpack", ["hugo"], () => {
  return gulp.src("./.tmp/**/*.html")
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest("./dist"));
});

gulp.task("webpack-watch", ["hugo"], (cb) => {
  const config = Object.assign({
    watch: true,
    watchOptions: {
      aggregateTimeout: 500,
    }
  }, webpackConfig);
  let init = false;
  gulp.src("./.tmp/**/*.html")
    .pipe(webpackStream(config, webpack, (err, stats) => {
      if (err) throw new gutil.PluginError("webpack", err);
      gutil.log("[webpack]", stats.toString({
        colors: true,
        progress: true
      }));
      if (!init) {
        cb();
        init = true;
      }
      browserSync.reload();
    }))
    .pipe(gulp.dest("./dist"));
});

gulp.task("server", ["hugo", "webpack-watch"], () => {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
  gulp.watch("./site/**/*", ["hugo"]);
});

function buildSite(cb, options) {
  const args = options ? defaultArgs.concat(options) : defaultArgs;

  return cp.spawn(hugoBin, args, {stdio: "inherit"}).on("close", (code) => {
    if (code === 0) {
      browserSync.reload();
      cb();
    } else {
      browserSync.notify("Hugo build failed :(");
      cb("Hugo build failed");
    }
  });
}
