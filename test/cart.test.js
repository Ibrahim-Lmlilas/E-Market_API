const request = require('supertest');
const { expect } = require('chai');
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

    // Create test category
    testCategory = new Category({ title: 'Test Category' });
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
    });
    await testProduct.save();

    // Login to get token
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'test.user@test.com',
      password: 'password123',
    });

    authToken = loginRes.body.token;
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
    if (testUser) {
      await User.deleteOne({ _id: testUser._id });
      testUser = null;
    }
    authToken = null;
  });

  describe('GET /api/cart', function () {
    it('should get user cart (authenticated)', async function () {
      // Create test cart
      testCart = new Cart({ user: testUser._id });
      await testCart.save();

      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
    });

    it('should return 401 without authentication', async function () {
      const res = await request(app).get('/api/cart');

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('POST /api/cart/items', function () {
    it('should add item to cart', async function () {
      const cartItemData = {
        product_id: testProduct._id,
        quantity: 2,
      };

      const res = await request(app)
        .post('/api/cart/items')
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

      testCartItem = await CartItem.findOne({ product: testProduct._id });
    });

    it('should return 401 without authentication', async function () {
      const cartItemData = {
        product_id: testProduct._id,
        quantity: 2,
      };

      const res = await request(app).post('/api/cart/items').send(cartItemData);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 400 for missing product_id', async function () {
      const cartItemData = {
        quantity: 2,
      };

      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cartItemData);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 400 for missing quantity', async function () {
      const cartItemData = {
        product_id: testProduct._id,
      };

      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cartItemData);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 400 for invalid product_id', async function () {
      const cartItemData = {
        product_id: 'invalid-id',
        quantity: 2,
      };

      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cartItemData);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 404 for non-existent product', async function () {
      const fakeId = '507f1f77bcf86cd799439011';
      const cartItemData = {
        product_id: fakeId,
        quantity: 2,
      };

      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cartItemData);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('PUT /api/cart/items/:id', function () {
    beforeEach(async function () {
      // Create test cart and cart item
      testCart = new Cart({ user: testUser._id });
      await testCart.save();

      testCartItem = new CartItem({
        cart: testCart._id,
        product: testProduct._id,
        quantity: 1,
      });
      await testCartItem.save();
    });

    it('should update cart item quantity', async function () {
      const updateData = {
        quantity: 5,
      };

      const res = await request(app)
        .put(`/api/cart/items/${testCartItem._id}`)
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
        quantity: 5,
      };

      const res = await request(app)
        .put(`/api/cart/items/${testCartItem._id}`)
        .send(updateData);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 400 for invalid quantity', async function () {
      const updateData = {
        quantity: -1,
      };

      const res = await request(app)
        .put(`/api/cart/items/${testCartItem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 404 for non-existent cart item', async function () {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = {
        quantity: 5,
      };

      const res = await request(app)
        .put(`/api/cart/items/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('DELETE /api/cart/items/:id', function () {
    beforeEach(async function () {
      // Create test cart and cart item
      testCart = new Cart({ user: testUser._id });
      await testCart.save();

      testCartItem = new CartItem({
        cart: testCart._id,
        product: testProduct._id,
        quantity: 1,
      });
      await testCartItem.save();
    });

    it('should remove item from cart', async function () {
      const res = await request(app)
        .delete(`/api/cart/items/${testCartItem._id}`)
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
        `/api/cart/items/${testCartItem._id}`
      );

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should return 404 for non-existent cart item', async function () {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .delete(`/api/cart/items/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('DELETE /api/cart', function () {
    beforeEach(async function () {
      // Create test cart with items
      testCart = new Cart({ user: testUser._id });
      await testCart.save();

      testCartItem = new CartItem({
        cart: testCart._id,
        product: testProduct._id,
        quantity: 2,
      });
      await testCartItem.save();
    });

    it('should clear entire cart', async function () {
      const res = await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('message');

      // Verify cart is cleared
      const cartItems = await CartItem.find({ cart: testCart._id });
      expect(cartItems.length).to.equal(0);
    });

    it('should return 401 without authentication', async function () {
      const res = await request(app).delete('/api/cart');

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('success', false);
    });
  });
});
