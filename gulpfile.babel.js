import gulp from "gulp";
import cp from "child_process";
import gutil from "gulp-util";
import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import webpackConfig from "./webpack.conf";

const hugoBin = "hugo";
const defaultArgs = ["-d", "../.tmp", "-s", "site", "-v"];


gulp.task("hugo", (cb) => buildSite(cb));
gulp.task("hugo-preview", (cb) => buildSite(cb, ["--buildDrafts", "--buildFuture"]));

gulp.task("build", ["hugo", "webpack"]);

gulp.task("webpack", ["hugo"], (cb) => {
  webpack(webpackConfig, (err) => {
    if (err) throw new gutil.PluginError("webpack", err);
    cb();
  });
});

gulp.task("webpack-watch", ["hugo"], (cb) => {
  const config = Object.assign({
    watch: true
  }, webpackConfig);
  const compiler = webpack(config);
  new WebpackDevServer(compiler, {
    stats: {
      colors: true,
      progress: true
    }
  }).listen(3000, "localhost", (err) => {
    if (err) throw new gutil.PluginError("webpack-dev-server", err);
    // Server listening
    /*
    gutil.log("[webpack]", stats.toString({
      colors: true,
      progress: true
    }));
    */
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
