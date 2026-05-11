import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

interface AdminFilterCat { id: string; slug: string; name: string; order: number; visible: boolean; parentSlug?: string | null }

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

interface Subcategory {
  slug: string;
  name: string;
  icon: React.ComponentType<any> | string;
  count?: number;
}

interface FilterSidebarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  categories: { name: string; slug: string; count: number }[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  subcategories?: Subcategory[];
  selectedSubcategory?: string | null;
  onSubcategoryChange?: (subcategory: string | null) => void;
  filters?: ProductFilters | null;
  selectedBrand?: string | null;
  onBrandChange?: (brand: string | null) => void;
  selectedCondition?: string | null;
  onConditionChange?: (condition: string | null) => void;
  selectedSpecFilters?: Record<string, string>;
  onSpecFilterChange?: (key: string, value: string | null) => void;
  selectedRamType?: string | null;
  onRamTypeChange?: (ramType: string | null) => void;
  selectedRamSpeed?: number | null;
  onRamSpeedChange?: (ramSpeed: number | null) => void;
  selectedRamCapacity?: number | null;
  onRamCapacityChange?: (ramCapacity: number | null) => void;
  selectedSsdType?: string | null;
  onSsdTypeChange?: (ssdType: string | null) => void;
  selectedSsdCapacity?: number | null;
  onSsdCapacityChange?: (ssdCapacity: number | null) => void;
  selectedCompatibility?: string | null;
  onCompatibilityChange?: (compatibility: string | null) => void;
  onResetFilters?: () => void;
}

/* ── Collapsible group ── */
const Group: React.FC<{
  label: string;
  defaultOpen?: boolean;
  badge?: string | number;
  children: React.ReactNode;
}> = ({ label, defaultOpen = true, badge, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/[0.06] py-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between group mb-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-white/45 group-hover:text-white/70 transition-colors">
            {label}
          </span>
          {badge !== undefined && badge !== '' && (
            <span className="text-[9px] font-bold text-[#F7B500] bg-[#F7B500]/10 border border-[#F7B500]/20 rounded-full px-1.5 py-0.5">
              {badge}
            </span>
          )}
        </div>
        <motion.svg
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.2 }}
          className="w-3 h-3 text-white/30 group-hover:text-[#F7B500] transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Pill chip ── */
