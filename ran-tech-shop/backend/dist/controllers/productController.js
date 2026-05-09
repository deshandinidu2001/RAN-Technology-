"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReview = exports.searchProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getCategories = exports.getFeaturedProducts = exports.getProductById = exports.getProductFilters = exports.getAllProducts = void 0;
const server_1 = require("../server");
/**
 * Get all products with optional filtering
 * GET /api/products
 */
const getAllProducts = async (req, res) => {
    try {
        const { category, subcategory, search, minPrice, maxPrice, featured, brand, 
        // RAM filters
        ramType, ramSpeed, ramCapacity, 
        // SSD filters
        ssdType, ssdCapacity, 
        // GPU filters
        gpuMemory, gpuChipset, 
        // Display filters
        displaySize, displayRes, displayType, 
        // Service filter
        isService, serviceType, 
        // Compatibility
        compatibility, sort = 'createdAt', order = 'desc', page = '1', limit = '12' } = req.query;
        // Build where clause
        const where = {};
        if (category) {
            where.category = category;
        }
        if (subcategory) {
            where.subcategory = subcategory;
        }
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
                { brand: { contains: search } },
                { category: { contains: search } },
            ];
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = parseFloat(minPrice);
            if (maxPrice)
                where.price.lte = parseFloat(maxPrice);
        }
        if (featured === 'true') {
            where.featured = true;
        }
        if (brand) {
            where.brand = brand;
        }
        // RAM specific filters
        if (ramType) {
            where.ramType = ramType;
        }
        if (ramSpeed) {
            where.ramSpeed = parseInt(ramSpeed, 10);
        }
        if (ramCapacity) {
            where.ramCapacity = parseInt(ramCapacity, 10);
        }
        // SSD specific filters
        if (ssdType) {
            where.ssdType = ssdType;
        }
        if (ssdCapacity) {
            where.ssdCapacity = parseInt(ssdCapacity, 10);
        }
        // GPU specific filters
        if (gpuMemory) {
            where.gpuMemory = parseInt(gpuMemory, 10);
        }
        if (gpuChipset) {
            where.gpuChipset = gpuChipset;
        }
        // Display specific filters
        if (displaySize) {
            where.displaySize = parseFloat(displaySize);
        }
        if (displayRes) {
            where.displayRes = displayRes;
        }
        if (displayType) {
            where.displayType = displayType;
        }
        // Service filters
        if (isService !== undefined) {
            where.isService = isService === 'true';
        }
        if (serviceType) {
            where.serviceType = serviceType;
        }
        // Compatibility filter (search in JSON string)
        if (compatibility) {
            where.compatibility = { contains: compatibility };
        }
        // Calculate pagination
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        // Build orderBy
        const orderBy = {};
        const sortField = sort;
        orderBy[sortField] = order;
        // Get products and total count
        const [products, total] = await Promise.all([
            server_1.prisma.product.findMany({
                where,
                orderBy,
                skip,
                take: limitNum,
                include: {
                    reviews: {
                        select: {
                            rating: true,
                        },
                    },
                },
            }),
            server_1.prisma.product.count({ where }),
        ]);
        // Add average rating to each product
        const productsWithRating = products.map((product) => {
            const avgRating = product.reviews.length > 0
                ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
                : 0;
            return {
                ...product,
                averageRating: Math.round(avgRating * 10) / 10,
                reviewCount: product.reviews.length,
                reviews: undefined, // Remove reviews array from list
            };
        });
        res.json({
            products: productsWithRating,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};
exports.getAllProducts = getAllProducts;
/**
 * Get filter options for products (brands, RAM types, etc.)
 * GET /api/products/filters
 */
const getProductFilters = async (req, res) => {
    try {
        const { category, subcategory } = req.query;
        const where = {};
        if (category)
            where.category = category;
        if (subcategory)
            where.subcategory = subcategory;
        const products = await server_1.prisma.product.findMany({
            where,
            select: {
                brand: true,
                ramType: true,
                ramSpeed: true,
                ramCapacity: true,
                ssdType: true,
                ssdCapacity: true,
                gpuMemory: true,
                gpuChipset: true,
                displaySize: true,
                displayRes: true,
                displayType: true,
                compatibility: true,
            },
        });
        // Extract unique values
        const filters = {
            brands: [...new Set(products.map(p => p.brand).filter(Boolean))],
            ramTypes: [...new Set(products.map(p => p.ramType).filter(Boolean))],
            ramSpeeds: [...new Set(products.map(p => p.ramSpeed).filter(Boolean))].sort((a, b) => (a || 0) - (b || 0)),
            ramCapacities: [...new Set(products.map(p => p.ramCapacity).filter(Boolean))].sort((a, b) => (a || 0) - (b || 0)),
            ssdTypes: [...new Set(products.map(p => p.ssdType).filter(Boolean))],
            ssdCapacities: [...new Set(products.map(p => p.ssdCapacity).filter(Boolean))].sort((a, b) => (a || 0) - (b || 0)),
            gpuMemories: [...new Set(products.map(p => p.gpuMemory).filter(Boolean))].sort((a, b) => (a || 0) - (b || 0)),
            gpuChipsets: [...new Set(products.map(p => p.gpuChipset).filter(Boolean))],
            displaySizes: [...new Set(products.map(p => p.displaySize).filter(Boolean))].sort((a, b) => (a || 0) - (b || 0)),
            displayResolutions: [...new Set(products.map(p => p.displayRes).filter(Boolean))],
            displayTypes: [...new Set(products.map(p => p.displayType).filter(Boolean))],
            compatibleLaptops: [...new Set(products.flatMap(p => {
                    try {
                        return p.compatibility ? JSON.parse(p.compatibility) : [];
                    }
                    catch {
                        return [];
                    }
                }))],
        };
        res.json(filters);
    }
    catch (error) {
        console.error('Get product filters error:', error);
        res.status(500).json({ error: 'Failed to fetch filters' });
    }
};
exports.getProductFilters = getProductFilters;
/**
 * Get product by ID with reviews
 * GET /api/products/:id
 */
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await server_1.prisma.product.findUnique({
            where: { id },
            include: {
                reviews: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        // Parse JSON fields
        const formattedProduct = {
            ...product,
            images: product.images ? JSON.parse(product.images) : [product.image],
            specs: product.specs ? JSON.parse(product.specs) : {},
            features: product.features ? JSON.parse(product.features) : [],
        };
        res.json({ product: formattedProduct });
    }
    catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};
exports.getProductById = getProductById;
/**
 * Get featured products
 * GET /api/products/featured
 */
const getFeaturedProducts = async (_req, res) => {
    try {
        const products = await server_1.prisma.product.findMany({
            where: { featured: true },
            take: 8,
            orderBy: { createdAt: 'desc' },
        });
        res.json({ products });
    }
    catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({ error: 'Failed to fetch featured products' });
    }
};
exports.getFeaturedProducts = getFeaturedProducts;
/**
 * Get all categories with product counts
 * GET /api/products/categories
 */
const getCategories = async (_req, res) => {
    try {
        const categories = await server_1.prisma.product.groupBy({
            by: ['category'],
            _count: {
                category: true,
            },
        });
        const formattedCategories = categories.map((cat) => ({
            name: cat.category,
            count: cat._count.category,
            slug: cat.category,
        }));
        res.json({ categories: formattedCategories });
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};
exports.getCategories = getCategories;
/**
 * Create a new product (admin)
 * POST /api/products
 */
const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock, featured, subcategory, brand, sku, specs, features, images, ramType, ramSpeed, ramCapacity, ssdType, ssdCapacity, ssdSpeed, gpuMemory, gpuChipset, displaySize, displayRes, displayType, compatibility } = req.body;
        // Validate required fields
        if (!name || !description || !price || !category || !image) {
            res.status(400).json({ error: 'Name, description, price, category, and image are required' });
            return;
        }
        const product = await server_1.prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                category,
                image,
                stock: parseInt(stock, 10) || 0,
                featured: featured || false,
                subcategory,
                brand,
                sku,
                specs: specs ? (typeof specs === 'string' ? specs : JSON.stringify(specs)) : null,
                features: features ? (typeof features === 'string' ? features : JSON.stringify(features)) : null,
                images: images ? (typeof images === 'string' ? images : JSON.stringify(images)) : null,
                compatibility: compatibility ? (typeof compatibility === 'string' ? compatibility : JSON.stringify(compatibility)) : null,
                ramType,
                ramSpeed: ramSpeed ? parseInt(ramSpeed, 10) : null,
                ramCapacity: ramCapacity ? parseInt(ramCapacity, 10) : null,
                ssdType,
                ssdCapacity: ssdCapacity ? parseInt(ssdCapacity, 10) : null,
                ssdSpeed: ssdSpeed ? parseInt(ssdSpeed, 10) : null,
                gpuMemory: gpuMemory ? parseInt(gpuMemory, 10) : null,
                gpuChipset,
                displaySize: displaySize ? parseFloat(displaySize) : null,
                displayRes,
                displayType,
            },
        });
        res.status(201).json({
            message: 'Product created successfully',
            product,
        });
    }
    catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
};
exports.createProduct = createProduct;
/**
 * Update a product (admin)
 * PUT /api/products/:id
 */
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, image, stock, featured, subcategory, brand, sku, specs, features, images, ramType, ramSpeed, ramCapacity, ssdType, ssdCapacity, ssdSpeed, gpuMemory, gpuChipset, displaySize, displayRes, displayType, compatibility } = req.body;
        // Check if product exists
        const existingProduct = await server_1.prisma.product.findUnique({
            where: { id },
        });
        if (!existingProduct) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        const product = await server_1.prisma.product.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description && { description }),
                ...(price && { price: parseFloat(price) }),
                ...(category && { category }),
                ...(image && { image }),
                ...(stock !== undefined && { stock: parseInt(stock, 10) }),
                ...(featured !== undefined && { featured }),
                ...(subcategory !== undefined && { subcategory }),
                ...(brand !== undefined && { brand }),
                ...(sku !== undefined && { sku }),
                ...(specs !== undefined && { specs: typeof specs === 'string' ? specs : JSON.stringify(specs) }),
                ...(features !== undefined && { features: typeof features === 'string' ? features : JSON.stringify(features) }),
                ...(images !== undefined && { images: typeof images === 'string' ? images : JSON.stringify(images) }),
                ...(compatibility !== undefined && { compatibility: typeof compatibility === 'string' ? compatibility : JSON.stringify(compatibility) }),
                ...(ramType !== undefined && { ramType }),
                ...(ramSpeed !== undefined && { ramSpeed: ramSpeed ? parseInt(ramSpeed, 10) : null }),
                ...(ramCapacity !== undefined && { ramCapacity: ramCapacity ? parseInt(ramCapacity, 10) : null }),
                ...(ssdType !== undefined && { ssdType }),
                ...(ssdCapacity !== undefined && { ssdCapacity: ssdCapacity ? parseInt(ssdCapacity, 10) : null }),
                ...(ssdSpeed !== undefined && { ssdSpeed: ssdSpeed ? parseInt(ssdSpeed, 10) : null }),
                ...(gpuMemory !== undefined && { gpuMemory: gpuMemory ? parseInt(gpuMemory, 10) : null }),
                ...(gpuChipset !== undefined && { gpuChipset }),
                ...(displaySize !== undefined && { displaySize: displaySize ? parseFloat(displaySize) : null }),
                ...(displayRes !== undefined && { displayRes }),
                ...(displayType !== undefined && { displayType }),
            },
        });
        res.json({
            message: 'Product updated successfully',
            product,
        });
    }
    catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
};
exports.updateProduct = updateProduct;
/**
 * Delete a product (admin)
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if product exists
        const existingProduct = await server_1.prisma.product.findUnique({
            where: { id },
        });
        if (!existingProduct) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        await server_1.prisma.product.delete({
            where: { id },
        });
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};
exports.deleteProduct = deleteProduct;
/**
 * Search products
 * GET /api/products/search
 */
const searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            res.status(400).json({ error: 'Search query is required' });
            return;
        }
        const products = await server_1.prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: q } },
                    { description: { contains: q } },
                    { category: { contains: q } },
                    { brand: { contains: q } },
                ],
            },
            take: 20,
        });
        res.json({ products });
    }
    catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({ error: 'Failed to search products' });
    }
};
exports.searchProducts = searchProducts;
/**
 * Add a review to a product
 * POST /api/products/:id/reviews
 */
const addReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { userName, rating, comment } = req.body;
        if (!userName || rating === undefined || !comment) {
            res.status(400).json({ error: 'Name, rating, and comment are required' });
            return;
        }
        const product = await server_1.prisma.product.findUnique({ where: { id } });
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        const review = await server_1.prisma.review.create({
            data: {
                productId: id,
                userName,
                rating: Math.max(1, Math.min(5, parseInt(rating.toString(), 10))),
                comment,
            },
        });
        res.status(201).json({ message: 'Review added successfully', review });
    }
    catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ error: 'Failed to add review' });
    }
};
exports.addReview = addReview;
//# sourceMappingURL=productController.js.map