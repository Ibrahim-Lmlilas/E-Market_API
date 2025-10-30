const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Market API Documentation',
      version: '1.0.0',
      description:
        'API e-commerce avec Express et MongoDB - Gestion des produits, catégories et utilisateurs',
      contact: {
        name: 'E-Market Team',
        email: 'contact@emarket.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        // Authentication Schemas
        RegisterInput: {
          type: 'object',
          required: ['fullname', 'email', 'password'],
          properties: {
            fullname: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 6,
              example: 'password123',
            },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'User registered successfully',
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            user: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                  example: '670e8b2a1f4c5d6e7f8a9b0c',
                },
                fullname: {
                  type: 'string',
                  example: 'John Doe',
                },
                email: {
                  type: 'string',
                  example: 'john@example.com',
                },
                role: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      example: 'USER',
                    },
                  },
                },
              },
            },
          },
        },
        // Category Schemas
        Category: {
          type: 'object',
          required: ['title'],
          properties: {
            _id: {
              type: 'string',
              example: '670e8b2a1f4c5d6e7f8a9b0c',
            },
            uuid: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            title: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'Smartphones',
            },
            slug: {
              type: 'string',
              example: 'smartphones',
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            isDeleted: {
              type: 'boolean',
              example: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        CategoryInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'Smartphones',
            },
          },
        },
        // Product Schemas
        Product: {
          type: 'object',
          required: ['title', 'description', 'price', 'stock', 'category'],
          properties: {
            _id: {
              type: 'string',
              example: '670e8b2a1f4c5d6e7f8a9b0c',
            },
            uuid: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            title: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'iPhone 15 Pro',
            },
            description: {
              type: 'string',
              minLength: 10,
              maxLength: 500,
              example: 'Latest iPhone with A17 Pro chip and titanium design',
            },
            price: {
              type: 'number',
              minimum: 0,
              example: 12999,
            },
            stock: {
              type: 'number',
              minimum: 0,
              example: 50,
            },
            category: {
              oneOf: [
                { type: 'string' },
                {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    title: { type: 'string' },
                    slug: { type: 'string' },
                  },
                },
              ],
              example: '670e8b2a1f4c5d6e7f8a9b0c',
            },
            imageUrl: {
              type: 'string',
              example: 'https://example.com/iphone-15-pro.jpg',
            },
            isDeleted: {
              type: 'boolean',
              example: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        ProductInput: {
          type: 'object',
          required: ['title', 'description', 'price', 'stock', 'category'],
          properties: {
            title: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'iPhone 15 Pro',
            },
            description: {
              type: 'string',
              minLength: 10,
              maxLength: 500,
              example: 'Latest iPhone with A17 Pro chip and titanium design',
            },
            price: {
              type: 'number',
              minimum: 0,
              example: 12999,
            },
            stock: {
              type: 'number',
              minimum: 0,
              example: 50,
            },
            category: {
              type: 'string',
              example: '670e8b2a1f4c5d6e7f8a9b0c',
            },
            imageUrl: {
              type: 'string',
              example: 'https://example.com/iphone-15-pro.jpg',
            },
          },
        },
        // Error Schema
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints (register, login, profile)',
      },
      {
        name: 'Categories',
        description: 'Category management endpoints',
      },
      {
        name: 'Products',
        description: 'Product management endpoints',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
