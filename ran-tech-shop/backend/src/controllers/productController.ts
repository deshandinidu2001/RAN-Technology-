import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const FILTER_SPEC_KEYS = new Set([
  'CPU', 'GPU', 'Processor', 'RAM', 'Storage', 'Display', 'Type', 'Capacity',
  'Speed', 'Socket', 'Chipset', 'Memory', 'Wattage', 'Efficiency', 'Form Factor',
  'Resolution', 'Refresh', 'Panel',
]);

/**
 * Get all products with optional filtering
 * GET /api/products
 */
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category, subcategory, search, minPrice, maxPrice, featured, brand, condition,
      ramType, ramSpeed, ramCapacity,
      ssdType, ssdCapacity,
      gpuMemory, gpuChipset,
      displaySize, displayRes, displayType,
      isService, serviceType,
      compatibility,
      sort = 'createdAt', order = 'desc',
      page = '1', limit = '12',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
      .from('Product')
      .select('*, reviews:Review(rating)', { count: 'exact' });

    if (category) query = query.eq('category', category as string);
    if (subcategory) query = query.eq('subcategory', subcategory as string);
    if (featured === 'true') query = query.eq('featured', true);
    if (brand) query = query.eq('brand', brand as string);
    if (condition) query = query.eq('condition', condition as string);

    if (search) {
      const s = (search as string).replace(/[%]/g, '');
      query = query.or(
        `name.ilike.%${s}%,description.ilike.%${s}%,brand.ilike.%${s}%,category.ilike.%${s}%`
      );
    }

    if (minPrice) query = query.gte('price', parseFloat(minPrice as string));
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice as string));

    // specs JSON contains-text filters: spec_<Key>=<value>
    Object.entries(req.query)
      .filter(([key, value]) => key.startsWith('spec_') && value)
      .forEach(([, value]) => {
        query = query.ilike('specs', `%${String(value).replace(/[%]/g, '')}%`);
      });

    if (ramType) query = query.eq('ramType', ramType as string);
    if (ramSpeed) query = query.eq('ramSpeed', parseInt(ramSpeed as string, 10));
    if (ramCapacity) query = query.eq('ramCapacity', parseInt(ramCapacity as string, 10));

    if (ssdType) query = query.eq('ssdType', ssdType as string);
    if (ssdCapacity) query = query.eq('ssdCapacity', parseInt(ssdCapacity as string, 10));

    if (gpuMemory) query = query.eq('gpuMemory', parseInt(gpuMemory as string, 10));
    if (gpuChipset) query = query.eq('gpuChipset', gpuChipset as string);

    if (displaySize) query = query.eq('displaySize', parseFloat(displaySize as string));
    if (displayRes) query = query.eq('displayRes', displayRes as string);
    if (displayType) query = query.eq('displayType', displayType as string);

    if (isService !== undefined) query = query.eq('isService', isService === 'true');
    if (serviceType) query = query.eq('serviceType', serviceType as string);

    if (compatibility) {
      query = query.ilike('compatibility', `%${String(compatibility).replace(/[%]/g, '')}%`);
    }

    query = query
      .order(sort as string, { ascending: (order as string) === 'asc' })
      .range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    const total = count ?? 0;
    const productsWithRating = (data ?? []).map((product: any) => {
      const reviews: Array<{ rating: number }> = product.reviews ?? [];
      const avgRating =
        reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
      const { reviews: _omit, ...rest } = product;
      return {
        ...rest,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
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

    let query = supabase
      .from('Product')
      .select(
        'brand, subcategory, condition, specs, ramType, ramSpeed, ramCapacity, ssdType, ssdCapacity, gpuMemory, gpuChipset, displaySize, displayRes, displayType, compatibility'
      );
    if (category) query = query.eq('category', category as string);
    if (subcategory) query = query.eq('subcategory', subcategory as string);

    const { data: products, error } = await query;
    if (error) throw error;

    const rows = products ?? [];
    const specValues = new Map<string, Set<string>>();
    const addSpecValue = (key: string, value: unknown) => {
      if (value === undefined || value === null || value === '') return;
      const label = String(value).trim();
      if (!label) return;
      if (!specValues.has(key)) specValues.set(key, new Set());
      specValues.get(key)!.add(label);
    };

    rows.forEach((product: any) => {
      if (!product.specs) return;
      try {
        const parsed = JSON.parse(product.specs);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return;
        Object.entries(parsed)
          .filter(([key]) => FILTER_SPEC_KEYS.has(key))
          .forEach(([key, value]) => addSpecValue(key, value));
      } catch {
        // Ignore malformed specs.
      }
    });

    const dynamicSpecFilters = Array.from(specValues.entries())
      .map(([key, values]) => ({
        key,
        values: Array.from(values).sort((a, b) => a.localeCompare(b)),
      }))
      .filter((filter) => filter.values.length > 0);

    const filters = {
      brands: [...new Set(rows.map((p: any) => p.brand).filter(Boolean))],
      subcategories: [...new Set(rows.map((p: any) => p.subcategory).filter(Boolean))],
      conditions: [...new Set(rows.map((p: any) => p.condition).filter(Boolean))],
      specFilters: dynamicSpecFilters,
      ramTypes: [...new Set(rows.map((p: any) => p.ramType).filter(Boolean))],
      ramSpeeds: [...new Set(rows.map((p: any) => p.ramSpeed).filter(Boolean))].sort(
        (a: any, b: any) => (a || 0) - (b || 0)
      ),
      ramCapacities: [...new Set(rows.map((p: any) => p.ramCapacity).filter(Boolean))].sort(
        (a: any, b: any) => (a || 0) - (b || 0)
      ),
      ssdTypes: [...new Set(rows.map((p: any) => p.ssdType).filter(Boolean))],
      ssdCapacities: [...new Set(rows.map((p: any) => p.ssdCapacity).filter(Boolean))].sort(
        (a: any, b: any) => (a || 0) - (b || 0)
      ),
      gpuMemories: [...new Set(rows.map((p: any) => p.gpuMemory).filter(Boolean))].sort(
        (a: any, b: any) => (a || 0) - (b || 0)
      ),
      gpuChipsets: [...new Set(rows.map((p: any) => p.gpuChipset).filter(Boolean))],
      displaySizes: [...new Set(rows.map((p: any) => p.displaySize).filter(Boolean))].sort(
        (a: any, b: any) => (a || 0) - (b || 0)
      ),
      displayResolutions: [...new Set(rows.map((p: any) => p.displayRes).filter(Boolean))],
      displayTypes: [...new Set(rows.map((p: any) => p.displayType).filter(Boolean))],
      compatibleLaptops: [
        ...new Set(
          rows.flatMap((p: any) => {
            try {
              return p.compatibility ? JSON.parse(p.compatibility) : [];
            } catch {
              return [];
            }
          })
        ),
      ],
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

    const { data: product, error } = await supabase
      .from('Product')
      .select('*, reviews:Review(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const reviews = Array.isArray((product as any).reviews) ? (product as any).reviews : [];
    reviews.sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const formattedProduct = {
      ...product,
      reviews,
      images: (product as any).images ? JSON.parse((product as any).images) : [(product as any).image],
      specs: (product as any).specs ? JSON.parse((product as any).specs) : {},
      features: (product as any).features ? JSON.parse((product as any).features) : [],
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
    const includeServices = req.query.includeServices === 'true';

    let query = supabase
      .from('Product')
      .select('*')
      .eq('featured', true)
      .order('createdAt', { ascending: false })
      .limit(8);

    if (!includeServices) {
      // Exclude services. Postgres treats null != true as true, so this also
      // catches rows where isService is null.
      query = query.not('isService', 'is', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ products: data ?? [] });
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
    // Supabase JS has no groupBy primitive; pull categories and aggregate in memory.
    const { data, error } = await supabase.from('Product').select('category');
    if (error) throw error;

    const counts = new Map<string, number>();
    (data ?? []).forEach((row: any) => {
      if (!row.category) return;
      counts.set(row.category, (counts.get(row.category) ?? 0) + 1);
    });

    const formattedCategories = Array.from(counts.entries()).map(([name, count]) => ({
      name,
      count,
      slug: name,
    }));

    res.json({ categories: formattedCategories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

const stringifyMaybe = (v: unknown): string | null => {
  if (v === undefined || v === null) return null;
  return typeof v === 'string' ? v : JSON.stringify(v);
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
      isService, serviceType, condition,
    } = req.body;

    if (!name || !description || !price || !category || !image) {
      res.status(400).json({ error: 'Name, description, price, category, and image are required' });
      return;
    }

    const { data: product, error } = await supabase
      .from('Product')
      .insert({
        name,
        description,
        price: parseFloat(price),
        category,
        image,
        stock: parseInt(stock, 10) || 0,
        featured: featured || false,
        subcategory: subcategory ?? null,
        brand: brand ?? null,
        sku: sku ?? null,
        specs: stringifyMaybe(specs),
        features: stringifyMaybe(features),
        images: stringifyMaybe(images),
        compatibility: stringifyMaybe(compatibility),
        ramType: ramType ?? null,
        ramSpeed: ramSpeed ? parseInt(ramSpeed, 10) : null,
        ramCapacity: ramCapacity ? parseInt(ramCapacity, 10) : null,
        ssdType: ssdType ?? null,
        ssdCapacity: ssdCapacity ? parseInt(ssdCapacity, 10) : null,
        ssdSpeed: ssdSpeed ? parseInt(ssdSpeed, 10) : null,
        gpuMemory: gpuMemory ? parseInt(gpuMemory, 10) : null,
        gpuChipset: gpuChipset ?? null,
        displaySize: displaySize ? parseFloat(displaySize) : null,
        displayRes: displayRes ?? null,
        displayType: displayType ?? null,
        isService: !!isService,
        serviceType: serviceType || null,
        condition: condition || null,
      })
      .select('*')
      .single();

    if (error || !product) throw error ?? new Error('Insert returned no row');

    res.status(201).json({ message: 'Product created successfully', product });
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
      isService, serviceType, condition,
    } = req.body;

    const { data: existing } = await supabase
      .from('Product')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const updates: Record<string, unknown> = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (price) updates.price = parseFloat(price);
    if (category) updates.category = category;
    if (image) updates.image = image;
    if (stock !== undefined) updates.stock = parseInt(stock, 10);
    if (featured !== undefined) updates.featured = featured;
    if (subcategory !== undefined) updates.subcategory = subcategory;
    if (brand !== undefined) updates.brand = brand;
    if (sku !== undefined) updates.sku = sku;
    if (specs !== undefined) updates.specs = stringifyMaybe(specs);
    if (features !== undefined) updates.features = stringifyMaybe(features);
    if (images !== undefined) updates.images = stringifyMaybe(images);
    if (compatibility !== undefined) updates.compatibility = stringifyMaybe(compatibility);
    if (ramType !== undefined) updates.ramType = ramType;
    if (ramSpeed !== undefined) updates.ramSpeed = ramSpeed ? parseInt(ramSpeed, 10) : null;
    if (ramCapacity !== undefined) updates.ramCapacity = ramCapacity ? parseInt(ramCapacity, 10) : null;
    if (ssdType !== undefined) updates.ssdType = ssdType;
    if (ssdCapacity !== undefined) updates.ssdCapacity = ssdCapacity ? parseInt(ssdCapacity, 10) : null;
    if (ssdSpeed !== undefined) updates.ssdSpeed = ssdSpeed ? parseInt(ssdSpeed, 10) : null;
    if (gpuMemory !== undefined) updates.gpuMemory = gpuMemory ? parseInt(gpuMemory, 10) : null;
    if (gpuChipset !== undefined) updates.gpuChipset = gpuChipset;
    if (displaySize !== undefined) updates.displaySize = displaySize ? parseFloat(displaySize) : null;
    if (displayRes !== undefined) updates.displayRes = displayRes;
    if (displayType !== undefined) updates.displayType = displayType;
    if (isService !== undefined) updates.isService = !!isService;
    if (serviceType !== undefined) updates.serviceType = serviceType || null;
    if (condition !== undefined) updates.condition = condition || null;

    const { data: product, error } = await supabase
      .from('Product')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !product) throw error ?? new Error('Update returned no row');

    res.json({ message: 'Product updated successfully', product });
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

    const { data: existing } = await supabase
      .from('Product')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const { error } = await supabase.from('Product').delete().eq('id', id);
    if (error) throw error;

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

    const s = String(q).replace(/[%]/g, '');
    const { data, error } = await supabase
      .from('Product')
      .select('*')
      .or(`name.ilike.%${s}%,description.ilike.%${s}%,category.ilike.%${s}%,brand.ilike.%${s}%`)
      .limit(20);

    if (error) throw error;
    res.json({ products: data ?? [] });
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

    const { data: product } = await supabase
      .from('Product')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const { data: review, error } = await supabase
      .from('Review')
      .insert({
        productId: id,
        userName,
        rating: Math.max(1, Math.min(5, parseInt(rating.toString(), 10))),
        comment,
      })
      .select('*')
      .single();

    if (error || !review) throw error ?? new Error('Insert returned no row');

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
};
