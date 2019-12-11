const request = require('supertest')

const worker = require('../lib/worker.js')

describe('The Worker', () => {
  it('accepts Jobs', done => {
    request(worker)
      .post('/jobs')
      .send({url:'https://sitespeed.io'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201, done)
  })

  it('refuses additional jobs when busy', done => {
    request(worker).post('/jobs').then(() => {
      request(worker)
        .post('/jobs')
        .send({url:'https://sitespeed.io'})
        .expect(303, done)
    })
  })

  it('refuses to start a job without a URL', done => {
    request(worker)
      .post('/jobs')
      .send({url: ''})
      .expect(404, done)
  })
})
