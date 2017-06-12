import webpack from "webpack";
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
              attrs: ["img:src", "link:href", "script:src"],
              interpolate: "require"
            }
          }
        ]
      },
      {
        test: /\.((eot)|(woff)|(woff2)|(ttf)|(svg))(\?v=\d+\.\d+\.\d+)?$/,
        loaders: [
          "file-loader?name=img/[hash].[ext]"
        ]
      },
      {
        test: /\.(jpe?g|png|gif|tiff)$/i,
        loaders: [
          "file-loader?name=img/[hash].[ext]",
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
          "file-loader?name=css/[name].[hash:4].css",
          "extricate-loader?resolve=\\.js$",
          "css-loader",
          {loader: "postcss-loader", options: postCSS},
          "sass-loader?outputStyle=nested"
        ]
      },
      {test: /\.json$/, loader: "json-loader"},
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loaders: [
          "entry-loader?name=js/[name].js",
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true
            }
          }
        ],
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      "fetch": "imports-loader?this=>global!exports?global.fetch!whatwg-fetch"
    }),
    new webpack.EnvironmentPlugin({NODE_ENV: "development"})
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
