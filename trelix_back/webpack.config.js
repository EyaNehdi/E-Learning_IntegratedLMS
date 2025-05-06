const path = require('path');

module.exports = {
  mode: 'development',
  target: 'node',
  entry: './app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
          'html-loader'
        ],
      },
    ],
  },
};
