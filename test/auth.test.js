const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const User = require('../models/User');
const Role = require('../models/Role');

describe('Authentication Tests', function () {
  let testUser;
  let testRole;
  let authToken;
  const uniqueEmail = `john${Date.now()}@test.com`;

  // Setup before all tests
  before(async function () {
    // Create test role
    testRole = await Role.findOne({ name: 'USER' });
    if (!testRole) {
      testRole = new Role({ name: 'USER' });
      await testRole.save();
    }
  });

  // Cleanup after each test
  afterEach(async function () {
    if (testUser) {
      await User.deleteOne({ _id: testUser._id });
      testUser = null;
    }
    authToken = null;
  });

  describe('POST /api/auth/v1/register', function () {
    it('should register a new user successfully', async function () {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        nickname: 'johnny',
        email: uniqueEmail,
        password: 'password123',
      };

      const res = await request(app).post('/api/auth/v1/register').send(userData);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('email', uniqueEmail);

      // Store user for cleanup
      testUser = await User.findOne({ email: uniqueEmail });
    });

    it('should return 400 for duplicate email', async function () {
      // Ensure a user exists with the same email
      const existing = await User.findOne({ email: uniqueEmail });
      if (!existing) {
        await User.create({
          firstName: 'John',
          lastName: 'Doe',
          email: uniqueEmail,
          password: 'password123',
          role: testRole._id,
        });
      }

      const userData = {
        firstName: 'Jane',
        lastName: 'Doe',
        nickname: 'jane_d',
        email: uniqueEmail,
        password: 'password123',
      };

      const res = await request(app).post('/api/auth/v1/register').send(userData);

      expect(res.status).to.equal(400);
    });

    it('should return 400 for invalid email format', async function () {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        nickname: 'tuus',
        email: 'invalid-email',
        password: 'password123',
      };

      const res = await request(app).post('/api/auth/v1/register').send(userData);

      expect(res.status).to.equal(400);
    });

    it('should return 400 for missing required fields', async function () {
      const userData = {
        firstName: 'Test',
        // Missing lastName, nickname, email, password
      };

      const res = await request(app).post('/api/auth/v1/register').send(userData);

      expect(res.status).to.equal(400);
    });
  });

  describe('POST /api/auth/v1/login', function () {
    beforeEach(async function () {
      // Create a test user for login tests
      testUser = new User({
        firstName: 'Test',
        lastName: 'User',
        email: `testuser${Date.now()}@test.com`,
        password: 'password123',
        role: testRole._id,
      });
      await testUser.save();
    });

    it('should login with valid credentials', async function () {
      const loginData = {
        email: testUser.email,
        password: 'password123',
      };

      const res = await request(app).post('/api/auth/v1/login').send(loginData);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('message', 'Login successful');
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('email', testUser.email);

      authToken = res.body.token;
    });

    it('should return 401 for invalid email', async function () {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'password123',
      };

      const res = await request(app).post('/api/auth/v1/login').send(loginData);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Invalid credentials');
    });

    it('should return 401 for invalid password', async function () {
      const loginData = {
        email: testUser.email,
        password: 'wrongpassword',
      };

      const res = await request(app).post('/api/auth/v1/login').send(loginData);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Invalid credentials');
    });

    it('should return 401 for missing credentials', async function () {
      const res = await request(app).post('/api/auth/v1/login').send({});

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('POST /api/auth/v1/logout', function () {
    beforeEach(async function () {
      // Create a test user and get token
      testUser = new User({
        firstName: 'Test',
        lastName: 'User',
        email: `testuser${Date.now()}@test.com`,
        password: 'password123',
        role: testRole._id,
      });
      await testUser.save();

      // Login to get token
      const loginRes = await request(app).post('/api/auth/v1/login').send({
        email: testUser.email,
        password: 'password123',
      });

      authToken = loginRes.body.token;
    });

    it('should logout successfully with valid token', async function () {
      const res = await request(app)
        .post('/api/auth/v1/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property(
        'message',
        'Logged out successfully. Please remove the token from client.'
      );
    });

    it('should return 401 without token', async function () {
      const res = await request(app).post('/api/auth/v1/logout');

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 401 with invalid token', async function () {
      const res = await request(app)
        .post('/api/auth/v1/logout')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });
  });
});
