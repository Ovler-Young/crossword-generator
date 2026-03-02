const path = require('path')
const { merge } = require('webpack-merge')
const base = require('./webpack.base')
const HtmlWbpk = require('html-webpack-plugin')
const MiniCssExtract = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = merge(base, {
  entry: ['./src/demo.js'],
  output: {
    path: path.resolve(__dirname, '../docs'),
    clean: true,
    filename: 'js/[name].[contenthash:8].js'
  },
  mode: 'production',
  plugins: [
    new HtmlWbpk({ template: 'public/index.html' }),
    new MiniCssExtract()
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({ extractComments: false }),
      new CssMinimizerPlugin()
    ]
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtract.loader, 'css-loader']
      }
    ]
  }
})
