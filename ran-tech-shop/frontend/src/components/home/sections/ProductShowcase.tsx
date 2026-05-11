import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollFloat, TiltedCard } from '../animations';
import api from '../../../utils/api';
import type { Product } from '../../../types';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);


const sharedSectionBackground = '#050505';

const ProductShowcase = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  const translateX = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products/featured');
        const data = response.data;
        let productsList = data.products || data;

        if (!Array.isArray(productsList) || productsList.length === 0) {
          const fallbackResponse = await api.get('/products?limit=6&isService=false');
          const fallbackData = fallbackResponse.data;
          productsList = fallbackData.products || fallbackData;
        }

        if (Array.isArray(productsList)) {
          setProducts(productsList.slice(0, 6));
        }
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (loading || products.length === 0 || isMobile) return;

    const ctx = gsap.context(() => {
      // Horizontal scroll effect (desktop only)
      gsap.to(sliderRef.current, {
        x: () => -(sliderRef.current!.scrollWidth - window.innerWidth + 100),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${sliderRef.current!.scrollWidth}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1
        }
      });

      // Scale animation on cards
      gsap.utils.toArray('.product-card').forEach((card: any) => {
        gsap.fromTo(card,
          { scale: 0.9, opacity: 0.5 },
          {
            scale: 1,
            opacity: 1,
            scrollTrigger: {
              trigger: card,
              start: 'left center',
              end: 'right center',
              scrub: true
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, products.length, isMobile]);

  if (!loading && products.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden ${isMobile ? 'py-20' : 'min-h-screen'}`}
      style={{ background: sharedSectionBackground }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated gradient */}
        <motion.div
          className="absolute inset-0"
          style={{ x: isMobile ? '0%' : translateX }}
        >
          <div className="absolute top-1/4 left-1/4 w-[520px] h-[520px] bg-[#F7B500]/[0.025] rounded-full blur-[220px]" />
        </motion.div>
      </div>

      {/* Header */}
      <div
        className={`${
          isMobile
            ? 'relative z-20 container mx-auto px-6 mb-10 text-center'
            : 'absolute top-8 left-0 right-0 z-20 container mx-auto px-6'
        }`}
      >
        <ScrollFloat>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white/50 text-lg mb-4"
          >
            {/* Removed trailing letter H */}
          </motion.p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white flex flex-wrap justify-center gap-x-2">
            <span>Our</span>
            <span className="italic text-[#F7B500]" style={{ fontFamily: 'Georgia, serif' }}>premium</span>
            <span>products!</span>
          </h2>
        </ScrollFloat>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={sliderRef}
        className={
          isMobile
            ? 'relative flex items-stretch gap-6 px-6 overflow-x-auto snap-x snap-mandatory pb-6 -mx-2'
            : 'absolute top-1/2 -translate-y-1/2 flex items-center gap-8 pl-12'
        }
        style={isMobile ? { scrollbarWidth: 'none' } : { left: '100px' }}
      >
        {products.map((product, idx) => {
          const specs = typeof product.specs === 'string'
            ? JSON.parse(product.specs)
            : (product.specs || {});
          const specEntries = Object.entries(specs as Record<string, unknown>).slice(0, 3);
          const inStock = (product.stock ?? 0) > 0;

          return (
            <motion.div
              key={product.id}
              className={`product-card flex-shrink-0 ${
                isMobile
                  ? 'w-[85vw] max-w-[360px] snap-center'
                  : 'w-[400px] md:w-[460px]'
              }`}
            >
              <TiltedCard
                className="w-full"
                maxTilt={6}
                scale={1.02}
                glareEnable={true}
              >
                <div className="group relative rounded-3xl overflow-hidden min-h-[560px] bg-gradient-to-br from-[#0E0E10] to-[#161618] border border-white/[0.06] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] transition-colors duration-500 hover:border-[#F7B500]/40">
                  {/* Whole-card click target */}
                  <Link
                    to={`/product/${product.id}`}
                    aria-label={`View details for ${product.name}`}
                    className="absolute inset-0 z-20 rounded-3xl"
                  />

                  {/* Top: image area on light tile */}
                  <div className="relative h-[300px] overflow-hidden bg-gradient-to-br from-white/[0.04] to-transparent">
                    {/* Glow accent */}
                    <div className="absolute -top-32 -right-20 w-72 h-72 bg-[#F7B500]/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0E0E10] to-transparent pointer-events-none z-10" />

                    {/* Index numbering */}
                    <span className="absolute top-5 left-5 z-30 text-[10px] font-mono tracking-[0.3em] text-white/30">
                      {String(idx + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
                    </span>

                    {/* Brand badge */}
                    {product.brand && (
                      <span className="absolute top-5 right-5 z-30 bg-black/50 backdrop-blur-md border border-white/15 text-white/80 text-[10px] font-mono uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
                        {product.brand}
                      </span>
                    )}

                    {/* Image */}
                    <motion.img
                      src={product.image}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                      whileHover={{ scale: 1.06 }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800';
                      }}
                    />

                    {/* Stock chip */}
                    <span
                      className={`absolute bottom-5 left-5 z-30 inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] px-3 py-1.5 rounded-full backdrop-blur-md border ${
                        inStock
                          ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
                          : 'bg-red-500/15 border-red-400/30 text-red-300'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      {inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Content panel */}
                  <div className="relative p-7 pointer-events-none z-30">
                    {/* Category strip */}
                    {product.category && (
                      <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#F7B500]/80 mb-2">
                        {product.category.replace(/-/g, ' ')}
                      </p>
                    )}

                    <h3 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight line-clamp-2 group-hover:text-[#F7B500] transition-colors duration-500">
                      {product.name}
                    </h3>

                    {/* Specs */}
                    {specEntries.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {specEntries.map(([, value], i) => (
                          <span
                            key={i}
                            className="bg-white/[0.04] border border-white/10 text-white/60 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md"
                          >
                            {String(value)}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price + CTA */}
                    <div className="flex items-end justify-between pt-4 border-t border-white/10">
                      <div>
                        <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.25em] mb-1">From</p>
                        <p className="text-2xl font-black text-white">
                          Rs. <span className="text-[#F7B500]">{product.price.toLocaleString()}</span>
                        </p>
                      </div>
                      <Link
                        to={`/product/${product.id}`}
                        className="relative z-40 inline-flex items-center gap-2 bg-[#F7B500] text-black px-5 py-3 rounded-full font-bold text-xs uppercase tracking-[0.15em] cursor-pointer pointer-events-auto hover:bg-white transition-colors duration-300"
                      >
                        View
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>

                  {/* Bottom hover line */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F7B500] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out" />
                </div>
              </TiltedCard>
            </motion.div>
          );
        })}

        {/* View All CTA */}
        <motion.div
          className={`flex-shrink-0 flex items-center justify-center ${
            isMobile ? 'w-[70vw] max-w-[260px]' : 'w-[300px]'
          }`}
        >
          <motion.a
            href="/shop"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-4 text-white/60 hover:text-white transition-colors"
          >
            <div className="w-24 h-24 rounded-full border-2 border-current flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <span className="text-lg font-semibold">View All Products</span>
          </motion.a>
        </motion.div>
      </div>

    </section>
  );
};

export default ProductShowcase;
