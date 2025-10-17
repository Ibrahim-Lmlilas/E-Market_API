const Product = require('../models/Product');

class ProductController {

    async getAllProducts(req, res) {
        try {
            // Utiliser la méthode findActive du modèle
            const products = await Product.findActive()
                .populate('category', 'title slug')
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
            // Utiliser la méthode findByIdActive du modèle
            const product = await Product.findByIdActive(req.params.id)
                .populate('category', 'title slug');
            
            if (!product) {
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
            
            const { title, description, price, stock, category, imageUrl } = req.body;
            
            // Créer une nouvelle instance de Product avec les valeurs fournies
            const product = new Product({
                title,
                description,
                price,
                stock,
                category,
                imageUrl
            });

            // Sauvegarder le nouveau produit dans la base de données
            await product.save();

            // Peupler le champ category avec les champs title et slug pour plus de clarté côté client
            await product.populate('category', 'title slug');
            
            // Répondre avec le produit créé et un message de succès
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
            const { title, description, price, stock, category, imageUrl } = req.body;
            
            // Chercher et mettre à jour le produit dans la base de donnes
            const product = await Product.findByIdAndUpdate(
                req.params.id,
                { title, description, price, stock, category, imageUrl },
                { new: true, runValidators: true }
            ).populate('category', 'title slug');
            
            // Vérifier si le produit existe et qu'il n'est pas supprimé
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
            // Gérer les erreurs et retourner un message d'erreur approprié
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteProduct(req, res) {
        try {
            // Utiliser la méthode findByIdActive du modèle
            const product = await Product.findByIdActive(req.params.id);
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            
            await product.softDelete();
            
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

    async searchProducts(req, res) {
        try {
            const { name, minPrice, maxPrice } = req.query;
            
            // Build the search query
            let query = { isDeleted: false };
            
            // Search by product name (case-insensitive)
            if (name) {
                query.title = { $regex: name, $options: 'i' };
            }
            
            // Search by price range
            if (minPrice || maxPrice) {
                query.price = {};
                if (minPrice) {
                    query.price.$gte = parseFloat(minPrice);
                }
                if (maxPrice) {
                    query.price.$lte = parseFloat(maxPrice);
                }
            }
            
            // Execute search
            const products = await Product.find(query)
                .populate('category', 'title slug')
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
}

module.exports = new ProductController();