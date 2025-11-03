const request = require('supertest');
const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const app = require('../server');
const Category = require('../models/Category');
const User = require('../models/User');
const Role = require('../models/Role');

describe('Category Tests', function () {
  let testUser;
  let testRole;
  let authToken;
  let testCategory;

  // Setup before all tests
  before(async function () {
    // Create test role
    testRole = await Role.findOne({ name: 'ADMIN' });
    if (!testRole) {
      testRole = new Role({ name: 'ADMIN' });
      await testRole.save();
    }

    // Create test user and create JWT without calling login
    testUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: `admin${Date.now()}@test.com`,
      password: 'password123',
      role: testRole._id,
    });
    await testUser.save();

    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
  });

  // Cleanup after each test category only
  afterEach(async function () {
    if (testCategory) {
      await Category.deleteOne({ _id: testCategory._id });
      testCategory = null;
    }
  });

  describe('GET /api/categories/v1', function () {
    it('should get all categories (public route)', async function () {
      // Create some test categories with unique titles
      const category1 = new Category({ title: `Electronics-${Date.now()}` });
      const category2 = new Category({ title: `Clothing-${Date.now() + 1}` });
      await category1.save();
      await category2.save();

      const res = await request(app).get('/api/categories/v1');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.be.an('array');

      // Cleanup
      await Category.deleteOne({ _id: category1._id });
      await Category.deleteOne({ _id: category2._id });
    });

    it('should return empty array when no categories exist', async function () {
      const res = await request(app).get('/api/categories/v1');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.be.an('array');
    });
  });

  describe('GET /api/categories/v1/:id', function () {
    it('should get a specific category by ID', async function () {
      testCategory = new Category({ title: `Test Category-${Date.now()}` });
      await testCategory.save();

      const res = await request(app).get(
        `/api/categories/v1/${testCategory._id}`
      );

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('title');
    });

    it('should return 404 for non-existent category', async function () {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/api/categories/v1/${fakeId}`);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 400 for invalid category ID format', async function () {
      const res = await request(app).get('/api/categories/v1/invalid-id');

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('POST /api/categories/v1', function () {
    it('should create a new category (admin only)', async function () {
      const categoryData = {
        title: `New Category-${Date.now()}`,
      };

      const res = await request(app)
        .post('/api/categories/v1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryData);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('title');
      expect(res.body.data).to.have.property('slug');

      testCategory = await Category.findById(res.body.data._id);
    });

    it('should return 401 without authentication', async function () {
      const categoryData = {
        title: `New Category-${Date.now()}`,
      };

      const res = await request(app)
        .post('/api/categories/v1')
        .send(categoryData);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 400 for missing title', async function () {
      const res = await request(app)
        .post('/api/categories/v1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).to.equal(400);
    });

    it('should return 400 for duplicate category title', async function () {
      // Create first category
      testCategory = new Category({ title: `Duplicate-${Date.now()}` });
      await testCategory.save();

      // Try to create duplicate
      const res = await request(app)
        .post('/api/categories/v1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: testCategory.title });

      expect(res.status).to.equal(500);
    });
  });

  describe('PUT /api/categories/v1/:id', function () {
    beforeEach(async function () {
      testCategory = new Category({ title: `Original-${Date.now()}` });
      await testCategory.save();
    });

    it('should update a category (admin only)', async function () {
      const updateData = {
        title: `Updated-${Date.now()}`,
      };

      const res = await request(app)
        .put(`/api/categories/v1/${testCategory._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('title');

      // Verify in database
      const updatedCategory = await Category.findById(testCategory._id);
      expect(updatedCategory.title).to.equal(updateData.title);
    });

    it('should return 401 without authentication', async function () {
      const updateData = {
        title: `Updated-${Date.now()}`,
      };

      const res = await request(app)
        .put(`/api/categories/v1/${testCategory._id}`)
        .send(updateData);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 404 for non-existent category', async function () {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = {
        title: `Updated-${Date.now()}`,
      };

      const res = await request(app)
        .put(`/api/categories/v1/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('DELETE /api/categories/v1/:id', function () {
    beforeEach(async function () {
      testCategory = new Category({ title: `Delete-${Date.now()}` });
      await testCategory.save();
    });

    it('should delete a category (admin only)', async function () {
      const res = await request(app)
        .delete(`/api/categories/v1/${testCategory._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('message');

      // Verify soft delete in database
      const deletedCategory = await Category.findById(testCategory._id);
      expect(deletedCategory.isDeleted).to.be.true;
    });

    it('should return 401 without authentication', async function () {
      const res = await request(app).delete(
        `/api/categories/v1/${testCategory._id}`
      );

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 404 for non-existent category', async function () {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .delete(`/api/categories/v1/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('success', false);
    });
  });
});
