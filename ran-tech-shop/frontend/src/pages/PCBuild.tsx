import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import type { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import EmailQuoteButton from '../components/ui/EmailQuoteButton';
import { useAuthStore } from '../store/authStore';

/* ─── Build Categories ───────────────────────────────────────── */
const BUILD_CATEGORIES = [
  {
    key: 'processor',
    label: 'Processor',
    desc: 'The brain of your PC',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
      </svg>
    ),
    cat: 'components',
    sub: 'processor',
    keywords: ['processor', 'cpu', 'ryzen', 'intel core'],
  },
  {
    key: 'motherboard',
    label: 'Motherboard',
    desc: 'The backbone of every build',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <rect x="6" y="6" width="4" height="4" />
        <rect x="14" y="6" width="4" height="4" />
        <rect x="6" y="14" width="4" height="4" />
        <path d="M14 14h4v4M10 8h4M8 10v4M12 14v4" />
      </svg>
    ),
    cat: 'components',
    sub: 'motherboard',
    keywords: ['motherboard', 'mainboard', 'mobo'],
  },
  {
    key: 'gpu',
    label: 'Graphics Card',
    desc: 'Visual horsepower',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="5" width="22" height="14" rx="2" />
        <circle cx="8" cy="12" r="3" />
        <circle cx="16" cy="12" r="3" />
        <path d="M5 19v2M9 19v2M15 19v2M19 19v2" />
      </svg>
    ),
    cat: 'graphics-cards',
    sub: null,
    keywords: ['graphics', 'gpu', 'rtx', 'gtx', 'radeon'],
  },
  {
    key: 'ram',
    label: 'Memory',
    desc: 'Speed & multitasking',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="1" />
        <path d="M6 6V4M10 6V4M14 6V4M18 6V4" />
        <rect x="5" y="9" width="3" height="6" rx="0.5" />
        <rect x="10" y="9" width="3" height="6" rx="0.5" />
        <rect x="16" y="9" width="3" height="6" rx="0.5" />
      </svg>
    ),
    cat: 'laptop-accessories',
    sub: 'ram',
    keywords: ['ram', 'memory', 'ddr4', 'ddr5'],
  },
  {
    key: 'storage',
    label: 'Storage',
    desc: 'SSDs & hard drives',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1" />
      </svg>
    ),
    cat: 'storage',
    sub: null,
    keywords: ['ssd', 'storage', 'nvme', 'hdd', 'hard drive'],
  },
  {
    key: 'cooler',
    label: 'CPU Cooler',
    desc: 'Thermal management',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18M3 12h18" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    cat: 'laptop-accessories',
    sub: 'cooling-pad',
    keywords: ['cooling', 'cooler', 'thermal', 'fan', 'aio'],
  },
  {
    key: 'psu',
    label: 'Power Supply',
    desc: 'Clean, reliable power',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    cat: 'components',
    sub: 'psu',
    keywords: ['psu', 'power supply', 'watts'],
  },
  {
    key: 'case',
    label: 'PC Case',
    desc: 'Style meets airflow',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <circle cx="12" cy="7" r="2" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="8" y1="15" x2="16" y2="15" />
        <circle cx="12" cy="19" r="1" />
      </svg>
    ),
    cat: 'components',
    sub: 'case',
    keywords: ['case', 'chassis', 'tower'],
  },
];

/* ─── Helpers ─────────────────────────────────────────────────── */
const formatPrice = (p: number) => p.toLocaleString('en-LK');

