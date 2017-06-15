import webpack from "webpack";
import glob from "glob";
import path from "path";
import postCSS from "./config/postcss";

export default {
  context: path.join(__dirname, ".tmp"),
  module: {
    rules: [
      {
        test: /\.html$/,
        loaders: [
          "file-loader?name=[path][name].[ext]",
          "extricate-loader",
          {
            loader: "html-loader",
            options: {
              attrs: ["img:src", "script:src", "link:href"],
              interpolate: "require"
            }
          }
        ]
      },
      {
        test: /\.((eot)|(woff)|(woff2)|(ttf)|(svg))(\?v=\d+\.\d+\.\d+)?$/,
        loaders: [
          "file-loader?name=[hash].[ext]"
        ]
      },
      {
        test: /\.(jpe?g|png|gif|tiff)$/i,
        loaders: [
          {
            loader: "image-webpack-loader",
            options: {
              bypassOnDebug: true
            }
          },
          "sharp-image-loader"
        ]
      },
      {
        test: /.(css|sass|scss)$/i,
        use: [
          "file-loader?name=[hash].css",
          "extricate-loader?resolve=\\.js$",
          "css-loader",
          {loader: "postcss-loader", options: postCSS},
          "resolve-url-loader",
          "sass-loader"
        ]
      },
      {test: /\.json$/, loader: "json-loader"},
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loaders: [
          "entry-loader?name=[hash].js",
          "babel-loader"
        ],
      }
    ]
  },
  entry: function() {
    return glob.sync("*.html", {
      absolute: true, // Receive absolute paths for matched files.
      cwd: this.context, // The current working directory in which to search.
      matchBase: true, // Perform a basename-only match.
      nodir: true, // Do not match directories, only files.
      nosort: true // Don't sort the results.
    });
  },
  output: {
    path: path.join(__dirname, "./dist")
  },
  plugins: [
    new webpack.ProvidePlugin({
      "fetch": "imports-loader?this=>global!exports?global.fetch!whatwg-fetch"
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  resolve: {
    modules: [
      path.resolve("src"), // Search only in the given directory.
      "node_modules/"
    ]
  },
  resolveLoader: {
    alias: {
      resize: "responsive-loader"
    }
  }
};
