const HTTP_PORT = process.env.HTTP_PORT || 8080
const RUN_MODE = process.env.MODE


if (RUN_MODE === 'master') {
  console.log('Starting in Master mode on port ' + HTTP_PORT)
  app = require('./lib/orchestrator')
} else {
  console.log('Starting in Worker mode on port ' + HTTP_PORT)
  app = require('./lib/worker')
}

app.listen(HTTP_PORT)
