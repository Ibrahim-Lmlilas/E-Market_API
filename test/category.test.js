const request = require('supertest');
const { expect } = require('chai');
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
  });

  // Setup before each test
  beforeEach(async function () {
    // Create test user
    testUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'password123',
      role: testRole._id,
    });
    await testUser.save();

    // Login to get token
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'password123',
    });

    authToken = loginRes.body.token;
  });

  // Cleanup after each test
  afterEach(async function () {
    if (testCategory) {
      await Category.deleteOne({ _id: testCategory._id });
      testCategory = null;
    }
    if (testUser) {
      await User.deleteOne({ _id: testUser._id });
      testUser = null;
    }
    authToken = null;
  });

  describe('GET /api/categories', function () {
    it('should get all categories (public route)', async function () {
      // Create some test categories
      const category1 = new Category({ title: 'Electronics' });
      const category2 = new Category({ title: 'Clothing' });
      await category1.save();
      await category2.save();

      const res = await request(app).get('/api/categories');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.at.least(2);

      // Cleanup
      await Category.deleteOne({ _id: category1._id });
      await Category.deleteOne({ _id: category2._id });
    });

    it('should return empty array when no categories exist', async function () {
      const res = await request(app).get('/api/categories');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.be.an('array');
    });
  });

  describe('GET /api/categories/:id', function () {
    it('should get a specific category by ID', async function () {
      testCategory = new Category({ title: 'Test Category' });
      await testCategory.save();

      const res = await request(app).get(`/api/categories/${testCategory._id}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('title', 'Test Category');
    });

    it('should return 404 for non-existent category', async function () {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/api/categories/${fakeId}`);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 400 for invalid category ID format', async function () {
      const res = await request(app).get('/api/categories/invalid-id');

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('POST /api/categories', function () {
    it('should create a new category (admin only)', async function () {
      const categoryData = {
        title: 'New Category',
      };

      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryData);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('title', 'New Category');
      expect(res.body.data).to.have.property('slug');

      testCategory = await Category.findById(res.body.data._id);
    });

    it('should return 401 without authentication', async function () {
      const categoryData = {
        title: 'New Category',
      };

      const res = await request(app).post('/api/categories').send(categoryData);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 400 for missing title', async function () {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 400 for duplicate category title', async function () {
      // Create first category
      testCategory = new Category({ title: 'Duplicate Category' });
      await testCategory.save();

      // Try to create duplicate
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Duplicate Category' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('PUT /api/categories/:id', function () {
    beforeEach(async function () {
      testCategory = new Category({ title: 'Original Category' });
      await testCategory.save();
    });

    it('should update a category (admin only)', async function () {
      const updateData = {
        title: 'Updated Category',
      };

      const res = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('title', 'Updated Category');

      // Verify in database
      const updatedCategory = await Category.findById(testCategory._id);
      expect(updatedCategory.title).to.equal('Updated Category');
    });

    it('should return 401 without authentication', async function () {
      const updateData = {
        title: 'Updated Category',
      };

      const res = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .send(updateData);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 404 for non-existent category', async function () {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = {
        title: 'Updated Category',
      };

      const res = await request(app)
        .put(`/api/categories/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('DELETE /api/categories/:id', function () {
    beforeEach(async function () {
      testCategory = new Category({ title: 'Category to Delete' });
      await testCategory.save();
    });

    it('should delete a category (admin only)', async function () {
      const res = await request(app)
        .delete(`/api/categories/${testCategory._id}`)
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
        `/api/categories/${testCategory._id}`
      );

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 404 for non-existent category', async function () {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .delete(`/api/categories/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('success', false);
    });
  });
});
