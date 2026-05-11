import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, Search } from 'lucide-react';
import api from '../../utils/api';
import type { Product } from '../../types';

export type PartKind = 'battery' | 'ssd' | 'ram' | 'screen' | 'gpu' | 'keyboard' | 'cooler' | 'generic';

export interface PartPickerConfig {
  kind: PartKind;
  serviceName: string;
  servicePrice: number;
  productQuery: Record<string, string | number | boolean>;
  // For battery flow: ask for laptop model first
  twoStep?: boolean;
  laptopQuery?: Record<string, string | number | boolean>;
  // If admin specified compatible product IDs on the service, restrict the picker to these.
  compatibleProductIds?: string[];
}

export interface SelectedPart {
  product: Product | null;          // chosen part (e.g. SSD). null when only laptop picked (battery)
  laptop?: Product | null;          // for battery flow
  partsTotal: number;               // sum of part prices (excludes service price)
}

interface Props {
  open: boolean;
  onClose: () => void;
  config: PartPickerConfig;
  initial?: SelectedPart;
  onConfirm: (selection: SelectedPart) => void;
}

const fmt = (n: number) => `Rs. ${Number(n || 0).toLocaleString('en-LK')}`;

const buildQuery = (q: Record<string, string | number | boolean>) =>
  Object.entries(q).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');

