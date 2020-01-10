const express = require('express')
const bodyParser = require('body-parser')
const { spawn } = require('child_process')

const DockerWorker = require('./schema/SitespeedDockerWorker')

const app = express()

const DOCKER_DOWN_REGEX = /docker\: Cannot connect to the Docker daemon/

let currentJob = null
let health = null

app.use(bodyParser.json())

const createWorker = config => {
  const workerConfig = new DockerWorker({
    browser: config.browser || 'chrome',
    viewport: config.viewport || 'mobile',
    connectivity: {
      alias: config.connectivity.alias || 'Cable_100Mbit',
      downstream: config.connectivity.downstream || 100 * 1000,
      upstream: config.connectivity.upstream || 30 * 1000,
      latency: config.connectivity.latency || 30
    },
    url: config.url,
  })

  return workerConfig
}

const startWorker = config => {
  const worker = createWorker(config)

  const sub = spawn(worker.command, worker.params)

  sub.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })

  sub.stderr.on('data', (data) => {
    if (String(data).match(DOCKER_DOWN_REGEX)) {
      health = false
      return
    }

    console.error(`stderr: ${data}`)
  })

  sub.on('close', (code) => {
    console.log(`child process exited with code ${code}`)
    currentJob = null
  })

  return { id: sub.pid }
}

app.post('/jobs', (req, res) => {
  const config = req.body

  if (!config.url) {
    return res.status(404).json({ error: 'Param "URL" required'})
  }

  if (currentJob) {
    return res.status(303).json({ jobId: currentJob.id })
  }

  currentJob = startWorker(config)

  return res.status(201)
    .type('json')
    .send(currentJob)
})

module.exports = app
