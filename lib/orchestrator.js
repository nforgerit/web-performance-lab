const express = require('express')
const bodyParser = require('body-parser')
const { spawn } = require('child_process')

const app = express()

const DOCKER_DOWN_REGEX = /docker\: Cannot connect to the Docker daemon/

let currentJob = null
let health = null

app.use(bodyParser.json())

const createWorkerConfig = config => {
  const workerConfig = {
    command: 'docker',
    params: [
      'run',
      '--rm',
      '-v',
      `${__dirname}:/sitespeed.io`,
      'sitespeedio/sitespeed.io',
      config.url || 'https://www.sitespeed.io',
      '-b',
      config.browser || 'firefox'
    ]
  }

  return workerConfig
}

const startWorker = config => {
  const cfg = createWorkerConfig(config)

  const sub = spawn(cfg.command, cfg.params)

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
  })

  return { id: sub.pid }
}

app.post('/jobs', (req, res) => {
  if (currentJob) {
    res.status(303).json({ jobId: currentJob.id })
  }

  const config = req.body

  currentJob = startWorker(config)

  res.status(201)
    .type('json')
    .send(currentJob)
})

module.exports = app
