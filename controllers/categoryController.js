const Category = require('../models/Category');

class CategoryController {

    async getAllCategories(req, res) {
        try {
            const categories = await Category.find({ isDeleted: false });
            
            res.status(200).json({
                success: true,
                count: categories.length,
                data: categories
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getCategoryById(req, res) {
        try {
            const category = await Category.findById(req.params.id);
            
            if (!category || category.isDeleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }
            
            res.status(200).json({
                success: true,
                data: category
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async createCategory(req, res) {
        try {
            const { title } = req.body;
            
            const category = new Category({
                title
            });
            
            await category.save();
            
            res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: category
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateCategory(req, res) {
        try {
            const { title } = req.body;
            
            const category = await Category.findByIdAndUpdate(
                req.params.id,
                { title },
                { new: true, runValidators: true }
            );
            
            if (!category || category.isDeleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Category updated successfully',
                data: category
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteCategory(req, res) {
        try {
            const category = await Category.findById(req.params.id);
            
            if (!category || category.isDeleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }
            
            category.isDeleted = true;
            category.deletedAt = new Date();
            await category.save();
            
            res.status(200).json({
                success: true,
                message: 'Category deleted successfully'
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new CategoryController();