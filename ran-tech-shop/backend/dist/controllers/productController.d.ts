import { Request, Response } from 'express';
/**
 * Get all products with optional filtering
 * GET /api/products
 */
export declare const getAllProducts: (req: Request, res: Response) => Promise<void>;
/**
 * Get filter options for products (brands, RAM types, etc.)
 * GET /api/products/filters
 */
export declare const getProductFilters: (req: Request, res: Response) => Promise<void>;
/**
 * Get product by ID with reviews
 * GET /api/products/:id
 */
export declare const getProductById: (req: Request, res: Response) => Promise<void>;
/**
 * Get featured products
 * GET /api/products/featured
 */
export declare const getFeaturedProducts: (_req: Request, res: Response) => Promise<void>;
/**
 * Get all categories with product counts
 * GET /api/products/categories
 */
export declare const getCategories: (_req: Request, res: Response) => Promise<void>;
/**
 * Create a new product (admin)
 * POST /api/products
 */
export declare const createProduct: (req: Request, res: Response) => Promise<void>;
/**
 * Update a product (admin)
 * PUT /api/products/:id
 */
export declare const updateProduct: (req: Request, res: Response) => Promise<void>;
/**
 * Delete a product (admin)
 * DELETE /api/products/:id
 */
export declare const deleteProduct: (req: Request, res: Response) => Promise<void>;
/**
 * Search products
 * GET /api/products/search
 */
export declare const searchProducts: (req: Request, res: Response) => Promise<void>;
/**
 * Add a review to a product
 * POST /api/products/:id/reviews
 */
export declare const addReview: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=productController.d.ts.map