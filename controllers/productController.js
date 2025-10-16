const Product = require('../models/Product');

class ProductController {

    // Public endpoint - Only published & visible products with pagination
    async getAllProducts(req, res) {
        try {
            // Pagination
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Filters
            const filters = { 
                isDeleted: false,
                status: 'published',
                isVisible: true
            };

            // Category filter (optional)
            if (req.query.category) {
                filters.category = req.query.category;
            }

            // Search by title (optional)
            if (req.query.search) {
                filters.title = { $regex: req.query.search, $options: 'i' };
            }

            const products = await Product.find(filters)
                .populate('category', 'title slug')
                .populate('seller', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Product.countDocuments(filters);
            
            res.status(200).json({
                success: true,
                count: products.length,
                total: total,
                page: page,
                totalPages: Math.ceil(total / limit),
                data: products
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Admin endpoint - Get ALL products (including draft, deleted, etc.) with pagination
    async getAllProductsAdmin(req, res) {
        try {
            // Pagination
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Filters
            const filters = {};

            // Status filter (optional)
            if (req.query.status) {
                filters.status = req.query.status;
            }

            // Deleted filter (optional)
            if (req.query.includeDeleted !== 'true') {
                filters.isDeleted = false;
            }

            // Category filter (optional)
            if (req.query.category) {
                filters.category = req.query.category;
            }

            // Search by title (optional)
            if (req.query.search) {
                filters.title = { $regex: req.query.search, $options: 'i' };
            }

            const products = await Product.find(filters)
                .populate('category', 'title slug')
                .populate('seller', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Product.countDocuments(filters);
            
            res.status(200).json({
                success: true,
                count: products.length,
                total: total,
                page: page,
                totalPages: Math.ceil(total / limit),
                data: products
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Seller endpoint - Get own products with pagination
    async getMyProducts(req, res) {
        try {
            // Pagination
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Filters
            const filters = {
                seller: req.user._id,
                isDeleted: false
            };

            // Status filter (optional)
            if (req.query.status) {
                filters.status = req.query.status;
            }

            const products = await Product.find(filters)
                .populate('category', 'title slug')
                .populate('seller', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Product.countDocuments(filters);
            
            res.status(200).json({
                success: true,
                count: products.length,
                total: total,
                page: page,
                totalPages: Math.ceil(total / limit),
                data: products
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getProductById(req, res) {
        try {
            const product = await Product.findById(req.params.id)
                .populate('category', 'title slug')
                .populate('seller', 'firstName lastName email');
            
            if (!product || product.isDeleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            
            // Check if product is visible to public
            if (product.status !== 'published' || !product.isVisible) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            
            res.status(200).json({
                success: true,
                data: product
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async createProduct(req, res) {
        try {
            const { title, description, price, stock, category, imageUrl, status, isVisible } = req.body;
            
            const product = new Product({
                title,
                description,
                price,
                stock,
                category,
                imageUrl,
                seller: req.user._id, // Set seller to current user
                status: status || 'published', // Default to published
                isVisible: isVisible !== undefined ? isVisible : true // Default to visible
            });
            
            await product.save();
            await product.populate('category', 'title slug');
            await product.populate('seller', 'firstName lastName email');
            
            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: product
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateProduct(req, res) {
        try {
            const { title, description, price, stock, category, imageUrl, status, isVisible } = req.body;
            
            const product = await Product.findByIdAndUpdate(
                req.params.id,
                { title, description, price, stock, category, imageUrl, status, isVisible },
                { new: true, runValidators: true }
            ).populate('category', 'title slug')
             .populate('seller', 'firstName lastName email');
            
            if (!product || product.isDeleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Product updated successfully',
                data: product
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteProduct(req, res) {
        try {
            const product = await Product.findById(req.params.id);
            
            if (!product || product.isDeleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            
            product.isDeleted = true;
            product.deletedAt = new Date();
            await product.save();
            
            res.status(200).json({
                success: true,
                message: 'Product deleted successfully'
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new ProductController();