"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// User routes
router.post('/', auth_1.authenticate, orderController_1.createOrder);
router.get('/', auth_1.authenticate, orderController_1.getUserOrders);
router.get('/all', auth_1.optionalAuth, orderController_1.getAllOrders); // Admin/dashboard route
router.get('/:id', auth_1.authenticate, orderController_1.getOrderById);
router.post('/:id/cancel', auth_1.authenticate, orderController_1.cancelOrder);
// Admin routes
router.put('/:id/status', auth_1.optionalAuth, orderController_1.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=orders.js.map