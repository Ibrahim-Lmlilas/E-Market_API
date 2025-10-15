const Product = require('../models/Product');

class ProductController {

    async getAllProducts(req, res) {
        try {
            const products = await Product.find({ 
                isDeleted: false,
                status: 'published',
                isVisible: true
            })
                .populate('category', 'title slug')
                .populate('seller', 'firstName lastName email')
                .sort({ createdAt: -1 });
            
            res.status(200).json({
                success: true,
                count: products.length,
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
                status: status || 'draft',
                isVisible: isVisible || false
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