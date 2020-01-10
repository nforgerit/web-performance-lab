const express = require('express')
const bodyParser = require('body-parser')

const post = require('axios').post

const redisMiddleware = require('./redisMiddleware')
const experimentsApi = require('./experiments')

const app = express()
const log = console.log

app.use(bodyParser.json())
app.use(redisMiddleware)
app.use(experimentsApi)


app.get('/_health', async (req, res) => {
  const pong = req.redis.ping()

  if (!pong) {
    return res.sendStatus(503)
  }

  return res.sendStatus(204)
})

module.exports = app