const Chip: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}> = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    className={`relative w-full text-left text-sm rounded-lg px-3 py-2 flex items-center justify-between transition-all ${
      active
        ? 'text-[#F7B500] bg-[#F7B500]/[0.08]'
        : 'text-white/55 hover:text-white hover:bg-white/[0.03]'
    }`}
  >
    <span className="capitalize">{children}</span>
    {count !== undefined && (
      <span
        className={`text-[10px] font-mono ${
          active ? 'text-[#F7B500]/70' : 'text-white/25'
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  searchQuery = '',
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortChange,
  isMobile = false,
  isOpen = true,
  onClose,
  subcategories = [],
  selectedSubcategory,
  onSubcategoryChange,
  filters,
  selectedBrand,
  onBrandChange,
  selectedCondition,
  onConditionChange,
  selectedSpecFilters = {},
  onSpecFilterChange,
  selectedRamType,
  onRamTypeChange,
  selectedRamSpeed,
  onRamSpeedChange,
  selectedRamCapacity,
  onRamCapacityChange,
  selectedSsdType,
  onSsdTypeChange,
  selectedSsdCapacity,
  onSsdCapacityChange,
  selectedCompatibility,
  onCompatibilityChange,
  onResetFilters,
}) => {
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);
  const [adminCats, setAdminCats] = useState<AdminFilterCat[]>([]);
  useEffect(() => {
    api.get('/filter-categories').then(r => setAdminCats(r.data?.categories || [])).catch(() => {});
  }, []);

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price ↑' },
    { value: 'price-high', label: 'Price ↓' },
    { value: 'name', label: 'A → Z' },
  ];

  const handlePriceApply = () => onPriceRangeChange(localPriceRange);

  const handleReset = () => {
    onCategoryChange(null);
    onSubcategoryChange?.(null);
    setLocalPriceRange([0, 500000]);
    onPriceRangeChange([0, 500000]);
    onSortChange('featured');
    onResetFilters?.();
  };

  const activeSpecFilterCount =
    (selectedBrand ? 1 : 0) +
    (selectedCondition ? 1 : 0) +
    Object.values(selectedSpecFilters).filter(Boolean).length +
    (selectedRamType ? 1 : 0) +
    (selectedRamSpeed ? 1 : 0) +
    (selectedRamCapacity ? 1 : 0) +
    (selectedSsdType ? 1 : 0) +
    (selectedSsdCapacity ? 1 : 0) +
    (selectedCompatibility ? 1 : 0);
  const hasActiveSpecFilters = activeSpecFilterCount > 0;

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (selectedSubcategory ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (selectedCondition ? 1 : 0) +
    Object.values(selectedSpecFilters).filter(Boolean).length +
    (selectedRamType ? 1 : 0) +
    (selectedRamSpeed ? 1 : 0) +
    (selectedRamCapacity ? 1 : 0) +
    (selectedSsdType ? 1 : 0) +
    (selectedSsdCapacity ? 1 : 0) +
    (selectedCompatibility ? 1 : 0);

  const selectCls =
    'w-full px-3 py-2 bg-transparent border-b border-white/10 text-white/80 text-xs focus:outline-none focus:border-[#F7B500] transition-colors appearance-none cursor-pointer';
  const hiddenParentSlugs = new Set(['laptop-accessories', 'components']);

  // Note: do NOT redeclare this as a nested React component (`const FilterContent = () => (...)`).
  // A nested component is a brand-new function reference on every parent render, so React
  // unmounts/remounts the entire subtree on each keystroke - causing the search input
  // to lose focus after a single character. Use a plain JSX node instead.
  const filterContent = (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <span className="w-1 h-5 bg-gradient-to-b from-[#F7B500] to-[#FF6B35] rounded-full" />
          <span className="text-white font-bold text-sm tracking-wide">Refine</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-[#F7B500] text-black text-[10px] font-black rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={handleReset}
            className="text-[10px] text-white/40 hover:text-[#F7B500] transition-colors uppercase tracking-wider"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Search ── */}
      {onSearchChange && (
        <div className="py-5 border-b border-white/[0.06]">
          <div className="relative group">
            <svg
              className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#F7B500] transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-7 pr-2 py-2.5 bg-transparent border-b border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#F7B500] transition-colors"
            />
          </div>
        </div>
      )}

      {/* ── Categories (merged with admin-managed list) ── */}
      <Group label="Categories">
        <div className="space-y-0.5">
          <Chip
            active={selectedCategory === null}
            onClick={() => onCategoryChange(null)}
            count={categories.reduce((s, c) => s + c.count, 0)}
          >
            All Products
          </Chip>
          {(() => {
            // Hide categories the admin marked hidden; reorder by admin `order`; add admin-only categories with count 0.
            const adminBySlug = new Map(adminCats.map(c => [c.slug, c]));
            const visibleParent = adminCats.filter(c => c.visible && !c.parentSlug && !hiddenParentSlugs.has(c.slug));
            const hiddenSlugs = new Set([
              ...adminCats.filter(c => !c.visible && !c.parentSlug).map(c => c.slug),
              ...hiddenParentSlugs,
            ]);
            const merged = [
              ...visibleParent.map(ac => {
                const found = categories.find(c => c.slug === ac.slug);
                return { name: ac.name, slug: ac.slug, count: found?.count || 0, _order: ac.order };
              }),
              ...categories
                .filter(c => !adminBySlug.has(c.slug) && !hiddenSlugs.has(c.slug))
                .map(c => ({ ...c, _order: 999 })),
            ];
            return merged.sort((a, b) => a._order - b._order).map((c) => (
              <Chip
                key={c.slug}
                active={selectedCategory === c.slug}
                onClick={() => onCategoryChange(c.slug)}
                count={c.count}
              >
                {c.name}
              </Chip>
            ));
          })()}
        </div>
      </Group>

      {/* ── Subcategories ── */}
      {selectedCategory && subcategories.length > 0 && (
        <Group label="Product Type">
          <div className="space-y-0.5">
            <Chip active={!selectedSubcategory} onClick={() => onSubcategoryChange?.(null)}>
              All {categories.find((cat) => cat.slug === selectedCategory)?.name || 'Products'}
            </Chip>
            {subcategories.map((sub) => (
              <Chip
                key={sub.slug}
                active={selectedSubcategory === sub.slug}
                onClick={() => onSubcategoryChange?.(sub.slug)}
                count={sub.count}
              >
                {sub.name}
              </Chip>
            ))}
          </div>
        </Group>
      )}

      {/* ── Specifications ── */}
      {selectedCategory && filters && (
        <Group label="Specifications" badge={hasActiveSpecFilters ? activeSpecFilterCount : ''}>
          <div className="space-y-4">
            {filters.brands.length > 0 && (
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Brand</p>
                <select
                  value={selectedBrand || ''}
                  onChange={(e) => onBrandChange?.(e.target.value || null)}
                  className={selectCls}
                >
                  <option value="" className="bg-[#0A0A0B]">
                    All Brands
                  </option>
                  {filters.brands.map((b) => (
                    <option key={b} value={b} className="bg-[#0A0A0B]">
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(filters.conditions || []).length > 0 && (
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Condition</p>
                <select
                  value={selectedCondition || ''}
                  onChange={(e) => onConditionChange?.(e.target.value || null)}
                  className={selectCls}
                >
                  <option value="" className="bg-[#0A0A0B]">Any Condition</option>
                  {(filters.conditions || []).map((condition) => (
                    <option key={condition} value={condition} className="bg-[#0A0A0B]">
                      {condition === 'new' ? 'Brand New' : condition.charAt(0).toUpperCase() + condition.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(filters.specFilters || []).map((filter) => (
              <div key={filter.key}>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">{filter.key}</p>
                <select
                  value={selectedSpecFilters[filter.key] || ''}
                  onChange={(e) => onSpecFilterChange?.(filter.key, e.target.value || null)}
                  className={selectCls}
                >
                  <option value="" className="bg-[#0A0A0B]">All {filter.key}</option>
                  {filter.values.map((value) => (
                    <option key={value} value={value} className="bg-[#0A0A0B]">{value}</option>
                  ))}
                </select>
              </div>
            ))}

            {selectedSubcategory === 'ram' && (
              <>
                {filters.ramTypes.length > 0 && (
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">
                      Generation
                    </p>
                    <select
                      value={selectedRamType || ''}
                      onChange={(e) => onRamTypeChange?.(e.target.value || null)}
                      className={selectCls}
                    >
                      <option value="" className="bg-[#0A0A0B]">All Types</option>
                      {filters.ramTypes.map((t) => (
                        <option key={t} value={t} className="bg-[#0A0A0B]">{t}</option>
                      ))}
                    </select>
                  </div>
                )}
                {filters.ramSpeeds.length > 0 && (
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Bus Speed</p>
                    <select
                      value={selectedRamSpeed?.toString() || ''}
                      onChange={(e) =>
                        onRamSpeedChange?.(e.target.value ? parseInt(e.target.value) : null)
                      }
                      className={selectCls}
                    >
                      <option value="" className="bg-[#0A0A0B]">All Speeds</option>
                      {filters.ramSpeeds.map((s) => (
                        <option key={s} value={s} className="bg-[#0A0A0B]">{s} MHz</option>
                      ))}
                    </select>
                  </div>
                )}
                {filters.ramCapacities.length > 0 && (
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Capacity</p>
                    <select
                      value={selectedRamCapacity?.toString() || ''}
                      onChange={(e) =>
                        onRamCapacityChange?.(e.target.value ? parseInt(e.target.value) : null)
                      }
                      className={selectCls}
                    >
                      <option value="" className="bg-[#0A0A0B]">All Capacities</option>
                      {filters.ramCapacities.map((c) => (
                        <option key={c} value={c} className="bg-[#0A0A0B]">{c} GB</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {selectedSubcategory === 'ssd' && (
              <>
                {filters.ssdTypes.length > 0 && (
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Type</p>
                    <select
                      value={selectedSsdType || ''}
                      onChange={(e) => onSsdTypeChange?.(e.target.value || null)}
                      className={selectCls}
                    >
                      <option value="" className="bg-[#0A0A0B]">All Types</option>
                      {filters.ssdTypes.map((t) => (
                        <option key={t} value={t} className="bg-[#0A0A0B]">{t}</option>
                      ))}
                    </select>
                  </div>
                )}
                {filters.ssdCapacities.length > 0 && (
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Capacity</p>
                    <select
                      value={selectedSsdCapacity?.toString() || ''}
                      onChange={(e) =>
                        onSsdCapacityChange?.(e.target.value ? parseInt(e.target.value) : null)
                      }
                      className={selectCls}
                    >
                      <option value="" className="bg-[#0A0A0B]">All Capacities</option>
                      {filters.ssdCapacities.map((c) => (
                        <option key={c} value={c} className="bg-[#0A0A0B]">
                          {c >= 1024 ? `${c / 1024} TB` : `${c} GB`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {filters.compatibleLaptops.length > 0 && (
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">
                  Compatible With
                </p>
                <select
                  value={selectedCompatibility || ''}
                  onChange={(e) => onCompatibilityChange?.(e.target.value || null)}
                  className={selectCls}
                >
                  <option value="" className="bg-[#0A0A0B]">All Laptops</option>
                  {filters.compatibleLaptops.map((l) => (
                    <option key={l} value={l} className="bg-[#0A0A0B]">{l}</option>
                  ))}
                </select>
              </div>
            )}

            {hasActiveSpecFilters && (
              <div className="pt-1 flex flex-wrap gap-1.5">
                {[
                  selectedBrand && { label: selectedBrand, clear: () => onBrandChange?.(null) },
                  selectedCondition && {
                    label: selectedCondition === 'new' ? 'Brand New' : selectedCondition,
                    clear: () => onConditionChange?.(null),
                  },
                  ...Object.entries(selectedSpecFilters)
                    .filter(([, value]) => value)
                    .map(([key, value]) => ({
                      label: `${key}: ${value}`,
                      clear: () => onSpecFilterChange?.(key, null),
                    })),
                  selectedRamType && { label: selectedRamType, clear: () => onRamTypeChange?.(null) },
                  selectedRamSpeed && {
                    label: `${selectedRamSpeed} MHz`,
                    clear: () => onRamSpeedChange?.(null),
                  },
                  selectedRamCapacity && {
                    label: `${selectedRamCapacity} GB`,
                    clear: () => onRamCapacityChange?.(null),
                  },
                  selectedSsdType && { label: selectedSsdType, clear: () => onSsdTypeChange?.(null) },
                  selectedSsdCapacity && {
                    label:
                      selectedSsdCapacity >= 1024
                        ? `${selectedSsdCapacity / 1024} TB`
                        : `${selectedSsdCapacity} GB`,
                    clear: () => onSsdCapacityChange?.(null),
                  },
                  selectedCompatibility && {
                    label: selectedCompatibility,
                    clear: () => onCompatibilityChange?.(null),
                  },
                ]
                  .filter(Boolean)
                  .map((chip: any, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-[#F7B500]/10 border border-[#F7B500]/20 text-[#F7B500] rounded-full text-[10px] flex items-center gap-1.5 font-medium"
                    >
                      {chip.label}
                      <button
                        onClick={chip.clear}
                        className="hover:text-white text-[#F7B500]/60 leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>
        </Group>
      )}

      {/* ── Price ── */}
      <Group label="Price (LKR)">
        <div className="flex items-center justify-between mb-3 text-[11px] font-mono">
          <span className="text-white/55">Rs. {localPriceRange[0].toLocaleString()}</span>
          <span className="text-white/20">→</span>
          <span className="text-white/55">Rs. {localPriceRange[1].toLocaleString()}</span>
        </div>

        <div className="relative h-1.5 bg-white/[0.06] rounded-full mb-4">
          <div
            className="absolute h-full bg-gradient-to-r from-[#F7B500] to-[#FF6B35] rounded-full"
            style={{
              left: `${(localPriceRange[0] / 500000) * 100}%`,
              right: `${100 - (localPriceRange[1] / 500000) * 100}%`,
            }}
          />
          <input
            type="range"
            min={0}
            max={500000}
            step={1000}
            value={localPriceRange[0]}
            onChange={(e) =>
              setLocalPriceRange([Number(e.target.value), localPriceRange[1]])
            }
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <input
            type="range"
            min={0}
            max={500000}
            step={1000}
            value={localPriceRange[1]}
            onChange={(e) =>
              setLocalPriceRange([localPriceRange[0], Number(e.target.value)])
            }
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <input
            type="number"
            placeholder="Min"
            value={localPriceRange[0]}
            onChange={(e) =>
              setLocalPriceRange([Number(e.target.value), localPriceRange[1]])
            }
            className="px-2.5 py-1.5 bg-transparent border-b border-white/10 text-white text-xs focus:outline-none focus:border-[#F7B500] transition-colors"
          />
          <input
            type="number"
            placeholder="Max"
            value={localPriceRange[1]}
            onChange={(e) =>
              setLocalPriceRange([localPriceRange[0], Number(e.target.value)])
            }
            className="px-2.5 py-1.5 bg-transparent border-b border-white/10 text-white text-xs focus:outline-none focus:border-[#F7B500] transition-colors"
          />
        </div>

        <button
          onClick={handlePriceApply}
          className="w-full py-2 bg-gradient-to-r from-[#F7B500] to-[#FF6B35] text-black text-[10px] font-bold rounded-lg hover:opacity-90 transition-opacity uppercase tracking-wider"
        >
          Apply
        </button>
      </Group>

      {/* ── Sort ── pill row */}
      <Group label="Sort By">
        <div className="grid grid-cols-2 gap-1.5">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`px-2 py-2 rounded-lg text-[11px] font-medium transition-all ${
                sortBy === opt.value
                  ? 'bg-[#F7B500] text-black'
                  : 'bg-white/[0.03] text-white/55 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Group>
    </div>
  );

  if (isMobile) {
    if (!isOpen) return null;
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        />
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed left-0 top-0 bottom-0 w-80 bg-[#0A0A0B] border-r border-white/[0.06] z-50 overflow-y-auto"
        >
          <div className="sticky top-0 bg-[#0A0A0B] px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Refine</h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-5">
            {filterContent}
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <div className="bg-[#0F0F11] border border-white/[0.06] rounded-2xl p-5 sticky top-28 w-full">
      {filterContent}
    </div>
  );
};

export default FilterSidebar;
