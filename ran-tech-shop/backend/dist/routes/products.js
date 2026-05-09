"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/', auth_1.optionalAuth, productController_1.getAllProducts);
router.get('/featured', productController_1.getFeaturedProducts);
router.get('/categories', productController_1.getCategories);
router.get('/filters', productController_1.getProductFilters);
router.get('/search', productController_1.searchProducts);
router.get('/:id', productController_1.getProductById);
router.post('/:id/reviews', productController_1.addReview);
// Protected routes (admin only - in production, add admin check)
router.post('/', auth_1.authenticate, productController_1.createProduct);
router.put('/:id', auth_1.authenticate, productController_1.updateProduct);
router.delete('/:id', auth_1.authenticate, productController_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=products.js.map