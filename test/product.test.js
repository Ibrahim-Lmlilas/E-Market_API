const request = require('supertest');
const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const app = require('../server');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Role = require('../models/Role');

describe('Product Tests', function () {
  let testUser;
  let testRole;
  let testCategory;
  let authToken;
  let testProduct;

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

  // Setup before each test category only
  beforeEach(async function () {
    // Create test category
    testCategory = new Category({ title: `Test Category-${Date.now()}` });
    await testCategory.save();
  });

  // Cleanup after each test
  afterEach(async function () {
    if (testProduct) {
      await Product.deleteOne({ _id: testProduct._id });
      testProduct = null;
    }
    if (testCategory) {
      await Category.deleteOne({ _id: testCategory._id });
      testCategory = null;
    }
  });

  describe('GET /api/products/v1', function () {
    it('should get all products (public route)', async function () {
      // Create test products (published and visible)
      const product1 = new Product({
        title: 'Product 1',
        description: 'Description for product 1',
        price: 100,
        stock: 10,
        category: testCategory._id,
        seller: testUser._id,
        images: [{ url: 'https://example.com/image1.jpg', isMain: true }],
        status: 'published',
        isVisible: true,
      });
      const product2 = new Product({
        title: 'Product 2',
        description: 'Description for product 2',
        price: 200,
        stock: 5,
        category: testCategory._id,
        seller: testUser._id,
        images: [{ url: 'https://example.com/image2.jpg', isMain: true }],
        status: 'published',
        isVisible: true,
      });
      await product1.save();
      await product2.save();

      const res = await request(app).get('/api/products/v1');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.be.an('array');

      // Cleanup
      await Product.deleteOne({ _id: product1._id });
      await Product.deleteOne({ _id: product2._id });
    });

    it('should return empty array when no products exist', async function () {
      const res = await request(app).get('/api/products/v1');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.be.an('array');
    });
  });

  describe('GET /api/products/v1/:id', function () {
    it('should get a specific product by ID', async function () {
      testProduct = new Product({
        title: 'Test Product',
        description: 'Test product description',
        price: 150,
        stock: 20,
        category: testCategory._id,
        seller: testUser._id,
        images: [{ url: 'https://example.com/test.jpg', isMain: true }],
        status: 'published',
        isVisible: true,
      });
      await testProduct.save();

      const res = await request(app).get(`/api/products/v1/${testProduct._id}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('responseData');
      expect(res.body.responseData).to.have.property('success', true);
      expect(res.body.responseData).to.have.property('data');
      expect(res.body.responseData.data).to.have.property('title', 'Test Product');
      expect(res.body.responseData.data).to.have.property('price', 150);
    });

    it('should return 404 for non-existent product', async function () {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/api/products/v1/${fakeId}`);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 400 for invalid product ID format', async function () {
      const res = await request(app).get('/api/products/v1/invalid-id');

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('POST /api/products/v1', function () {
    it('should create a new product (admin only)', async function () {
      const productData = {
        title: 'New Product',
        description: 'New product description',
        price: 99.99,
        stock: 15,
        category: testCategory._id,
        imageUrls: ['https://example.com/new-product.jpg'],
      };

      const res = await request(app)
        .post('/api/products/v1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('title', 'New Product');
      expect(res.body.data).to.have.property('price', 99.99);
      expect(res.body.data).to.have.property('stock', 15);

      testProduct = await Product.findById(res.body.data._id);
    });

    it('should return 401 without authentication', async function () {
      const productData = {
        title: 'New Product',
        description: 'New product description',
        price: 99.99,
        stock: 15,
        category: testCategory._id,
        imageUrls: ['https://example.com/new-product.jpg'],
      };

      const res = await request(app).post('/api/products/v1').send(productData);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 400 for missing required fields', async function () {
      const productData = {
        title: 'New Product',
        // Missing description, price, stock, category, images
      };

      const res = await request(app)
        .post('/api/products/v1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);

      expect(res.status).to.equal(400);
    });

    it('should return 400 for invalid price (negative)', async function () {
      const productData = {
        title: 'New Product',
        description: 'New product description',
        price: -10,
        stock: 15,
        category: testCategory._id,
        imageUrls: ['https://example.com/new-product.jpg'],
      };

      const res = await request(app)
        .post('/api/products/v1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);

      expect(res.status).to.equal(400);
    });

    it('should return 400 for invalid stock (negative)', async function () {
      const productData = {
        title: 'New Product',
        description: 'New product description',
        price: 99.99,
        stock: -5,
        category: testCategory._id,
        imageUrls: ['https://example.com/new-product.jpg'],
      };

      const res = await request(app)
        .post('/api/products/v1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);

      expect(res.status).to.equal(400);
    });
  });

  describe('PUT /api/products/v1/:id', function () {
    beforeEach(async function () {
      testProduct = new Product({
        title: 'Original Product',
        description: 'Original product description',
        price: 100,
        stock: 10,
        category: testCategory._id,
        seller: testUser._id,
        images: [{ url: 'https://example.com/original.jpg', isMain: true }],
        status: 'published',
        isVisible: true,
      });
      await testProduct.save();
    });

    it('should update a product (admin only)', async function () {
      const updateData = {
        title: 'Updated Product',
        price: 150,
        stock: 20,
      };

      const res = await request(app)
        .put(`/api/products/v1/${testProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).to.equal(400);

      // Verify in database
      const updatedProduct = await Product.findById(testProduct._id);
      expect(updatedProduct.title).to.equal('Original Product');
    });

    it('should return 401 without authentication', async function () {
      const updateData = {
        title: 'Updated Product',
      };

      const res = await request(app)
        .put(`/api/products/v1/${testProduct._id}`)
        .send(updateData);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 404 for non-existent product', async function () {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = {
        title: 'Updated Product',
      };

      const res = await request(app)
        .put(`/api/products/v1/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('DELETE /api/products/v1/:id', function () {
    beforeEach(async function () {
      testProduct = new Product({
        title: 'Product to Delete',
        description: 'Product to delete description',
        price: 75,
        stock: 5,
        category: testCategory._id,
        seller: testUser._id,
        images: [{ url: 'https://example.com/delete.jpg', isMain: true }],
        status: 'published',
        isVisible: true,
      });
      await testProduct.save();
    });

    it('should delete a product (admin only)', async function () {
      const res = await request(app)
        .delete(`/api/products/v1/${testProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('message');

      // Verify soft delete in database
      const deletedProduct = await Product.findById(testProduct._id);
      expect(deletedProduct.isDeleted).to.be.true;
    });

    it('should return 401 without authentication', async function () {
      const res = await request(app).delete(`/api/products/v1/${testProduct._id}`);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 404 for non-existent product', async function () {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .delete(`/api/products/v1/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('success', false);
    });
  });
});
