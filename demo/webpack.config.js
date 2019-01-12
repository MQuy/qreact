module.exports = {
  entry: "./app.js",
  target: "web",
  devtool: "source-map",

  mode: "development",

  output: {
    path: __dirname,
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js|jsx$/,
        loader: "babel-loader",
        query: {
          babelrc: false,
          presets: [
            [
              "@babel/preset-react",
              {
                pragma: "createElement"
              }
            ]
          ],
          plugins: ["@babel/plugin-proposal-class-properties"]
        }
      }
    ]
  }
};
