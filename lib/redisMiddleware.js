const bluebird = require('bluebird')
const redis = require("redis")
bluebird.promisifyAll(redis);

const log = console.log

// TODO this might fail and needs to be caught
const REDIS_URL = process.env.REDIS_URL
const redisClient = redis.createClient(REDIS_URL)

redisClient.on('ready', () => log(`redis ready`))
redisClient.on('connected', () => log(`redis connected`))
redisClient.on('reconnecting', ({delay, attempt, error}) => log(`redis reconnecting: delay=[${delay}] attempt=[${attempt}] error=[${error}]`))
redisClient.on('error', (error) => log(`redis error=[${error}]`))
redisClient.on('end', () => log(`redis end`))
redisClient.on('warning', (inp) => log(`redis warning: ` + JSON.stringify(inp)))

function middleware(req, res, next) {
  log('redis middleware called')
  req.redis = redisClient
  next()
}

module.exports = middleware