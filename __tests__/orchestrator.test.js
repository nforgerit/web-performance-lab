const request = require('supertest')

const orchestrator = require('../lib/orchestrator.js')

describe('The Orchestrator', () => {
  /**
   *  TODO add mock for redis and create test for "database AVL" 
   **/

  it('provides health metrics for "database N/A"', done => {
    request(orchestrator)
      .get('/_health')
      .expect(503, done)
  })
})
