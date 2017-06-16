import gulp from "gulp";
import cp from "child_process";
import gutil from "gulp-util";
import BrowserSync from "browser-sync";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackConfig from "./webpack.conf";

const hugoBin = "hugo";
const defaultArgs = ["-d", "../.tmp", "-s", "site", "-v"];

const browserSync = BrowserSync.create();


gulp.task("hugo", (cb) => buildSite(cb));
gulp.task("hugo-preview", (cb) => buildSite(cb, ["--buildDrafts", "--buildFuture"]));

gulp.task("build", ["hugo", "webpack"]);

gulp.task("webpack", ["hugo"], (cb) => {
  webpack(webpackConfig(), (err, stats) => {
    if (err) throw new gutil.PluginError("webpack", err);
    gutil.log("[webpack]", stats.toString({
      colors: true,
      progress: true
    }));
    cb();
  });
});

gulp.task("webpack-watch", ["hugo"], (cb) => {
  const compiler = webpack(webpackConfig(true));
  function reporter(evt) {
    const statsOptions = {
      colors: true,
      progress: true
    };
    if (evt.state) {
      if (evt.stats.hasErrors()) {
        gutil.log("[webpack]", "Failed to compile.");
      } else if (evt.stats.hasWarnings()) {
        gutil.log("[webpack]", "Compiled with warnings.");
      } else {
        gutil.log("[webpack]", evt.stats.toString(statsOptions));
        browserSync.reload();
      }
    } else {
      gutil.log("[webpack]", "Compiling...");
    }
  }
  const webpackMiddleware = webpackDevMiddleware(compiler, {
    publicPath: "/",
    reporter: reporter
  });
  browserSync.init({
    server: {
      baseDir: "./dist",
      middleware: [
        webpackMiddleware,
      ]
    }
  });
});

gulp.task("hugo-watch", () => {
  gulp.watch("./site/**/*", ["hugo"]);
});

gulp.task("server", ["hugo-watch", "webpack-watch"]);

function buildSite(cb, options) {
  const args = options ? defaultArgs.concat(options) : defaultArgs;

  return cp.spawn(hugoBin, args, {stdio: "inherit"}).on("close", (code) => {
    if (code === 0) {
      cb();
    } else {
      cb("Hugo build failed");
    }
  });
}
