const cron = require('node-cron')
const express = require('express')
const app = express()

const Experiment = require('./experiment')

const experiments = {}

async function createExperiment(experiment) {
  // 0 create uuid
  // 1 store experiment config in redis
  // 2 scheduler->createTask
  // 3 store in cache
}

async function readExperiments(experimentId) {
  // scheduler->getTasks
}

async function updateExperiment(experiment) {
  // scheduler->getTasks
}

async function deleteExperiment(experimentId) {
  // scheduler->getTasks
}

async function startJob() {
  log('start worker')

  const worker = process.env.WORKER || 'http://localhost:9000/jobs'

  let workerResp

  try {
    workerResp = await post(worker, experiment, {
      headers: {'content-type': 'application/json'}
    })

    log(`Job created: jobId=[${workerResp.data.id}]`)
  } catch(error) {
    const response = error.response

    switch (response.status) {
      case 303:
        log('Job refused: ', response.statusText)
        break
    }
  }
}

const experiment = {
  url: 'https://news.ycombinator.com',
  connectivity: {
    alias: 'Cable_100Mbit',
    downstream: 5 * 1000,
    upstream: 1.5 * 1000,
    latency: 50
  }
}

// BOOT
// 1. load all active experiments from redis
// 2. for each experiment: register cron task




app.post('/experiments', async (req, res) => {
  const experimentConfig = req.body

  const newExperiment = new Experiment()
  newExperiment.setProps(experimentConfig)
  newExperiment.save()

  const task = cron.schedule(newExperiment.cronExpression, startJob.bind({ newExperiment }));

  const id = newExperiment.id
  experiments[id] = { task, experiment: newExperiment }

  res.json(newExperiment)
})

app.get('/experiments/:id', async (req, res) => {
  const id = req.params.id

  let experiment = experiments[id]
  
  if (!experiment) {
    experiment = new Experiment()
    
    try {
      await experiment.loadOne(id)
    } catch (error) {
      return res.sendStatus(404)
    }
  }

  res.json(experiment)
})

app.put('/experiments/:id', async (req, res) => {
  const id = req.params.id
  const data
  const experiment = new Experiment()
  experiment.loadOne(id)
  experiment.setProps(data)
  const updatedExperiment = experiment.save()

  res.json(updatedExperiment)
})

app.delete('/experiments/:id', async (req, res) => {
  const id = req.params.id

  const experiment = new Experiment()
  experiment.delete(id)

  res.sendStatus(204)
})

module.exports = app
