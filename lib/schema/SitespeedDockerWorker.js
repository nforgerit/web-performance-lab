var path = require('path');
var appDir = path.dirname(require.main.filename);

const log = console.log

class DockerWorker {

  constructor({browser, viewport, connectivity, url}) {
    this.browser = browser
    this.viewport = viewport
    this.url = url
    this.connectivity = connectivity

    this.cleanUpContainer = true
    this.mountVolumes = [`${appDir}/sitespeed-out:/sitespeed.io`]
    this.dockerImage = 'sitespeedio/sitespeed.io:11.5.1'
    this.sitespeedConfig = '/opt/sitespeedDefaultConfig.json'
    this.sharedMemorySize = '2g'

    this.graphiteHost = 'graphite'
    this.grafanaHost = 'grafana'
    this.dockerNetwork = 'web-performance-lab_backend'
  }

  get command() {
    return 'docker'
  }

  get action() {
    return 'run'
  }

  get params() {
    const params = []
    params.push(this.action)

    // TODO find a way to determine the calling container's network name
    params.push('--network', this.dockerNetwork)

    if (this.sharedMemorySize) {
      params.push('--shm-size', this.sharedMemorySize)
    }
    
    if (this.cleanUpContainer) {
      params.push('--rm')
    }
    
    if (this.mountVolumes.length) {
      this.mountVolumes.map(volume => {
        params.push('-v', volume)
      })
    }

    params.push(this.dockerImage)
    // params.push('--config', this.sitespeedConfig)
    params.push(this.url)
    params.push('--browsertime.browser', this.browser)

    params.push('--browsertime.connectivity.profile', 'custom')
    params.push('--browsertime.connectivity.alias', this.connectivity.alias)
    params.push('--browsertime.connectivity.downstreamKbps', this.connectivity.downstream)
    params.push('--browsertime.connectivity.upstreamKbps', this.connectivity.upstream)
    params.push('--browsertime.connectivity.latency', this.connectivity.latency)

    params.push('--browsertime.visualMetrics', true)

    params.push('--graphite.host', this.graphiteHost)
    params.push('--grafana.host', this.grafanaHost)

    log('Sitespeed params: ', JSON.stringify(params))

    return params
  }

}

module.exports = DockerWorker
