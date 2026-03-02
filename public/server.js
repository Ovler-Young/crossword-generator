const express = require('express')
const webpack = require('webpack')
const wdm = require('webpack-dev-middleware')
const whm = require('webpack-hot-middleware')
const config = require('./webpack.dev.js')
const getPort = require('get-port')
const address = require('address')

const app = express()

config.entry.push('webpack-hot-middleware/client?reload=true')

;(async () => {
  const port = await getPort({ port: 4000, host: '0.0.0.0' })
  const compiler = webpack(config)

  app.use(wdm(compiler, { publicPath: '/' }))
  app.use(whm(compiler, { log: false }))

  app.listen(port, () => {
    console.log(`\thttp://localhost:${port}`)
    console.log(`\thttp://${address.ip()}:${port}`)
  })
})()
