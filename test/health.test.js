const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');

describe('Health and Basic API Tests', function () {
  describe('GET /', function () {
    it('should return welcome message', async function () {
      const res = await request(app).get('/');

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('message', 'Welcome to E-Market API');
      expect(res.body).to.have.property('status', 'Server is running');
      expect(res.body).to.have.property('version', '1.0.0');
      expect(res.body).to.have.property('documentation');
    });
  });

  describe('GET /health', function () {
    it('should return health status', async function () {
      const res = await request(app).get('/health');

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('status', 'OK');
      expect(res.body).to.have.property('timestamp');
      expect(res.body).to.have.property('uptime');
      expect(res.body.uptime).to.be.a('number');
    });
  });

  describe('GET /api-docs', function () {
    it('should serve Swagger documentation', async function () {
      const res = await request(app).get('/api-docs');

      expect(res.status).to.equal(200);
      expect(res.headers['content-type']).to.include('text/html');
    });
  });

  describe('404 Error Handling', function () {
    it('should return 404 for non-existent routes', async function () {
      const res = await request(app).get('/non-existent-route');

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message');
    });
  });
});
