const yup = require('yup');

const userSchema = yup.object({
  firstName: yup
    .string()
    .required('first name is required')
    .min(3, 'first Name must be at least 3 characters'),
  lastName: yup
    .string()
    .required('last name is required')
    .min(3, 'last Name must be at least 3 characters'),
  nickname: yup
    .string()
    .required('nickname is required')
    .min(3, 'nickname must be at least 3 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

const updateprofile = yup.object({
  firstName: yup.string().min(3, 'first Name must be at least 3 characters'),
  lastName: yup.string().min(3, 'last Name must be at least 3 characters'),
  nickname: yup.string().min(3, 'nickname must be at least 3 characters'),
  email: yup.string().email('Invalid email format'),
});

const passwordSchema = yup.object({
  oldPassword: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  newPassword: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
});
const productSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  description: yup
    .string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters')
    .trim(),
  price: yup
    .number()
    .required('Price is required')
    .positive('Price must be greater than 0')
    .typeError('Price must be a valid number'),
  stock: yup
    .number()
    .required('Stock is required')
    .integer('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .typeError('Stock must be a valid number'),
  category: yup
    .string()
    .required('Category is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid category ID format'),
  imageUrl: yup.string().url('Please provide a valid image URL').nullable(),
  status: yup
    .string()
    .oneOf(
      ['draft', 'published', 'inactive', 'pending_approval'],
      'Invalid status'
    )
    .default('draft'),
});

const updateProductSchema = yup.object({
  id: yup
    .string()
    .required('Product ID is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format'),
  title: yup
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  description: yup
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters')
    .trim(),
  price: yup
    .number()
    .positive('Price must be greater than 0')
    .typeError('Price must be a valid number'),
  stock: yup
    .number()
    .integer('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .typeError('Stock must be a valid number'),
  category: yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid category ID format'),
  imageUrl: yup.string().url('Please provide a valid image URL').nullable(),
  status: yup
    .string()
    .oneOf(
      ['draft', 'published', 'inactive', 'pending_approval'],
      'Invalid status'
    ),
});

const getProductSchema = yup.object({
  id: yup
    .string()
    .required('Product ID is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format'),
});

const deleteProductSchema = yup.object({
  id: yup
    .string()
    .required('Product ID is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format'),
});

const promotionSchema = yup.object({
  id: yup
    .string()
    .required('Product ID is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format'),
  action: yup
    .string()
    .required('Action is required')
    .oneOf(['set', 'remove'], 'Action must be either "set" or "remove"'),
  discountType: yup.string().when('action', {
    is: 'set',
    then: yup
      .string()
      .required('Discount type is required when setting promotion')
      .oneOf(
        ['percentage', 'fixed'],
        'Discount type must be either "percentage" or "fixed"'
      ),
    otherwise: yup.string(),
  }),
  discountValue: yup.number().when('action', {
    is: 'set',
    then: yup
      .number()
      .required('Discount value is required when setting promotion')
      .min(0, 'Discount value cannot be negative')
      .typeError('Discount value must be a valid number'),
    otherwise: yup.number(),
  }),
  startDate: yup.date().nullable().typeError('Start date must be a valid date'),
  endDate: yup
    .date()
    .nullable()
    .min(yup.ref('startDate'), 'End date must be after start date')
    .typeError('End date must be a valid date'),
});

const CategorySchema = yup.object({
  title: yup
    .string()
    .required('Name is required')
    .min(3, 'Name must be at least 3 characters'),
});
const CartItemSchema = yup.object({
  cart_id: yup.string().required('Cart ID is required'),
  product_id: yup.string().required('Product ID is required'),
  quantity: yup
    .number('quantity must be a number')
    .required('Quantity is required'),
});

const UpdateCartItemSchema = yup.object({
  quantity: yup
    .number('quantity must be a number')
    .required('Quantity is required'),
});

const couponSchema = yup.object({
  code: yup.string().required('Coupon code is required'),
  type: yup.string().required('Coupon type is required'),
  discount: yup.number().required('Discount value is required'),
  expirationDate: yup.date().required('Expiration date is required'),
  category_id: yup.string().required('Category is required'),
  user_id: yup.string().required('User is required'),
  usesLeft: yup.number().required('Maximum Uses is required'),
});

const editCouponSchema = yup.object({
  code: yup.string(),
  type: yup.string(),
  discount: yup.number(),
  expirationDate: yup.date(),
  category_id: yup.string(),
  user_id: yup.string(),
  usesLeft: yup.number(),
});

const orderSchema = yup.object({
  cartId: yup.string().required('Cart ID is required'),
  couponCode: yup.string(),
});

module.exports = {
  userSchema,
  productSchema,
  updateProductSchema,
  getProductSchema,
  deleteProductSchema,
  promotionSchema,
  CategorySchema,
  updateprofile,
  CartItemSchema,
  UpdateCartItemSchema,
  passwordSchema,
  couponSchema,
  editCouponSchema,
  orderSchema,
};
