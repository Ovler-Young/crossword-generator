const { merge } = require('webpack-merge')
const base = require('./webpack.base.js')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = merge(base, {
  entry: ['./src/App.js'],
  output: {
    clean: true,
    library: { type: 'commonjs2' },
    filename: 'crossword-generator.min.js'
  },
  mode: 'production',
  stats: {
    timings: false,
    builtAt: false,
    children: false,
    entrypoints: false,
    hash: false,
    modules: false
  },
  optimization: {
    minimizer: [
      new TerserPlugin({ extractComments: false })
    ]
  }
})
