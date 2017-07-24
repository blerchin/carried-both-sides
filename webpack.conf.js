import webpack from "webpack";
import glob from "glob";
import path from "path";
import postCSS from "./config/postcss";
import cssNano from "./config/cssnano";
import ExtractTextPlugin from "extract-text-webpack-plugin";

export default function(devMode = false) {
  const optimizePlugins = devMode ? [
    new webpack.HotModuleReplacementPlugin()
  ] : [
    new webpack.optimize.UglifyJsPlugin(),
    new ExtractTextPlugin("styles.css")
  ];
  const cssLoaders = [
    {loader: "css-loader", options: Object.assign({minimize: !devMode, sourceMap: true}, cssNano)},
    {loader: "postcss-loader", options: Object.assign({sourceMap: true}, postCSS)},
    "resolve-url-loader",
    {loader: "sass-loader", options: {sourceMap: true}}
  ];
  if (devMode) {
    cssLoaders.unshift("style-loader");
  }
  return {
    devtool: "source-map",
    module: {
      rules: [
        {
          test: /\.((jpe?g)|(png)|(eot)|(woff)|(woff2)|(ttf)|(svg)|(gif)|(mp4)|(webm))(\?v=\d+\.\d+\.\d+)?$/,
          loader: "file-loader?name=[path][name].[ext]"
        },
        {
          test: /\.json$/,
          loader: "json-loader",
        },
        {
          test: /\.js?$/,
          exclude: /node_modules/,
          loaders: [
            "babel-loader"
          ],
        },
        {
          test: /\.(scss|sass)?$/,
          use: devMode ? cssLoaders : ExtractTextPlugin.extract({use: cssLoaders})
        }
      ]
    },
    context: path.join(__dirname, "src"),
    entry: function() {
      const hot = devMode ? ["webpack-hot-middleware/client?reload=true"] : [];
      const js = ["./js/app.js"];
      const img = glob.sync("./img/**/*", {
        absolute: true, // Receive absolute paths for matched files.
        cwd: this.context, // The current working directory in which to search.
        matchBase: true, // Perform a basename-only match.
        nodir: true, // Do not match directories, only files.
        nosort: true // Don't sort the results.
      });
      return [...hot, ...js, ...img];
    },
    output: {
      path: path.join(__dirname, "./dist")
    },
    plugins: [
      new webpack.ProvidePlugin({
        "fetch": "imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch"
      }),
      ...optimizePlugins
    ],
    resolve: {
      modules: [
        path.resolve("src"), // Search only in the given directory.
        "node_modules/"
      ]
    }
  };
}
