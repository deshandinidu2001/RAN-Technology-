import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductGrid from '../components/shop/ProductGrid';
import FilterSidebar from '../components/shop/FilterSidebar';
import ProductModal from '../components/shop/ProductModal';
import { Product } from '../types';
import api from '../utils/api';

interface ProductFilters {
  brands: string[];
  subcategories?: string[];
  conditions?: string[];
  specFilters?: Array<{ key: string; values: string[] }>;
  ramTypes: string[];
  ramSpeeds: number[];
  ramCapacities: number[];
  ssdTypes: string[];
  ssdCapacities: number[];
  compatibleLaptops: string[];
}

const PRODUCTS_PER_PAGE = 12;

const FLAT_CATEGORY_PARENTS: Record<string, string> = {
  ram: 'laptop-accessories',
  ssd: 'laptop-accessories',
  battery: 'laptop-accessories',
  'cooling-pad': 'laptop-accessories',
  display: 'laptop-accessories',
  keyboard: 'laptop-accessories',
  mouse: 'laptop-accessories',
  cable: 'laptop-accessories',
  audio: 'laptop-accessories',
  cases: 'accessories',
  processor: 'components',
  motherboard: 'components',
  psu: 'components',
  case: 'components',
};

const SHOP_CATEGORY_LABELS: Record<string, string> = {
  ram: 'RAM Memory',
  ssd: 'SSD Storage',
  battery: 'Laptop Batteries',
  'cooling-pad': 'Cooling',
  display: 'Displays',
  keyboard: 'Keyboards',
  mouse: 'Mice',
  cable: 'Cables',
  audio: 'Audio',
  cases: 'Laptop Cases',
  processor: 'Processors',
  motherboard: 'Motherboards',
  psu: 'Power Supplies',
  case: 'PC Cases',
};

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    searchParams.get('subcategory')
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Advanced filters for accessories
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [selectedSpecFilters, setSelectedSpecFilters] = useState<Record<string, string>>({});
  const [selectedRamType, setSelectedRamType] = useState<string | null>(null);
  const [selectedRamSpeed, setSelectedRamSpeed] = useState<number | null>(null);
  const [selectedRamCapacity, setSelectedRamCapacity] = useState<number | null>(null);
  const [selectedSsdType, setSelectedSsdType] = useState<string | null>(null);
  const [selectedSsdCapacity, setSelectedSsdCapacity] = useState<number | null>(null);
  const [selectedCompatibility, setSelectedCompatibility] = useState<string | null>(null);

  const navigate = useNavigate();

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('limit', '500');
        params.set('isService', 'false');
        
        const mappedParentCategory = selectedCategory ? FLAT_CATEGORY_PARENTS[selectedCategory] : undefined;
        if (selectedCategory && !mappedParentCategory) params.set('category', selectedCategory);
        if (mappedParentCategory && selectedCategory) params.set('subcategory', selectedCategory);
        if (selectedSubcategory) params.set('subcategory', selectedSubcategory);
        if (selectedBrand) params.set('brand', selectedBrand);
        if (selectedCondition) params.set('condition', selectedCondition);
        Object.entries(selectedSpecFilters).forEach(([key, value]) => {
          if (value) params.set(`spec_${key}`, value);
        });
        if (selectedRamType) params.set('ramType', selectedRamType);
        if (selectedRamSpeed) params.set('ramSpeed', selectedRamSpeed.toString());
        if (selectedRamCapacity) params.set('ramCapacity', selectedRamCapacity.toString());
        if (selectedSsdType) params.set('ssdType', selectedSsdType);
        if (selectedSsdCapacity) params.set('ssdCapacity', selectedSsdCapacity.toString());
        if (selectedCompatibility) params.set('compatibility', selectedCompatibility);
        if (searchQuery) params.set('search', searchQuery);

        const response = await api.get(`/products?${params.toString()}`);
        const apiProducts = response.data.products || response.data || [];
        setProducts(apiProducts);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedSubcategory, selectedBrand, selectedCondition, selectedSpecFilters, selectedRamType, selectedRamSpeed, selectedRamCapacity, selectedSsdType, selectedSsdCapacity, selectedCompatibility, searchQuery]);

  useEffect(() => {
    const fetchCatalogProducts = async () => {
      try {
        const response = await api.get('/products?limit=500&isService=false');
        const apiProducts = response.data.products || response.data || [];
        setCatalogProducts(Array.isArray(apiProducts) ? apiProducts : []);
      } catch (error) {
        console.error('Failed to fetch catalog products:', error);
        setCatalogProducts([]);
      }
    };

    fetchCatalogProducts();
  }, []);

  // Fetch filters for laptop accessories
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const params = new URLSearchParams();
        const mappedParentCategory = selectedCategory ? FLAT_CATEGORY_PARENTS[selectedCategory] : undefined;
        if (selectedCategory && !mappedParentCategory) params.set('category', selectedCategory);
        if (mappedParentCategory && selectedCategory) params.set('subcategory', selectedCategory);
        if (selectedSubcategory) params.set('subcategory', selectedSubcategory);
        
        const response = await api.get(`/products/filters?${params.toString()}`);
        setFilters(response.data);
      } catch (error) {
        console.error('Failed to fetch filters:', error);
      }
    };

    fetchFilters();
  }, [selectedCategory, selectedSubcategory]);

  // Apply filters
  useEffect(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory) {
      const mappedParentCategory = FLAT_CATEGORY_PARENTS[selectedCategory];
      result = result.filter((p) =>
        mappedParentCategory ? p.subcategory === selectedCategory : p.category === selectedCategory
      );
    }

    // Price filter
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, selectedCategory, priceRange, sortBy, searchQuery]);

  // Pull filter state from the URL whenever it changes. This MUST run before
  // any effect that writes back to the URL. otherwise an external navigation
  // (e.g. footer category Link) is racing against our own writer, which fires
  // on every render because `setSearchParams` isn't stable. Keeping the URL as
  // the source of truth lets footer links seed the filters reliably.
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlSubcategory = searchParams.get('subcategory');
    const urlSearch = searchParams.get('search') || '';
    if (urlCategory !== selectedCategory) setSelectedCategory(urlCategory);
    if (urlSubcategory !== selectedSubcategory) setSelectedSubcategory(urlSubcategory);
    if (urlSearch !== searchQuery) setSearchQuery(urlSearch);
  }, [searchParams]);

  // Mirror category/search/subcategory state back into the URL so manual filter
  // changes are shareable. Excludes `setSearchParams` from deps. it's a fresh
  // ref each render and would cause this effect to fire constantly, clobbering
  // params just placed in the URL by external navigation.
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedSubcategory) params.set('subcategory', selectedSubcategory);
    if (searchQuery) params.set('search', searchQuery);
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedSubcategory, searchQuery]);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const resetAdvancedFilters = () => {
    setSelectedBrand(null);
    setSelectedCondition(null);
    setSelectedSpecFilters({});
    setSelectedRamType(null);
    setSelectedRamSpeed(null);
    setSelectedRamCapacity(null);
    setSelectedSsdType(null);
    setSelectedSsdCapacity(null);
    setSelectedCompatibility(null);
  };

  const handleCategoryChange = (cat: string | null) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(null);
    resetAdvancedFilters();
  };

  const handleSubcategoryChange = (sub: string | null) => {
    setSelectedSubcategory(sub);
    resetAdvancedFilters();
    if (sub) {
      const match = allSubcategories.find(s => s.slug === sub);
      if (match && match.parent && match.parent !== selectedCategory) {
        setSelectedCategory(match.parent);
      }
    }
  };

  const countSource = catalogProducts;

  const countCategory = (slug: string) => {
    const mappedParentCategory = FLAT_CATEGORY_PARENTS[slug];
    return countSource.filter(p =>
      mappedParentCategory
        ? p.subcategory?.toLowerCase() === slug
        : p.category?.toLowerCase() === slug
    ).length;
  };

  const categories = [
    { slug: 'ram', name: 'RAM Memory', count: countCategory('ram') },
    { slug: 'ssd', name: 'SSD Storage', count: countCategory('ssd') },
    { slug: 'battery', name: 'Laptop Batteries', count: countCategory('battery') },
    { slug: 'cooling-pad', name: 'Cooling', count: countCategory('cooling-pad') },
    { slug: 'processor', name: 'Processors', count: countCategory('processor') },
    { slug: 'motherboard', name: 'Motherboards', count: countCategory('motherboard') },
    { slug: 'psu', name: 'Power Supplies', count: countCategory('psu') },
    { slug: 'case', name: 'PC Cases', count: countCategory('case') },
    { slug: 'graphics-cards', name: 'Graphics Cards', count: countCategory('graphics-cards') },
    { slug: 'laptops', name: 'Laptops', count: countCategory('laptops') },
    { slug: 'smartphones', name: 'Smartphones', count: countCategory('smartphones') },
    { slug: 'accessories', name: 'Accessories', count: countCategory('accessories') },
    { slug: 'monitors', name: 'Monitors', count: countCategory('monitors') },
    { slug: 'storage', name: 'Storage', count: countCategory('storage') },
    { slug: 'gaming', name: 'Gaming', count: countCategory('gaming') },
  ];

  const BrainIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  );

  const SnowflakeIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1m-16 0H3m14.657-5.657l.707-.707m-9.9 9.9l.707.707m-5.657-14.657l.707.707m9.9 9.9l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  );

  const GamepadIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const ComputerIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5.36 0a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" />
    </svg>
  );

  const countSub = (slug: string) =>
    countSource.filter(p => p.subcategory?.toLowerCase() === slug).length;

  const titleFromSlug = (slug: string) =>
    slug
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const allSubcategories = [
    // PC components. surface the same parts the Custom Build configurator uses
    { slug: 'processor', name: 'Processors', icon: BrainIcon, count: countSub('processor'), parent: 'components' },
    { slug: 'motherboard', name: 'Motherboards', icon: ComputerIcon, count: countSub('motherboard'), parent: 'components' },
    { slug: 'psu', name: 'Power Supplies', icon: BrainIcon, count: countSub('psu'), parent: 'components' },
    { slug: 'case', name: 'PC Cases', icon: ComputerIcon, count: countSub('case'), parent: 'components' },
    // Laptop accessories / peripherals
    { slug: 'ram', name: 'RAM Memory', icon: BrainIcon, count: countSub('ram'), parent: 'laptop-accessories' },
    { slug: 'ssd', name: 'SSD Storage', icon: ComputerIcon, count: countSub('ssd'), parent: 'laptop-accessories' },
    { slug: 'cooling-pad', name: 'Cooling', icon: SnowflakeIcon, count: countSub('cooling-pad'), parent: 'laptop-accessories' },
    { slug: 'gpu', name: 'GPUs', icon: GamepadIcon, count: countSub('gpu'), parent: 'laptop-accessories' },
    { slug: 'display', name: 'Displays', icon: ComputerIcon, count: countSub('display'), parent: 'laptop-accessories' },
    { slug: 'keyboard', name: 'Keyboards', icon: ComputerIcon, count: countSub('keyboard'), parent: 'laptop-accessories' },
    { slug: 'mouse', name: 'Mice', icon: ComputerIcon, count: countSub('mouse'), parent: 'laptop-accessories' },
    { slug: 'cable', name: 'USB Cables', icon: ComputerIcon, count: countSub('cable'), parent: 'laptop-accessories' },
    { slug: 'audio', name: 'Audio & Headsets', icon: ComputerIcon, count: countSub('audio'), parent: 'laptop-accessories' },
    { slug: 'cases', name: 'Laptop Cases', icon: ComputerIcon, count: countSub('cases'), parent: 'laptop-accessories' },
  ];

  const dynamicSubcategories = selectedCategory && !FLAT_CATEGORY_PARENTS[selectedCategory]
    ? Array.from(new Set(
        countSource
          .filter((p) => p.category === selectedCategory && p.subcategory)
          .map((p) => p.subcategory as string)
      ))
        .filter((slug) => !allSubcategories.some((sub) => sub.slug === slug && sub.parent === selectedCategory))
        .map((slug) => ({
          slug,
          name: titleFromSlug(slug),
          icon: ComputerIcon,
          count: countSub(slug),
          parent: selectedCategory,
        }))
    : [];

  const subcategories = selectedCategory
    ? [
        ...allSubcategories.filter(s => s.parent === selectedCategory),
        ...dynamicSubcategories.filter((sub) => !FLAT_CATEGORY_PARENTS[sub.slug]),
      ]
    : [];

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const headerTitle = selectedSubcategory
    ? allSubcategories.find((c) => c.slug === selectedSubcategory)?.name || SHOP_CATEGORY_LABELS[selectedSubcategory]
    : selectedCategory
    ? categories.find((c) => c.slug === selectedCategory)?.name || SHOP_CATEGORY_LABELS[selectedCategory] || 'Shop'
    : 'All Products';

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#0A0A0B] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[200px] bg-[#F7B500]/[0.04] -top-40 right-10" />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[180px] bg-[#FF6B35]/[0.03] top-40 -left-20" />
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative">
        {/* ── Editorial Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-[#F7B500]" />
            <span className="text-[#F7B500] text-[11px] tracking-[0.25em] uppercase font-medium">
              {selectedCategory || selectedSubcategory ? 'Filtered Catalogue' : 'Shop the catalogue'}
            </span>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-white">
                {headerTitle?.includes(' ') ? (
                  <>
                    {headerTitle.split(' ').slice(0, -1).join(' ')}{' '}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F7B500] to-[#FF6B35]">
                      {headerTitle.split(' ').slice(-1)}
                    </span>
                  </>
                ) : (
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F7B500] to-[#FF6B35]">
                    {headerTitle}
                  </span>
                )}
              </h1>
            </div>

            <div className="lg:col-span-4">
              <p className="text-white/40 text-sm leading-relaxed mb-5">
                Discover our curated collection of premium tech accessories, gadgets, and peripherals
                handpicked by enthusiasts.
              </p>
              <motion.button
                onClick={() => navigate('/pc-build')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F7B500] to-[#FF6B35] text-black font-bold text-xs uppercase tracking-wider transition-all hover:shadow-[0_0_25px_rgba(247,181,0,0.25)]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="9" y="9" width="6" height="6" />
                  <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
                </svg>
                Build Your PC
              </motion.button>
            </div>
          </div>

          <div className="mt-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </motion.div>

        {/* Search bar removed and moved to sidebar */}

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar with all filters */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:w-72 flex-shrink-0 w-full"
          >
            <FilterSidebar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              sortBy={sortBy}
              onSortChange={setSortBy}
              subcategories={subcategories}
              selectedSubcategory={selectedSubcategory}
              onSubcategoryChange={handleSubcategoryChange}
              filters={filters}
              selectedBrand={selectedBrand}
              onBrandChange={setSelectedBrand}
              selectedCondition={selectedCondition}
              onConditionChange={setSelectedCondition}
              selectedSpecFilters={selectedSpecFilters}
              onSpecFilterChange={(key, value) => {
                setSelectedSpecFilters((prev) => {
                  const next = { ...prev };
                  if (value) next[key] = value;
                  else delete next[key];
                  return next;
                });
              }}
              selectedRamType={selectedRamType}
              onRamTypeChange={setSelectedRamType}
              selectedRamSpeed={selectedRamSpeed}
              onRamSpeedChange={setSelectedRamSpeed}
              selectedRamCapacity={selectedRamCapacity}
              onRamCapacityChange={setSelectedRamCapacity}
              selectedSsdType={selectedSsdType}
              onSsdTypeChange={setSelectedSsdType}
              selectedSsdCapacity={selectedSsdCapacity}
              onSsdCapacityChange={setSelectedSsdCapacity}
              selectedCompatibility={selectedCompatibility}
              onCompatibilityChange={setSelectedCompatibility}
              onResetFilters={resetAdvancedFilters}
            />
          </motion.aside>

          {/* Products */}
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex-1"
          >
            {/* Results count and mobile sort */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-white/60">
                  {searchQuery && (
                    <span className="block text-sm text-primary mb-1">
                      Results for "{searchQuery}"
                    </span>
                  )}
                  Showing{' '}
                  <span className="text-white font-medium">
                    {filteredProducts.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredProducts.length)}
                  </span>{' '}
                  of{' '}
                  <span className="text-white font-medium">
                    {filteredProducts.length}
                  </span>{' '}
                  products
                </p>
              </div>

              {/* Mobile sort */}
              <div className="lg:hidden">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>

            <ProductGrid
              products={paginatedProducts}
              isLoading={isLoading}
              onQuickView={handleQuickView}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 mt-12"
              >
                {/* Previous button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === 1
                      ? 'bg-dark-300 text-white/30 cursor-not-allowed'
                      : 'bg-dark-200 text-white hover:bg-dark-100 border border-white/10'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    disabled={page === '...'}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      page === currentPage
                        ? 'bg-primary text-dark'
                        : page === '...'
                        ? 'bg-transparent text-white/50 cursor-default'
                        : 'bg-dark-200 text-white hover:bg-dark-100 border border-white/10'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === totalPages
                      ? 'bg-dark-300 text-white/30 cursor-not-allowed'
                      : 'bg-dark-200 text-white hover:bg-dark-100 border border-white/10'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </motion.div>
            )}
          </motion.main>
        </div>
      </div>

      {/* Quick view modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
};

export default Shop;
