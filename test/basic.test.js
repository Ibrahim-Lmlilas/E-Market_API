const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');

describe('Basic API Test', function () {
  it('should return 200 on GET /', async function () {
    const res = await request(app).get('/');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('message');
  });
});
