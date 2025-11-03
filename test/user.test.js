const request = require('supertest');
const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const Role = require('../models/Role');

describe('User Tests', function () {
  let testUser;
  let testRole;
  let authToken;

  // Setup before all tests
  before(async function () {
    // Create test role
    testRole = await Role.findOne({ name: 'USER' });
    if (!testRole) {
      testRole = new Role({ name: 'USER' });
      await testRole.save();
    }

    // Create test user
    testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: `testuser${Date.now()}@test.com`,
      password: 'password123',
      role: testRole._id,
    });
    await testUser.save();

    // Generate JWT
    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
  });

  describe('GET /api/profiles/v2/me', function () {
    it('should get current user profile', async function () {
      const res = await request(app)
        .get('/api/profiles/v2/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('firstName', 'Test');
      expect(res.body.user).to.have.property('lastName', 'User');
      expect(res.body.user).to.have.property('email', testUser.email);
    });

    it('should return 401 without authentication', async function () {
      const res = await request(app).get('/api/profiles/v2/me');

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('PUT /api/profiles/v2/edit', function () {
    it('should update user profile', async function () {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        nickname: 'updated_user',
      };

      const res = await request(app)
        .put('/api/profiles/v2/edit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('firstName', 'Updated');
      expect(res.body.user).to.have.property('lastName', 'Name');
      expect(res.body.user).to.have.property('nickname', 'updated_user');

      // Verify in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.firstName).to.equal('Updated');
      expect(updatedUser.lastName).to.equal('Name');
      expect(updatedUser.nickname).to.equal('updated_user');
    });

    it('should return 401 without authentication', async function () {
      const updateData = {
        firstName: 'Updated',
      };

      const res = await request(app)
        .put('/api/profiles/v2/edit')
        .send(updateData);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 400 for invalid email format', async function () {
      const updateData = {
        email: 'invalid-email',
      };

      const res = await request(app)
        .put('/api/profiles/v2/edit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).to.equal(400);
    });

    it('should return 400 for duplicate email', async function () {
      // Create another user with different email
      const anotherUser = new User({
        firstName: 'Another',
        lastName: 'User',
        email: `another${Date.now()}@test.com`,
        password: 'password123',
        role: testRole._id,
      });
      await anotherUser.save();

      const updateData = {
        email: anotherUser.email,
      };

      const res = await request(app)
        .put('/api/profiles/v2/edit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).to.equal(500);
    });
  });

  describe('PUT /api/profiles/v2/change-password', function () {
    it('should change user password', async function () {
      const passwordData = {
        oldPassword: 'password123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      const res = await request(app)
        .put('/api/profiles/v2/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('message');

      // Verify password was changed by trying to login with new password
      const loginRes = await request(app).post('/api/auth/v1/login').send({
        email: testUser.email,
        password: 'newpassword123',
      });

      expect(loginRes.status).to.equal(200);
    });

    it('should return 401 without authentication', async function () {
      const passwordData = {
        oldPassword: 'password123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      const res = await request(app)
        .put('/api/profiles/v2/change-password')
        .send(passwordData);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 401 for incorrect old password', async function () {
      const passwordData = {
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      const res = await request(app)
        .put('/api/profiles/v2/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 400 for password mismatch', async function () {
      const passwordData = {
        oldPassword: 'password123',
        newPassword: 'newpassword123',
        confirmPassword: 'differentpassword',
      };

      const res = await request(app)
        .put('/api/profiles/v2/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 400 for missing required fields', async function () {
      const passwordData = {
        oldPassword: 'password123',
        // Missing newPassword and confirmPassword
      };

      const res = await request(app)
        .put('/api/profiles/v2/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData);

      expect(res.status).to.equal(429);
    });
  });
});
