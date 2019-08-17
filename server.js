require('dotenv').config()

const express = require('express')
const session = require('express-session')

const path = require('path')
const app = express()
const fetch = require('node-fetch')
const utils = require('./utils')
const isReachable = require('is-reachable')

app.use('*/public', express.static('public'))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

app.get('/', async (req, res) => {
  const status = await isReachable('tailosive.net')
  return utils.renderTemplate(res, req, 'index.ejs', { status })
})

const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