/* ─── Reveal Text (same as RepairHome) ────────────────────────── */
const RevealText = ({ children, className = '', delay = 0 }: { children: string; className?: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {children.split(' ').map((word, i) => (
        <span key={i} className="overflow-hidden inline-block mr-[0.3em]">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', rotate: 2 }}
            animate={isInView ? { y: '0%', rotate: 0 } : { y: '110%', rotate: 2 }}
            transition={{ duration: 0.8, delay: delay + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

/* ─── Product Card ────────────────────────────────────────────── */
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80';

const ProductPickCard: React.FC<{
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}> = ({ product, isSelected, onSelect, index }) => (
  <motion.button
    onClick={onSelect}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -4 }}
    className={`group relative w-full text-left overflow-hidden aspect-[3/4] transition-[border-color,box-shadow] duration-500 ${
      isSelected
        ? 'border border-black shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)]'
        : 'border border-black/10 hover:border-black/40'
    }`}
  >
    {/* Full-bleed background image */}
    <img
      src={product.image}
      alt={product.name}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
    />

    {/* Bottom-up gradient for text legibility */}
    <div className={`absolute inset-0 transition-opacity duration-500 bg-gradient-to-t ${
      isSelected
        ? 'from-black via-black/70 to-black/10 opacity-100'
        : 'from-black/95 via-black/50 to-transparent opacity-90 group-hover:opacity-100'
    }`} />

    {/* Top-right step number badge */}
    <div className="absolute top-4 left-4 z-10">
      <span className="text-[10px] font-mono tracking-[0.3em] text-white/60 uppercase">
        {product.brand || 'Component'}
      </span>
    </div>

    {/* Selected check */}
    {isSelected ? (
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="absolute top-4 right-4 w-9 h-9 bg-white flex items-center justify-center z-10 shadow-lg"
      >
        <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>
    ) : (
      <div className="absolute top-4 right-4 w-9 h-9 border border-white/30 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm bg-white/5">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </div>
    )}

    {/* Bottom info */}
    <div className="absolute inset-x-0 bottom-0 p-5 z-10">
      <h4 className="text-base font-medium text-white leading-tight mb-1 line-clamp-2">{product.name}</h4>
      <div className="flex items-end justify-between mt-3">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-1">Price</p>
          <p className="text-xl font-bold tracking-tight text-white">Rs. {formatPrice(product.price)}</p>
        </div>
        {isSelected && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] tracking-[0.25em] uppercase text-white/70 pb-1"
          >
            Selected
          </motion.span>
        )}
      </div>
    </div>

    {/* Subtle bottom accent line on selected */}
    {isSelected && (
      <motion.div
        layoutId={`accent-${product.id}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        className="absolute bottom-0 left-0 right-0 h-[3px] bg-white origin-left"
      />
    )}
  </motion.button>
);

/* ═══════════════════════════════════════════════════════════════ */
/*  Main Component                                                */
/* ═══════════════════════════════════════════════════════════════ */
const PCBuild: React.FC = () => {
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addItem);
  const [activeStep, setActiveStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, Product | null>>({});
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [showSummary, setShowSummary] = useState(false);

  const currentCat = BUILD_CATEGORIES[activeStep];
  const totalPrice = Object.values(selections).filter(Boolean).reduce((s, p) => s + (p?.price || 0), 0);
  const selectedCount = Object.values(selections).filter(Boolean).length;

  /* fetch products per step */
  useEffect(() => {
    const cat = BUILD_CATEGORIES[activeStep] as (typeof BUILD_CATEGORIES)[number] & { keywords?: string[] };
    if (products[cat.key]?.length) return;

    const fetchProducts = async () => {
      setLoading((p) => ({ ...p, [cat.key]: true }));

      const dedupe = (arr: Product[]) => {
        const seen = new Set<string>();
        return arr.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
      };

      try {
        // 1) Strict: exact category (+ subcategory). admin-tagged builds get priority
        const strictParams = new URLSearchParams();
        strictParams.set('limit', '50');
        strictParams.set('isService', 'false');
        strictParams.set('category', cat.cat);
        if (cat.sub) strictParams.set('subcategory', cat.sub);
        const strictRes = await api.get(`/products?${strictParams.toString()}`);
        let list: Product[] = strictRes.data.products || strictRes.data || [];

        // 2) If empty, search the DB by keyword(s). picks up products the admin
        //    saved under different categories but whose name/description matches.
        if (list.length === 0 && cat.keywords?.length) {
          const keywordResults = await Promise.all(
            cat.keywords.map((kw) =>
              api
                .get(`/products`, {
                  params: { limit: 20, isService: 'false', search: kw },
                })
                .then((r) => (r.data.products || r.data || []) as Product[])
                .catch(() => [] as Product[])
            )
          );
          // Drop products that are clearly not a build component (e.g., laptops
          // matching on "i7" / "ryzen" mentions in their name/specs)
          list = dedupe(keywordResults.flat()).filter(
            (p: any) => p.category?.toLowerCase() !== 'laptops'
          );
        }

        setProducts((p) => ({ ...p, [cat.key]: list }));
      } catch {
        setProducts((p) => ({ ...p, [cat.key]: [] }));
      } finally {
        setLoading((p) => ({ ...p, [cat.key]: false }));
      }
    };
    fetchProducts();
  }, [activeStep]);

  const handleSelect = (product: Product) => {
    setSelections((prev) => ({
      ...prev,
      [currentCat.key]: prev[currentCat.key]?.id === product.id ? null : product,
    }));
  };

  const handleAddAllToCart = () => {
    Object.values(selections).forEach((product) => {
      if (product) {
        addToCart({ id: product.id, name: product.name, price: product.price, image: product.image });
      }
    });
    navigate('/checkout');
  };

  return (
    <div className="relative min-h-screen bg-white text-black overflow-hidden">
      {/* ══════════════════════════════════════════════════════ */}
      {/*  HERO. Black, minimal, same as RepairContact hero   */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 bg-black text-white overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pcBuildGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pcBuildGrid)" />
          </svg>
        </div>

        <div className="relative z-10 container mx-auto px-4 lg:px-6">
          <motion.div initial={{ width: 0 }} animate={{ width: 80 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-px bg-white mb-8"
          />

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-white/40 uppercase tracking-[0.4em] text-xs mb-4"
          >
            RAN Repair / Custom Build
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black leading-[0.95] tracking-tight"
          >
            Build your
            <br />
            <span className="text-white/40">dream PC.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-white/50 text-lg mt-8 max-w-xl leading-relaxed"
          >
            Pick every component. We assemble, stress-test, and hand it over precision-built to your exact spec at our shop.
          </motion.p>

          {/* Feature strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10"
          >
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                label: '2 Year Warranty',
                sub: 'On all custom builds',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                label: 'Stress Tested',
                sub: '72-hour burn-in test',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ),
                label: 'Expert Assembly',
                sub: 'By certified technicians',
              },
            ].map((f, i) => (
              <motion.div key={i} whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }} className="bg-black p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-white/40">{f.icon}</span>
                  <span className="text-white/40 text-xs uppercase tracking-widest">{f.label}</span>
                </div>
                <p className="text-white/30 text-sm">{f.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  CONFIGURATOR. White bg, black accents               */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Section header */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-black/20" />
              <span className="text-xs font-mono tracking-[0.3em] text-black/40 uppercase">Configurator</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-light text-black tracking-tight">
              <RevealText>Choose Your Components</RevealText>
            </h2>
          </motion.div>

          {/* Step indicator. horizontal scrollable */}
          <div className="mb-12 overflow-x-auto scrollbar-hide">
            <div className="flex gap-px min-w-max bg-black/5">
              {BUILD_CATEGORIES.map((cat, i) => {
                const isActive = activeStep === i && !showSummary;
                const isSelected = !!selections[cat.key];
                return (
                  <button
                    key={cat.key}
                    onClick={() => { setActiveStep(i); setShowSummary(false); }}
                    className={`relative flex items-center gap-3 px-6 py-4 text-left transition-all duration-300 ${
                      isActive
                        ? 'bg-black text-white'
                        : isSelected
                        ? 'bg-white text-black'
                        : 'bg-white text-black/40 hover:text-black/60 hover:bg-black/[0.02]'
                    }`}
                  >
                    <span className={`flex-shrink-0 ${isActive ? 'text-white' : isSelected ? 'text-black' : 'text-black/30'}`}>
                      {isSelected && !isActive ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : cat.icon}
                    </span>
                    <div>
                      <p className="text-xs font-medium whitespace-nowrap">{cat.label}</p>
                      {isSelected && selections[cat.key] && !isActive && (
                        <p className="text-[10px] text-black/30 truncate max-w-[100px]">{selections[cat.key]!.name}</p>
                      )}
                    </div>
                    <span className={`text-[10px] font-mono ml-2 ${isActive ? 'text-white/40' : 'text-black/20'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* Active bottom line */}
                    {isActive && (
                      <motion.div layoutId="activeStepLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
                    )}
                  </button>
                );
              })}

              {/* Final Step. Review Build */}
              {(() => {
                const reviewActive = showSummary;
                const allDone = selectedCount === BUILD_CATEGORIES.length;
                return (
                  <button
                    key="review"
                    onClick={() => setShowSummary(true)}
                    className={`relative flex items-center gap-3 px-6 py-4 text-left transition-all duration-300 ${
                      reviewActive
                        ? 'bg-black text-white'
                        : allDone
                        ? 'bg-white text-black'
                        : 'bg-white text-black/40 hover:text-black/60 hover:bg-black/[0.02]'
                    }`}
                  >
                    <span className={`flex-shrink-0 ${reviewActive ? 'text-white' : allDone ? 'text-black' : 'text-black/30'}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-xs font-medium whitespace-nowrap">Review</p>
                      <p className={`text-[10px] truncate max-w-[120px] ${reviewActive ? 'text-white/40' : 'text-black/30'}`}>
                        {selectedCount}/{BUILD_CATEGORIES.length} components
                      </p>
                    </div>
                    <span className={`text-[10px] font-mono ml-2 ${reviewActive ? 'text-white/40' : 'text-black/20'}`}>
                      {String(BUILD_CATEGORIES.length + 1).padStart(2, '0')}
                    </span>
                    {reviewActive && (
                      <motion.div layoutId="activeStepLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
                    )}
                  </button>
                );
              })()}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {showSummary ? (
              /* ─── BUILD SUMMARY ──────────────────────────── */
              <SummaryView
                key="summary"
                selections={selections}
                totalPrice={totalPrice}
                selectedCount={selectedCount}
                onBack={() => setShowSummary(false)}
                onSelectStep={(i) => { setActiveStep(i); setShowSummary(false); }}
                onCheckout={handleAddAllToCart}
              />
            ) : (
              /* ─── PRODUCT GRID ───────────────────────────── */
              <motion.div
                key={currentCat.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Active step header */}
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-black/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 border border-black flex items-center justify-center">
                      {currentCat.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-black tracking-tight">{currentCat.label}</h3>
                      <p className="text-xs text-black/40 mt-0.5">{currentCat.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-black/20 tracking-wider">
                    Step {String(activeStep + 1).padStart(2, '0')} / {String(BUILD_CATEGORIES.length).padStart(2, '0')}
                  </span>
                </div>

                {/* Loading skeleton */}
                {loading[currentCat.key] ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-black/5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="bg-white animate-pulse">
                        <div className="aspect-square bg-black/[0.03]" />
                        <div className="p-5 space-y-3">
                          <div className="h-3 bg-black/5 rounded w-3/4" />
                          <div className="h-2 bg-black/5 rounded w-1/2" />
                          <div className="h-4 bg-black/5 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (products[currentCat.key]?.length || 0) === 0 ? (
                  /* Empty state */
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center py-24 border border-dashed border-black/10"
                  >
                    <div className="w-16 h-16 border border-black/10 flex items-center justify-center mx-auto mb-6 text-black/20">
                      {currentCat.icon}
                    </div>
                    <p className="text-black/40 mb-2">No {currentCat.label.toLowerCase()} products available yet.</p>
                    <button
                      onClick={() => setActiveStep((p) => Math.min(p + 1, BUILD_CATEGORIES.length - 1))}
                      className="text-sm text-black underline underline-offset-4 mt-4"
                    >
                      Skip to next
                    </button>
                  </motion.div>
                ) : (
                  /* Product grid. full-bleed image cards */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products[currentCat.key]?.map((product, idx) => (
                      <ProductPickCard
                        key={product.id}
                        product={product}
                        isSelected={selections[currentCat.key]?.id === product.id}
                        onSelect={() => handleSelect(product)}
                        index={idx}
                      />
                    ))}
                  </div>
                )}

                {/* Selected indicator */}
                {selections[currentCat.key] && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex items-center justify-between p-5 bg-black text-white"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">
                        <span className="font-medium">{selections[currentCat.key]!.name}</span>
                        <span className="text-white/40 ml-2">Rs. {formatPrice(selections[currentCat.key]!.price)}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => setSelections((p) => ({ ...p, [currentCat.key]: null }))}
                      className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-wider"
                    >
                      Remove
                    </button>
                  </motion.div>
                )}

                {/* Step navigation */}
                <div className="flex items-center justify-between mt-12 pt-8 border-t border-black/10">
                  <button
                    onClick={() => setActiveStep((p) => Math.max(p - 1, 0))}
                    disabled={activeStep === 0}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      activeStep === 0 ? 'text-black/20 cursor-not-allowed' : 'text-black/50 hover:text-black'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  {activeStep < BUILD_CATEGORIES.length - 1 ? (
                    <button
                      onClick={() => setActiveStep((p) => p + 1)}
                      className="flex items-center gap-2 px-8 py-3 bg-black text-white text-sm font-medium hover:bg-black/80 transition-colors"
                    >
                      Next Component
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSummary(true)}
                      className="flex items-center gap-2 px-8 py-3 bg-black text-white text-sm font-medium hover:bg-black/80 transition-colors"
                    >
                      Review Build
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  CTA SECTION. Black, same style as RepairHome CTA    */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-32 bg-black text-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tight mb-4">
              <RevealText>Not sure what</RevealText>
            </h2>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-extralight text-white/30">
              <RevealText delay={0.3}>to pick?</RevealText>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm text-white/40 mb-12 mt-8 max-w-md mx-auto leading-relaxed"
          >
            Talk to our build specialists. We'll recommend the perfect configuration for your use case and budget.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/repair-contact')}
              className="px-12 py-5 bg-white text-black font-medium text-sm tracking-wide"
            >
              Get Expert Advice
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowSummary(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="px-12 py-5 border border-white/20 text-white font-medium text-sm tracking-wide hover:bg-white/5 transition-colors"
            >
              Start Building
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 1 }}
            className="flex items-center justify-center gap-8 mt-16 text-xs text-white/20"
          >
            <span className="tracking-widest uppercase">Free Assembly</span>
            <span className="w-1 h-1 bg-white/20 rotate-45" />
            <span className="tracking-widest uppercase">Stress Tested</span>
            <span className="w-1 h-1 bg-white/20 rotate-45" />
            <span className="tracking-widest uppercase">2-Year Warranty</span>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  FLOATING MOBILE BAR                                  */}
      {/* ══════════════════════════════════════════════════════ */}
      {selectedCount > 0 && !showSummary && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 p-4 lg:hidden"
        >
          <div className="bg-black text-white p-4 flex items-center justify-between shadow-2xl">
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">{selectedCount} selected</p>
              <p className="text-lg font-bold">Rs. {formatPrice(totalPrice)}</p>
            </div>
            <button
              onClick={() => setShowSummary(true)}
              className="px-6 py-2.5 bg-white text-black text-sm font-bold tracking-wide"
            >
              View Build
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */
/*  Summary View                                                  */
/* ═══════════════════════════════════════════════════════════════ */
const SummaryView: React.FC<{
  selections: Record<string, Product | null>;
  totalPrice: number;
  selectedCount: number;
  onBack: () => void;
  onSelectStep: (i: number) => void;
  onCheckout: () => void;
}> = ({ selections, totalPrice, selectedCount, onBack, onSelectStep, onCheckout }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
  >
    {/* Header */}
    <div className="flex items-center justify-between mb-10 pb-6 border-b border-black/10">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 border border-black flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-medium text-black tracking-tight">Review Build</h3>
          <p className="text-xs text-black/40 mt-0.5">{selectedCount} of {BUILD_CATEGORIES.length} components selected</p>
        </div>
      </div>
      <span className="text-xs font-mono text-black/20 tracking-wider">
        Step {String(BUILD_CATEGORIES.length + 1).padStart(2, '0')} / {String(BUILD_CATEGORIES.length + 1).padStart(2, '0')}
      </span>
    </div>

    {/* Needed / Missing alert */}
    {selectedCount < BUILD_CATEGORIES.length && (
      <div className="mb-8 p-5 border border-black/10 bg-black/[0.02]">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-black/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-black mb-2">Still needed before checkout</p>
            <div className="flex flex-wrap gap-2">
              {BUILD_CATEGORIES.map((cat, i) => !selections[cat.key] && (
                <button
                  key={cat.key}
                  onClick={() => onSelectStep(i)}
                  className="text-[11px] uppercase tracking-wider px-3 py-1.5 border border-black/20 hover:bg-black hover:text-white hover:border-black transition-colors"
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

    <div className="flex justify-end mb-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-black/40 hover:text-black transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to components
      </button>
    </div>

    {/* Component list */}
    <div className="space-y-px bg-black/5 mb-10">
      {BUILD_CATEGORIES.map((cat, i) => {
        const product = selections[cat.key];
        return (
          <motion.div
            key={cat.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`flex items-center gap-5 p-5 bg-white ${
              product ? '' : 'opacity-50'
            }`}
          >
            <div className={`w-10 h-10 border flex items-center justify-center flex-shrink-0 ${
              product ? 'border-black text-black' : 'border-black/10 text-black/20'
            }`}>
              {cat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-black/30 uppercase tracking-wider">{cat.label}</p>
              {product ? (
                <p className="text-sm font-medium text-black truncate">{product.name}</p>
              ) : (
                <p className="text-sm text-black/30 italic">Not selected</p>
              )}
            </div>
            {product ? (
              <p className="text-sm font-bold text-black whitespace-nowrap">Rs. {formatPrice(product.price)}</p>
            ) : (
              <button
                onClick={() => onSelectStep(i)}
                className="text-xs text-black underline underline-offset-4 hover:no-underline"
              >
                Select
              </button>
            )}
          </motion.div>
        );
      })}
    </div>

    {/* Total & checkout */}
    <div className="border border-black p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-black/30 uppercase tracking-wider">Estimated Total</p>
          <p className="text-3xl font-black text-black tracking-tight mt-1">Rs. {formatPrice(totalPrice)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-black/30 uppercase tracking-wider">Assembly</p>
          <p className="text-sm font-bold text-black mt-1">FREE</p>
        </div>
      </div>

      <BuildEmailQuote selections={selections} totalPrice={totalPrice} />

      <motion.button
        onClick={onCheckout}
        whileHover={{ scale: selectedCount > 0 ? 1.01 : 1 }}
        whileTap={{ scale: selectedCount > 0 ? 0.98 : 1 }}
        disabled={selectedCount === 0}
        className={`w-full py-4 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-colors ${
          selectedCount > 0
            ? 'bg-black text-white hover:bg-black/80'
            : 'bg-black/10 text-black/30 cursor-not-allowed'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        Add Build to Cart
      </motion.button>

      <p className="text-[10px] text-center text-black/30 mt-4 uppercase tracking-wider">
        Free assembly & 72-hour stress testing included
      </p>
    </div>
  </motion.div>
);

/* Email-quote helper for the build summary. Reads user from auth store. */
const BuildEmailQuote: React.FC<{ selections: Record<string, Product | null>; totalPrice: number }> = ({ selections, totalPrice }) => {
  const user = useAuthStore((s) => s.user);
  const items = BUILD_CATEGORIES
    .map((cat) => ({ cat, product: selections[cat.key] }))
    .filter((x) => !!x.product)
    .map(({ cat, product }) => ({
      name: `${cat.label}: ${product!.name}`,
      description: product!.brand || undefined,
      price: Number(product!.price) || 0,
    }));
  if (items.length === 0) return null;
  return (
    <div className="mb-4 flex justify-end">
      <EmailQuoteButton
        type="build"
        variant="light"
        items={items}
        total={totalPrice}
        defaultEmail={user?.email || ''}
        defaultName={user?.name || ''}
        notes="Custom PC build quotation. Free assembly & 72-hour stress testing included."
        label="Email me this build quote"
      />
    </div>
  );
};

export default PCBuild;
