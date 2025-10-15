const yup = require('yup');

const userSchema = yup.object({
    firstName: yup.string().required('first name is required').min(3, 'first Name must be at least 3 characters'),
    lastName: yup.string().required('last name is required').min(3, 'last Name must be at least 3 characters'),
    nickname: yup.string().required('nickname is required').min(3, 'nickname must be at least 3 characters'),
    email: yup.string().required('Email is required').email('Invalid email format'),
    password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
});

const updateprofile = yup.object({
    firstName: yup.string().min(3, 'first Name must be at least 3 characters'),
    lastName: yup.string().min(3, 'last Name must be at least 3 characters'),
    nickname: yup.string().min(3, 'nickname must be at least 3 characters'),
    email: yup.string().email('Invalid email format'),
});


const passwordSchema = yup.object({
    oldPassword: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
    confirmPassword: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
    newPassword: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),

})
const productSchema = yup.object({
    title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
    description: yup.string().required('Description is required').min(8, 'Description must be at least 8 characters'),
    price: yup.number("price must be a number").required('Price is required'),
    stock: yup.number("stock must be a number").required('Stock is required'),
    category: yup.string().required('Category is required'),
    imageUrl: yup.string(),
});

const CategorySchema = yup.object({
    title: yup.string().required('Name is required').min(3, 'Name must be at least 3 characters'),
});

const CartItemSchema = yup.object({
    cart_id: yup.string().required('Cart ID is required'),
    product_id: yup.string().required('Product ID is required'),
    quantity: yup.number("quantity must be a number").required('Quantity is required'),
});

const UpdateCartItemSchema = yup.object({
    quantity: yup.number("quantity must be a number").required('Quantity is required'),
});

module.exports = {userSchema, productSchema, CategorySchema, CartItemSchema, UpdateCartItemSchema, updateprofile ,passwordSchema};