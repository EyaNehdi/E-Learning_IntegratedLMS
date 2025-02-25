const path = require('path');

module.exports = {
    mode: 'development', 
  target: 'node',  // Set the target to node
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
        use: {
          loader: 'babel-loader',
          loader: 'html-loader', // Add this line
        },
      },
    ],
  },
};
