const path = require('path')

module.exports = {
  output: {
    path: path.resolve(__dirname, '../dist')
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { cacheDirectory: true }
        }
      },
      {
        test: /\.(png|svg|jpe?g|gif)$/,
        type: 'asset/resource',
        generator: { filename: 'img/[name].[hash:4][ext]' }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: { filename: 'fonts/[name].[hash:4][ext]' }
      }
    ]
  }
}
