const request = require('supertest');
const { expect } = require('chai');
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
  });

  // Setup before each test
  beforeEach(async function () {
    // Create test user
    testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@test.com',
      password: 'password123',
      role: testRole._id,
    });
    await testUser.save();

    // Login to get token
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'test.user@test.com',
      password: 'password123',
    });

    authToken = loginRes.body.token;
  });

  // Cleanup after each test
  afterEach(async function () {
    if (testUser) {
      await User.deleteOne({ _id: testUser._id });
      testUser = null;
    }
    authToken = null;
  });

  describe('GET /api/profiles/me', function () {
    it('should get current user profile', async function () {
      const res = await request(app)
        .get('/api/profiles/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('firstName', 'Test');
      expect(res.body.data).to.have.property('lastName', 'User');
      expect(res.body.data).to.have.property('email', 'test.user@test.com');
      expect(res.body.data).to.not.have.property('password');
    });

    it('should return 401 without authentication', async function () {
      const res = await request(app).get('/api/profiles/me');

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('PUT /api/profiles/me', function () {
    it('should update user profile', async function () {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        nickname: 'updated_user',
      };

      const res = await request(app)
        .put('/api/profiles/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('firstName', 'Updated');
      expect(res.body.data).to.have.property('lastName', 'Name');
      expect(res.body.data).to.have.property('nickname', 'updated_user');

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

      const res = await request(app).put('/api/profiles/me').send(updateData);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 400 for invalid email format', async function () {
      const updateData = {
        email: 'invalid-email',
      };

      const res = await request(app)
        .put('/api/profiles/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 400 for duplicate email', async function () {
      // Create another user with different email
      const anotherUser = new User({
        firstName: 'Another',
        lastName: 'User',
        email: 'another@test.com',
        password: 'password123',
        role: testRole._id,
      });
      await anotherUser.save();

      const updateData = {
        email: 'another@test.com',
      };

      const res = await request(app)
        .put('/api/profiles/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('success', false);

      // Cleanup
      await User.deleteOne({ _id: anotherUser._id });
    });
  });

  describe('PUT /api/profiles/change-password', function () {
    it('should change user password', async function () {
      const passwordData = {
        oldPassword: 'password123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      const res = await request(app)
        .put('/api/profiles/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('message');

      // Verify password was changed by trying to login with new password
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'test.user@test.com',
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
        .put('/api/profiles/change-password')
        .send(passwordData);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 400 for incorrect old password', async function () {
      const passwordData = {
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      const res = await request(app)
        .put('/api/profiles/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 400 for password mismatch', async function () {
      const passwordData = {
        oldPassword: 'password123',
        newPassword: 'newpassword123',
        confirmPassword: 'differentpassword',
      };

      const res = await request(app)
        .put('/api/profiles/change-password')
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
        .put('/api/profiles/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('DELETE /api/profiles/me', function () {
    it('should delete user account', async function () {
      const res = await request(app)
        .delete('/api/profiles/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('message');

      // Verify soft delete in database
      const deletedUser = await User.findById(testUser._id);
      expect(deletedUser.isDeleted).to.be.true;
    });

    it('should return 401 without authentication', async function () {
      const res = await request(app).delete('/api/profiles/me');

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });
  });
});