const RepairPartPicker: React.FC<Props> = ({ open, onClose, config, initial, onConfirm }) => {
  const [stage, setStage] = useState<'laptop' | 'part'>(config.twoStep ? 'laptop' : 'part');
  const [laptops, setLaptops] = useState<Product[]>([]);
  const [parts, setParts] = useState<Product[]>([]);
  const [selectedLaptop, setSelectedLaptop] = useState<Product | null>(initial?.laptop || null);
  const [selectedBrand, setSelectedBrand] = useState<string>(initial?.laptop?.brand || '');
  const [selectedPart, setSelectedPart] = useState<Product | null>(initial?.product || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    setStage(config.twoStep && !initial?.laptop ? 'laptop' : 'part');
    setSearch('');
    setError(null);
  }, [open, config.twoStep]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  // Load laptops (only if twoStep)
  useEffect(() => {
    if (!open || !config.twoStep) return;
    if (laptops.length) return;
    setLoading(true);
    api.get(`/products?${buildQuery({ ...(config.laptopQuery || { category: 'laptops' }), limit: 60 })}`)
      .then(res => setLaptops(Array.isArray(res.data) ? res.data : (res.data?.products || [])))
      .catch(() => setError('Could not load laptops from our shop catalog.'))
      .finally(() => setLoading(false));
  }, [open, config.twoStep]);

  // Load parts on demand
  useEffect(() => {
    if (!open) return;
    if (config.twoStep && stage !== 'part') return;
    if (parts.length) return;
    setLoading(true);
    // If admin selected explicit compatible products for this service, fetch only those.
    if (config.compatibleProductIds && config.compatibleProductIds.length > 0) {
      Promise.all(config.compatibleProductIds.map(id =>
        api.get(`/products/${id}`).then(r => r.data?.product || r.data).catch(() => null)
      ))
        .then(arr => setParts(arr.filter(Boolean) as Product[]))
        .catch(() => setError('Could not load compatible parts.'))
        .finally(() => setLoading(false));
      return;
    }
    const q: Record<string, string | number | boolean> = { ...config.productQuery, limit: 60 };
    // For battery 2-step: pass laptop brand as a soft compatibility hint (matches `compatibility` JSON contains)
    if (config.twoStep && selectedLaptop?.brand) {
      q.compatibility = selectedLaptop.brand;
    }
    api.get(`/products?${buildQuery(q)}`)
      .then(res => setParts(Array.isArray(res.data) ? res.data : (res.data?.products || [])))
      .catch(() => setError('Could not load parts from our shop catalog.'))
      .finally(() => setLoading(false));
  }, [open, stage, selectedLaptop?.id]);

  const filteredLaptops = laptops.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(search.toLowerCase())
  );
  const filteredParts = parts.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(search.toLowerCase())
  );

  const partsTotal = selectedPart ? Number(selectedPart.price) : 0;
  const grandPreview = config.servicePrice + partsTotal;

  const canConfirm = config.kind === 'battery'
    ? !!selectedBrand && !!selectedPart
    : !!selectedPart;

  const confirm = () => {
    if (!canConfirm) return;
    onConfirm({
      product: selectedPart,
      laptop: selectedLaptop || (selectedBrand ? ({ id: '', name: '', brand: selectedBrand } as unknown as Product) : null),
      partsTotal,
    });
    onClose();
  };

  // Distinct brands derived from fetched laptops (battery flow)
  const brandOptions = Array.from(new Set(laptops.map(l => (l.brand || '').trim()).filter(Boolean))).sort();

  // Filter batteries by selected brand: battery is shown if its compatibility list
  // (admin-set product IDs) includes any laptop of the brand, OR contains the brand name string,
  // OR has no compatibility list at all (treated as universal).
  const laptopIdsOfBrand = laptops.filter(l => l.brand === selectedBrand).map(l => l.id);
  const batteriesForBrand = config.kind !== 'battery' ? parts : parts.filter(b => {
    const raw = (b as any).compatibility;
    if (!raw) return true; // universal
    try {
      const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!Array.isArray(arr) || arr.length === 0) return true;
      const list = arr.map(String);
      if (list.some(x => laptopIdsOfBrand.includes(x))) return true;
      if (selectedBrand && list.some(x => x.toLowerCase() === selectedBrand.toLowerCase())) return true;
      return false;
    } catch {
      const s = String(raw).toLowerCase();
      return selectedBrand ? s.includes(selectedBrand.toLowerCase()) : true;
    }
  });

  const stageTitle = config.kind === 'battery' && stage === 'laptop'
    ? 'Select your laptop brand'
    : config.kind === 'battery'
      ? 'Pick a compatible battery'
      : `Select a ${config.kind === 'generic' ? 'part' : config.kind.toUpperCase()}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl max-h-[82vh] flex flex-col bg-black border border-white/15 text-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <p className="text-[10px] font-mono tracking-[0.25em] text-white/40 uppercase">{config.serviceName}</p>
                <h3 className="text-lg font-light mt-0.5">{stageTitle}</h3>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stage indicator (battery only) */}
            {config.twoStep && (
              <div className="flex items-center gap-3 px-5 py-2.5 border-b border-white/5 text-[10px] uppercase tracking-wider">
                <span className={stage === 'laptop' ? 'text-white' : 'text-white/30'}>1. Laptop</span>
                <span className="h-px w-8 bg-white/15" />
                <span className={stage === 'part' ? 'text-white' : 'text-white/30'}>2. Confirm</span>
              </div>
            )}

            {/* Search */}
            {((stage === 'laptop' && laptops.length > 6) || (stage === 'part' && parts.length > 6)) && (
              <div className="px-5 py-3 flex items-center gap-2 border-b border-white/5">
                <Search className="w-3.5 h-3.5 text-white/30" />
                <input
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or brand..."
                  className="flex-1 bg-transparent text-sm py-1 focus:outline-none placeholder:text-white/20"
                />
              </div>
            )}

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-auto p-5 overscroll-contain">
              {loading ? (
                <div className="flex items-center justify-center py-20 text-white/40">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading from shop...
                </div>
              ) : error ? (
                <p className="text-center text-white/50 py-12 text-sm">{error}</p>
              ) : stage === 'laptop' ? (
                /* Battery flow uses brand dropdown; other 2-step flows still pick a laptop */
                config.kind === 'battery' ? (
                  brandOptions.length === 0 ? (
                    <p className="text-center text-white/40 py-12 text-sm">No laptop brands found in our catalog.</p>
                  ) : (
                    <div className="max-w-md mx-auto py-8">
                      <p className="text-xs text-white/50 mb-4 leading-relaxed">
                        Pick your laptop brand. We'll then show batteries our admins have marked compatible with that brand's models.
                      </p>
                      <label className="text-[10px] uppercase tracking-wider text-white/40 mb-2 block">Laptop brand</label>
                      <select
                        value={selectedBrand}
                        onChange={(e) => { setSelectedBrand(e.target.value); setSelectedPart(null); }}
                        className="w-full bg-black border border-white/15 text-white text-sm py-3 px-3 focus:outline-none focus:border-white/40"
                      >
                        <option value="">-- Choose a brand --</option>
                        {brandOptions.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      {selectedBrand && (
                        <div className="mt-6 border border-white/10 p-4">
                          <p className="text-xs text-white/40">Selected: <span className="text-white">{selectedBrand}</span></p>
                          <p className="text-xs text-white/40 mt-2">{laptopIdsOfBrand.length} model{laptopIdsOfBrand.length !== 1 ? 's' : ''} of this brand in our catalog.</p>
                        </div>
                      )}
                    </div>
                  )
                ) : filteredLaptops.length === 0 ? (
                  <p className="text-center text-white/40 py-12 text-sm">No laptops found in our catalog.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {filteredLaptops.map(p => {
                      const sel = selectedLaptop?.id === p.id;
                      return (
                        <button key={p.id} onClick={() => setSelectedLaptop(p)}
                          className={`group text-left border transition-colors ${sel ? 'border-white bg-white/5' : 'border-white/10 hover:border-white/30'}`}
                        >
                          <div className="aspect-[4/3] bg-white/5 overflow-hidden">
                            {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                          </div>
                          <div className="p-3">
                            <p className="text-[10px] uppercase tracking-wider text-white/30">{p.brand || 'Laptop'}</p>
                            <p className="text-xs font-medium mt-1 line-clamp-2">{p.name}</p>
                          </div>
                          {sel && <div className="px-3 pb-3 -mt-1"><Check className="w-4 h-4" /></div>}
                        </button>
                      );
                    })}
                  </div>
                )
              ) : (
                /* Part stage */
                (() => {
                  const list = config.kind === 'battery' ? batteriesForBrand : filteredParts;
                  if (list.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <p className="text-white/40 text-sm mb-2">
                          {config.kind === 'battery'
                            ? `No batteries found for ${selectedBrand || 'this brand'} in our catalog.`
                            : 'No matching parts found in our shop catalog right now.'}
                        </p>
                        {config.kind === 'battery' && (
                          <p className="text-white/30 text-xs">We can source one — contact us to confirm availability.</p>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {list.map(p => {
                        const sel = selectedPart?.id === p.id;
                        return (
                          <button key={p.id} onClick={() => setSelectedPart(p)}
                            className={`group text-left border transition-colors ${sel ? 'border-white bg-white/5' : 'border-white/10 hover:border-white/30'}`}
                          >
                            <div className="aspect-[4/3] bg-white/5 overflow-hidden">
                              {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                            </div>
                            <div className="p-3">
                              <p className="text-[10px] uppercase tracking-wider text-white/30">{p.brand || 'Part'}</p>
                              <p className="text-xs font-medium mt-1 line-clamp-2">{p.name}</p>
                              <p className="text-xs font-mono mt-2">{fmt(Number(p.price))}</p>
                            </div>
                            {sel && <div className="px-3 pb-3 -mt-1"><Check className="w-4 h-4" /></div>}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 px-5 py-4 flex items-center justify-between gap-4">
              <div className="text-xs text-white/50">
                {selectedPart ? (
                  <>Part: <span className="text-white font-mono">{fmt(partsTotal)}</span> + Service: <span className="text-white font-mono">{fmt(config.servicePrice)}</span> = <span className="text-white font-mono">{fmt(grandPreview)}</span></>
                ) : config.kind === 'battery' && stage === 'laptop' ? (
                  <>Pick your laptop brand to see compatible batteries.</>
                ) : (
                  <>Select a part to see total.</>
                )}
              </div>
              <div className="flex gap-2">
                {config.twoStep && stage === 'part' && (
                  <button onClick={() => setStage('laptop')}
                    className="px-4 py-2.5 border border-white/15 text-xs uppercase tracking-wider hover:bg-white/5">
                    Back
                  </button>
                )}
                {config.twoStep && stage === 'laptop' ? (
                  <button
                    onClick={() => setStage('part')}
                    disabled={config.kind === 'battery' ? !selectedBrand : !selectedLaptop}
                    className="px-5 py-2.5 bg-white text-black text-xs uppercase tracking-wider font-medium disabled:opacity-30">
                    Continue
                  </button>
                ) : (
                  <button onClick={confirm} disabled={!canConfirm}
                    className="px-5 py-2.5 bg-white text-black text-xs uppercase tracking-wider font-medium disabled:opacity-30 inline-flex items-center gap-2">
                    <Check className="w-3.5 h-3.5" /> Confirm
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ─────────────────────────────────────────────────────────── */
/*  Helper: detect if a service needs a part picker            */
/* ─────────────────────────────────────────────────────────── */
export function detectPartConfig(service: { name: string; price: number; serviceType?: string | null; compatibility?: string | null }): PartPickerConfig | null {
  const n = service.name.toLowerCase();
  const price = Number(service.price) || 0;
  // Parse admin-selected compatible product IDs (stored as JSON in `compatibility`).
  let adminIds: string[] | undefined;
  if (service.compatibility) {
    try {
      const parsed = typeof service.compatibility === 'string' ? JSON.parse(service.compatibility) : service.compatibility;
      if (Array.isArray(parsed) && parsed.every((x: any) => typeof x === 'string')) adminIds = parsed;
    } catch {}
  }
  const base = (kind: PartKind, productQuery: Record<string, string | number | boolean>, extra?: Partial<PartPickerConfig>): PartPickerConfig => ({
    kind, serviceName: service.name, servicePrice: price, productQuery,
    compatibleProductIds: adminIds && adminIds.length ? adminIds : undefined,
    ...extra,
  });
  if (n.includes('battery')) return base('battery', { category: 'laptop-accessories', subcategory: 'battery' }, { twoStep: true, laptopQuery: { category: 'laptops' } });
  if (n.includes('ssd')) return base('ssd', { category: 'storage', subcategory: 'ssd' });
  if (n.includes('ram') || n.includes('memory')) return base('ram', { category: 'laptop-accessories', subcategory: 'ram' });
  if (n.includes('screen') || n.includes('display')) return base('screen', { category: 'laptop-accessories', subcategory: 'display' });
  if (n.includes('gpu') || n.includes('graphics')) return base('gpu', { category: 'graphics-cards' });
  if (n.includes('keyboard')) return base('keyboard', { category: 'laptop-accessories', subcategory: 'keyboard' });
  if (n.includes('cool') || n.includes('fan') || n.includes('thermal')) return base('cooler', { category: 'laptop-accessories', subcategory: 'cooling-pad' });
  // If admin set compatible products even though name doesn't match a known kind, surface them as a generic picker.
  if (adminIds && adminIds.length > 0) return base('generic', {});
  return null;
}

export default RepairPartPicker;
