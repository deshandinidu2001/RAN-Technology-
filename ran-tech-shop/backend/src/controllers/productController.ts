import { Request, Response } from 'express';
import { prisma } from '../server';

/**
 * Get all products with optional filtering
 * GET /api/products
 */
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      category, 
      subcategory,
      search, 
      minPrice, 
      maxPrice, 
      featured,
      brand,
      // RAM filters
      ramType,
      ramSpeed,
      ramCapacity,
      // SSD filters
      ssdType,
      ssdCapacity,
      // GPU filters
      gpuMemory,
      gpuChipset,
      // Display filters
      displaySize,
      displayRes,
      displayType,
      // Service filter
      isService,
      serviceType,
      // Compatibility
      compatibility,
      sort = 'createdAt',
      order = 'desc',
      page = '1',
      limit = '12'
    } = req.query;

    // Build where clause
    const where: any = {};

    if (category) {
      where.category = category as string;
    }

    if (subcategory) {
      where.subcategory = subcategory as string;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
        { brand: { contains: search as string } },
        { category: { contains: search as string } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (brand) {
      where.brand = brand as string;
    }

    // RAM specific filters
    if (ramType) {
      where.ramType = ramType as string;
    }
    if (ramSpeed) {
      where.ramSpeed = parseInt(ramSpeed as string, 10);
    }
    if (ramCapacity) {
      where.ramCapacity = parseInt(ramCapacity as string, 10);
    }

    // SSD specific filters
    if (ssdType) {
      where.ssdType = ssdType as string;
    }
    if (ssdCapacity) {
      where.ssdCapacity = parseInt(ssdCapacity as string, 10);
    }

    // GPU specific filters
    if (gpuMemory) {
      where.gpuMemory = parseInt(gpuMemory as string, 10);
    }
    if (gpuChipset) {
      where.gpuChipset = gpuChipset as string;
    }

    // Display specific filters
    if (displaySize) {
      where.displaySize = parseFloat(displaySize as string);
    }
    if (displayRes) {
      where.displayRes = displayRes as string;
    }
    if (displayType) {
      where.displayType = displayType as string;
    }

    // Service filters
    if (isService !== undefined) {
      where.isService = isService === 'true';
    }
    if (serviceType) {
      where.serviceType = serviceType as string;
    }

    // Compatibility filter (search in JSON string)
    if (compatibility) {
      where.compatibility = { contains: compatibility as string };
    }

    // Calculate pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build orderBy
    const orderBy: any = {};
    const sortField = sort as string;
    orderBy[sortField] = order as string;

    // Get products and total count
    const [products, total] = await Promise.all([
      prisma.product.findMany({
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
      prisma.product.count({ where }),
    ]);

    // Add average rating to each product
    const productsWithRating = products.map((product: any) => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / product.reviews.length
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
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

/**
 * Get filter options for products (brands, RAM types, etc.)
 * GET /api/products/filters
 */
export const getProductFilters = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, subcategory } = req.query;

    const where: any = {};
    if (category) where.category = category as string;
    if (subcategory) where.subcategory = subcategory as string;

    const products = await prisma.product.findMany({
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
        } catch {
          return [];
        }
      }))],
    };

    res.json(filters);
  } catch (error) {
    console.error('Get product filters error:', error);
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
};

/**
 * Get product by ID with reviews
 * GET /api/products/:id
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
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
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

/**
 * Get featured products
 * GET /api/products/featured
 */
export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    // Default behaviour: only real shop products (services have their own surface).
    // Pass ?includeServices=true to opt in (used by repair home if ever needed).
    const includeServices = req.query.includeServices === 'true';

    const where: any = { featured: true };
    if (!includeServices) {
      // Exclude services (`isService = true`). Include rows where the field is
      // null/false/undefined — SQLite stores those as NULL when the column is
      // missing, so we filter on `not equal true`.
      where.NOT = { isService: true };
    }

    const products = await prisma.product.findMany({
      where,
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ products });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
};

/**
 * Get all categories with product counts
 * GET /api/products/categories
 */
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.product.groupBy({
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
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

/**
 * Create a new product (admin)
 * POST /api/products
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name, description, price, category, image, stock, featured,
      subcategory, brand, sku, specs, features, images,
      ramType, ramSpeed, ramCapacity, ssdType, ssdCapacity, ssdSpeed,
      gpuMemory, gpuChipset, displaySize, displayRes, displayType, compatibility,
      isService, serviceType
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !image) {
      res.status(400).json({ error: 'Name, description, price, category, and image are required' });
      return;
    }

    const product = await prisma.product.create({
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
        isService: !!isService,
        serviceType: serviceType || null,
      },
    });

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

/**
 * Update a product (admin)
 * PUT /api/products/:id
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name, description, price, category, image, stock, featured,
      subcategory, brand, sku, specs, features, images,
      ramType, ramSpeed, ramCapacity, ssdType, ssdCapacity, ssdSpeed,
      gpuMemory, gpuChipset, displaySize, displayRes, displayType, compatibility,
      isService, serviceType
    } = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const product = await prisma.product.update({
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
        ...(isService !== undefined && { isService: !!isService }),
        ...(serviceType !== undefined && { serviceType: serviceType || null }),
      },
    });

    res.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

/**
 * Delete a product (admin)
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    await prisma.product.delete({
      where: { id },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

/**
 * Search products
 * GET /api/products/search
 */
export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q as string } },
          { description: { contains: q as string } },
          { category: { contains: q as string } },
          { brand: { contains: q as string } },
        ],
      },
      take: 20,
    });

    res.json({ products });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
};

/**
 * Add a review to a product
 * POST /api/products/:id/reviews
 */
export const addReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userName, rating, comment } = req.body;

    if (!userName || rating === undefined || !comment) {
      res.status(400).json({ error: 'Name, rating, and comment are required' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        productId: id,
        userName,
        rating: Math.max(1, Math.min(5, parseInt(rating.toString(), 10))),
        comment,
      },
    });

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
};
