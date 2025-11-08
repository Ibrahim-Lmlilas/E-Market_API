const request = require('supertest');
const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const app = require('../server');
const Cart = require('../models/cart');
const CartItem = require('../models/cartItem');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Role = require('../models/Role');

describe('Cart Tests', function () {
  let testUser;
  let testRole;
  let testCategory;
  let testProduct;
  let authToken;
  let testCart;
  let testCartItem;

  // Setup before all tests
  before(async function () {
    // Create test role
    testRole = await Role.findOne({ name: 'USER' });
    if (!testRole) {
      testRole = new Role({ name: 'USER' });
      await testRole.save();
    }

    // Create test user and generate JWT
    testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: `testuser${Date.now()}@test.com`,
      password: 'password123',
      role: testRole._id,
    });
    await testUser.save();

    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
  });

  // Setup before each test
  beforeEach(async function () {
    // Create test category
    testCategory = new Category({ title: `Test Category-${Date.now()}` });
    await testCategory.save();

    // Create test product
    testProduct = new Product({
      title: 'Test Product',
      description: 'Test product description',
      price: 100,
      stock: 50,
      category: testCategory._id,
      seller: testUser._id,
      images: [{ url: 'https://example.com/test.jpg', isMain: true }],
      status: 'published',
      isVisible: true,
    });
    await testProduct.save();

    // Create a cart for the user via API (correct base)
    const createCartRes = await request(app)
      .post('/api/v2/carts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId: testUser._id });
    testCart = createCartRes.body.data;
  });

  // Cleanup after each test
  afterEach(async function () {
    if (testCartItem) {
      await CartItem.deleteOne({ _id: testCartItem._id });
      testCartItem = null;
    }
    if (testCart) {
      await Cart.deleteOne({ _id: testCart._id });
      testCart = null;
    }
    if (testProduct) {
      await Product.deleteOne({ _id: testProduct._id });
      testProduct = null;
    }
    if (testCategory) {
      await Category.deleteOne({ _id: testCategory._id });
      testCategory = null;
    }
  });

  describe('GET /api/v2/carts/me', function () {
    it('should get user cart (authenticated)', async function () {
      const res = await request(app)
        .get('/api/v2/carts/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
    });

    it('should return 401 without authentication', async function () {
      const res = await request(app).get('/api/v2/carts/me');

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('POST /api/v2/carts/mycart/items', function () {
    it('should add item to cart', async function () {
      const cartItemData = {
        cart_id: testCart._id,
        product_id: testProduct._id,
        quantity: 2,
      };

      const res = await request(app)
        .post('/api/v2/carts/mycart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cartItemData);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property(
        'product_id',
        testProduct._id.toString()
      );
      expect(res.body.data).to.have.property('quantity', 2);

      testCartItem = await CartItem.findOne({ product_id: testProduct._id });
    });

    it('should return 401 without authentication', async function () {
      const cartItemData = {
        cart_id: testCart._id,
        product_id: testProduct._id,
        quantity: 2,
      };

      const res = await request(app)
        .post('/api/v2/carts/mycart/items')
        .send(cartItemData);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 400 for missing product_id', async function () {
      const cartItemData = {
        cart_id: testCart._id,
        quantity: 2,
      };

      const res = await request(app)
        .post('/api/v2/carts/mycart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cartItemData);

      expect(res.status).to.equal(400);
    });

    it('should return 400 for missing quantity', async function () {
      const cartItemData = {
        cart_id: testCart._id,
        product_id: testProduct._id,
      };

      const res = await request(app)
        .post('/api/v2/carts/mycart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cartItemData);

      expect(res.status).to.equal(400);
    });

    it('should return 400 for invalid product_id', async function () {
      const cartItemData = {
        cart_id: testCart._id,
        product_id: 'invalid-id',
        quantity: 2,
      };

      const res = await request(app)
        .post('/api/v2/carts/mycart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cartItemData);

      expect(res.status).to.equal(500);
    });

    it('should return 404 for non-existent product', async function () {
      const fakeId = '507f1f77bcf86cd799439011';
      const cartItemData = {
        cart_id: testCart._id,
        product_id: fakeId,
        quantity: 2,
      };

      const res = await request(app)
        .post('/api/v2/carts/mycart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cartItemData);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('PUT /api/v2/carts/user/:cartId/items/:cartItemId', function () {
    beforeEach(async function () {
      // Create test cart item
      testCartItem = new CartItem({
        cart_id: testCart._id,
        product_id: testProduct._id,
        quantity: 1,
        price: 100,
      });
      await testCartItem.save();
    });

    it('should update cart item quantity', async function () {
      const updateData = {
        cartItemId: testCartItem._id,
        quantity: 5,
      };

      const res = await request(app)
        .put(`/api/v2/carts/user/${testCart._id}/items/${testCartItem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('quantity', 5);

      // Verify in database
      const updatedCartItem = await CartItem.findById(testCartItem._id);
      expect(updatedCartItem.quantity).to.equal(5);
    });

    it('should return 401 without authentication', async function () {
      const updateData = {
        cartItemId: testCartItem._id,
        quantity: 5,
      };

      const res = await request(app)
        .put(`/api/v2/carts/user/${testCart._id}/items/${testCartItem._id}`)
        .send(updateData);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 400 for invalid quantity', async function () {
      const updateData = {
        cartItemId: testCartItem._id,
        quantity: -1,
      };

      const res = await request(app)
        .put(`/api/v2/carts/user/${testCart._id}/items/${testCartItem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).to.equal(404);
    });

    it('should return 404 for non-existent cart item', async function () {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = {
        cartItemId: fakeId,
        quantity: 5,
      };

      const res = await request(app)
        .put(`/api/v2/carts/user/${testCart._id}/items/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('DELETE /api/v2/carts/user/:cartId/items/:cartItemId', function () {
    beforeEach(async function () {
      // Create test cart item
      testCartItem = new CartItem({
        cart_id: testCart._id,
        product_id: testProduct._id,
        quantity: 1,
        price: 100,
      });
      await testCartItem.save();
    });

    it('should remove item from cart', async function () {
      const res = await request(app)
        .delete(`/api/v2/carts/user/${testCart._id}/items/${testCartItem._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('message');

      // Verify item is deleted
      const deletedCartItem = await CartItem.findById(testCartItem._id);
      expect(deletedCartItem).to.be.null;
    });

    it('should return 401 without authentication', async function () {
      const res = await request(app).delete(
        `/api/v2/carts/user/${testCart._id}/items/${testCartItem._id}`
      );

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 404 for non-existent cart item', async function () {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .delete(`/api/v2/carts/user/${testCart._id}/items/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('DELETE /api/v2/carts/user/:cartId', function () {
    beforeEach(async function () {
      // Create test cart with items
      testCartItem = new CartItem({
        cart_id: testCart._id,
        product_id: testProduct._id,
        quantity: 2,
        price: 200,
      });
      await testCartItem.save();
    });

    it('should clear entire cart', async function () {
      const res = await request(app)
        .delete(`/api/v2/carts/user/${testCart._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('message');

      // Verify cart is cleared
      const cartItems = await CartItem.find({ cart_id: testCart._id });
      expect(cartItems.length).to.equal(0);
    });

    it('should return 401 without authentication', async function () {
      const res = await request(app).delete(`/api/v2/carts/user/${testCart._id}`);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });
  });
});
