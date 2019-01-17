const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./app.js",
  target: "web",
  devtool: "source-map",

  mode: "development",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },

  devServer: {
    contentBase: "./dist"
  },

  module: {
    rules: [
      {
        test: /\.js|jsx$/,
        loader: "babel-loader",
        query: {
          babelrc: false,
          presets: [["@babel/preset-react"]],
          plugins: ["@babel/plugin-proposal-class-properties", "@babel/plugin-proposal-object-rest-spread"]
        }
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: "qReact",
      template: "index.html"
    })
  ]
};
