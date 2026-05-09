"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrders = exports.cancelOrder = exports.updateOrderStatus = exports.getOrderById = exports.getUserOrders = exports.createOrder = void 0;
const server_1 = require("../server");
/**
 * Create a new order
 * POST /api/orders
 */
const createOrder = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const { items, shippingName, shippingEmail, shippingAddress, shippingCity, shippingZip } = req.body;
        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({ error: 'Order must contain at least one item' });
            return;
        }
        // Validate each item and calculate total
        let total = 0;
        const validatedItems = [];
        for (const item of items) {
            const product = await server_1.prisma.product.findUnique({
                where: { id: item.productId },
            });
            if (!product) {
                res.status(400).json({ error: `Product not found: ${item.productId}` });
                return;
            }
            if (product.stock < item.quantity) {
                res.status(400).json({ error: `Insufficient stock for ${product.name}` });
                return;
            }
            validatedItems.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price,
            });
            total += product.price * item.quantity;
        }
        // Create order with items in a transaction
        const order = await server_1.prisma.$transaction(async (tx) => {
            // Create the order
            const newOrder = await tx.order.create({
                data: {
                    userId: req.user.userId,
                    total,
                    status: 'pending',
                    shippingName,
                    shippingEmail,
                    shippingAddress,
                    shippingCity,
                    shippingZip,
                    items: {
                        create: validatedItems.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
            // Update product stock
            for (const item of validatedItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
            }
            return newOrder;
        });
        res.status(201).json({
            message: 'Order created successfully',
            order,
        });
    }
    catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};
exports.createOrder = createOrder;
/**
 * Get orders for current user
 * GET /api/orders
 */
const getUserOrders = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const orders = await server_1.prisma.order.findMany({
            where: { userId: req.user.userId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ orders });
    }
    catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};
exports.getUserOrders = getUserOrders;
/**
 * Get order by ID
 * GET /api/orders/:id
 */
const getOrderById = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const { id } = req.params;
        const order = await server_1.prisma.order.findFirst({
            where: {
                id,
                userId: req.user.userId,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        res.json({ order });
    }
    catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};
exports.getOrderById = getOrderById;
/**
 * Update order status (admin)
 * PUT /api/orders/:id/status
 */
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            res.status(400).json({
                error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
            return;
        }
        const order = await server_1.prisma.order.findUnique({
            where: { id },
        });
        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        const updatedOrder = await server_1.prisma.order.update({
            where: { id },
            data: { status },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        res.json({
            message: 'Order status updated successfully',
            order: updatedOrder,
        });
    }
    catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
/**
 * Cancel order
 * POST /api/orders/:id/cancel
 */
const cancelOrder = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const { id } = req.params;
        const order = await server_1.prisma.order.findFirst({
            where: {
                id,
                userId: req.user.userId,
            },
            include: {
                items: true,
            },
        });
        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        if (order.status !== 'pending') {
            res.status(400).json({ error: 'Only pending orders can be cancelled' });
            return;
        }
        // Cancel order and restore stock in a transaction
        const cancelledOrder = await server_1.prisma.$transaction(async (tx) => {
            // Update order status
            const updated = await tx.order.update({
                where: { id },
                data: { status: 'cancelled' },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
            // Restore product stock
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity,
                        },
                    },
                });
            }
            return updated;
        });
        res.json({
            message: 'Order cancelled successfully',
            order: cancelledOrder,
        });
    }
    catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
};
exports.cancelOrder = cancelOrder;
/**
 * Get all orders (admin)
 * GET /api/orders/all
 */
const getAllOrders = async (req, res) => {
    try {
        const { status, page = '1', limit = '20' } = req.query;
        const where = {};
        if (status) {
            where.status = status;
        }
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const [orders, total] = await Promise.all([
            server_1.prisma.order.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            server_1.prisma.order.count({ where }),
        ]);
        res.json({
            orders,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};
exports.getAllOrders = getAllOrders;
//# sourceMappingURL=orderController.js.map