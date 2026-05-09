"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All order routes require authentication
router.use(auth_1.authenticate);
// User routes
router.post('/', orderController_1.createOrder);
router.get('/', orderController_1.getUserOrders);
router.get('/all', orderController_1.getAllOrders); // Admin route
router.get('/:id', orderController_1.getOrderById);
router.post('/:id/cancel', orderController_1.cancelOrder);
// Admin routes
router.put('/:id/status', orderController_1.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=orders.js.map