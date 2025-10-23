const OrderService = require('../services/OrderService');

class OrderController {
    // Create new order
    async createOrder(req, res) {
        const { cartId, couponCode } = req.body;
        const userId = req.user?.id;

        try {
            const order = await OrderService.validateOrder(userId, cartId, couponCode);
            res.status(201).json({
                success: true,
                message: "Order created successfully",
                data: order
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAllOrders(req, res) {
        try {
            const orders = await OrderService.getAllOrders();

            if (!orders) {
                return res.status(404).json({ success: false, message: "Orders not found" });
            }

            res.status(200).json({
                success: true,
                message: "Orders retrieved successfully",
                data: orders
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Get all orders for a user
    async getUserOrders(req, res) {
        const userId = req.user?.id;

        try {
            const orders = await OrderService.getUserOrders(userId);

            if (!orders) {
                return res.status(404).json({ success: false, message: "Orders not found" });
            }
            
            res.status(200).json({
                success: true,
                message: "Orders retrieved successfully",
                data: orders
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Get order by ID
    async getOrderById(req, res) {
        const { id } = req.params;

        try {
            const order = await OrderService.getOrderById(id);

            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            res.status(200).json({
                success: true,
                message: "Order retrieved successfully",
                data: order
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Update order status (admin or system)
    async updateOrderStatus(req, res) {
        const { id } = req.params;
        const { status } = req.body;

        try {
            const updatedOrder = await OrderService.updateOrderStatus(id, status);

            if (!updatedOrder) {
                return res.status(404).json({ success: false, message: "Order not found or cannot be updated" });
            }

            res.status(200).json({
                success: true,
                message: "Order status updated successfully",
                data: updatedOrder
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Cancel order (user)
    async cancelOrder(req, res) {
        const { id } = req.params;
        const userId = req.user?.id;

        try {
            const cancelledOrder = await OrderService.cancelOrder(userId, id);

            if (!cancelledOrder) {
                return res.status(404).json({ success: false, message: "Order not found or cannot be cancelled" });
            }

            res.status(200).json({
                success: true,
                message: "Order cancelled successfully",
                data: cancelledOrder
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Delete order (admin)
    async deleteOrder(req, res) {
        const { id } = req.params;

        try {
            const deleted = await OrderService.deleteOrder(id);

            if (!deleted) {
                return res.status(404).json({ success: false, message: "Order not found or already deleted" });
            }

            res.status(200).json({
                success: true,
                message: "Order deleted successfully"
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new OrderController();
