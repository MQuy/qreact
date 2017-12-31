const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './app.js',
  target: 'web',

  output: {
    path: __dirname,
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js|jsx$/,
        loader: 'babel-loader',
        query: {
          babelrc: false,
          presets: [
            'stage-2'
          ],
          plugins: [
            [
              'transform-react-jsx',
              {
                pragma: 'createElement'
              }
            ],
            'transform-class-properties'
          ]
        }
      }
    ]
  }
}