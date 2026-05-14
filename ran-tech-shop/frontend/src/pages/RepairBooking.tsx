import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useOrdersStore } from '../store/ordersStore';
import { useAdminStore } from '../store/adminStore';
import {
  ArrowRight, ArrowLeft, Check, Clock, Calendar, User, Mail, Phone,
  Monitor, Smartphone, Laptop, Upload, X,
} from 'lucide-react';
import api from '../utils/api';
import type { Product, RepairCategory } from '../types';
import EmailQuoteButton from '../components/ui/EmailQuoteButton';
import RepairPartPicker, { type PartPickerConfig, type SelectedPart } from '../components/repair/RepairPartPicker';

/* ─── Types ───────────────────────────────────────────────────── */
interface TimeSlot { id: string; time: string; available: boolean }
type DeviceType = 'desktop' | 'mobile' | 'laptop';

/* ─── Constants ──────────────────────────────────────────────── */
const DEVICE_OPTIONS: { id: DeviceType; label: string; icon: React.ComponentType<any>; blurb: string }[] = [
  { id: 'desktop', label: 'Desktop', icon: Monitor,    blurb: 'Towers, AIOs, custom builds' },
  { id: 'laptop',  label: 'Laptop',  icon: Laptop,     blurb: 'Notebooks, gaming laptops, ultrabooks' },
  { id: 'mobile',  label: 'Mobile',  icon: Smartphone, blurb: 'Phones, tablets, smart devices' },
];

const defaultTimeSlots: TimeSlot[] = [
  { id: '1', time: '09:00 AM - 10:00 AM', available: true },
  { id: '2', time: '10:00 AM - 11:00 AM', available: true },
  { id: '3', time: '11:00 AM - 12:00 PM', available: true },
  { id: '4', time: '12:00 PM - 01:00 PM', available: false },
  { id: '5', time: '02:00 PM - 03:00 PM', available: true },
  { id: '6', time: '03:00 PM - 04:00 PM', available: true },
  { id: '7', time: '04:00 PM - 05:00 PM', available: true },
  { id: '8', time: '05:00 PM - 06:00 PM', available: true },
];

// Step 4 ("Details") is shown only when at least one selected service has a
// price range — that's the path that turns into a quote request. Fixed-price
// selections jump straight from Services → Contact → Confirm.
const STEPS_QUOTE = [
  { num: 1, label: 'Date & Time' },
  { num: 2, label: 'Device' },
  { num: 3, label: 'Services' },
  { num: 4, label: 'Details' },
  { num: 5, label: 'Confirm' },
];
const STEPS_FIXED = [
  { num: 1, label: 'Date & Time' },
  { num: 2, label: 'Device' },
  { num: 3, label: 'Services' },
  { num: 4, label: 'Contact' },
  { num: 5, label: 'Confirm' },
];

/* ─── Helpers ─────────────────────────────────────────────────── */
const normalizePrice = (price: number | string | null | undefined) => {
  const n = typeof price === 'number' ? price : Number(price);
  return Number.isFinite(n) ? n : 0;
};
const formatPrice = (p: number | string | null | undefined) => normalizePrice(p).toLocaleString('en-LK');

const getServicePricingMode = (s: Product): 'fixed' | 'range' | 'quote' => {
  if (s.priceMode === 'quote') return 'quote';
  if (s.priceMode === 'range') return 'range';
  if (s.priceMode === 'fixed') return 'fixed';
  // Legacy fallback when priceMode is missing: infer from priceMax.
  const min = normalizePrice(s.price);
  const max = s.priceMax != null ? normalizePrice(s.priceMax) : null;
  return max && max > min ? 'range' : 'fixed';
};

const getPriceDisplay = (s: Product) => {
  const mode = getServicePricingMode(s);
  if (mode === 'quote') return { mode, label: 'Quote on inspection' };
  const min = normalizePrice(s.price);
  const max = s.priceMax != null ? normalizePrice(s.priceMax) : null;
  if (mode === 'range' && max && max > min) {
    return { mode, label: `Rs. ${formatPrice(min)} – ${formatPrice(max)}` };
  }
  return { mode, label: `Rs. ${formatPrice(min)}` };
};

// Phone input must be exactly 10 digits (LK local format, e.g. 0701234567).
const sanitizePhone = (raw: string) => raw.replace(/\D/g, '').slice(0, 10);
const isValidLkPhone = (raw: string) => /^\d{10}$/.test(sanitizePhone(raw));

const getServiceCompatibleIds = (s: Product): string[] => {
  const raw = (s as any).compatibility;
  if (!raw) return [];
  try { const v = typeof raw === 'string' ? JSON.parse(raw) : raw; return Array.isArray(v) ? v.map(String) : []; }
  catch { return []; }
};

// When the admin hasn't pinned specific compatible products, auto-detect a
// catalog query from the service name so the customer can still pick a part
// from shop inventory (e.g. RAM Upgrade → category=ram).
type AutoPartKind = 'ram' | 'ssd' | 'battery' | 'screen' | 'gpu' | 'keyboard' | 'cooler' | null;
const detectAutoPartKind = (s: Product): AutoPartKind => {
  const text = `${s.name || ''} ${s.serviceType || ''} ${(s as any).subcategory || ''}`.toLowerCase();
  if (/\bram\b|memory/.test(text)) return 'ram';
  if (/\bssd\b|nvme|hard\s*drive|storage|hdd/.test(text)) return 'ssd';
  if (/battery/.test(text)) return 'battery';
  if (/screen|display|lcd|panel/.test(text)) return 'screen';
  if (/\bgpu\b|graphics|video card/.test(text)) return 'gpu';
  if (/keyboard/.test(text)) return 'keyboard';
  if (/cool|fan|heatsink/.test(text)) return 'cooler';
  return null;
};
const partKindToQuery = (kind: AutoPartKind): Record<string, string> | null => {
  switch (kind) {
    case 'ram':     return { category: 'components', subcategory: 'ram' };
    case 'ssd':     return { category: 'components', subcategory: 'storage' };
    case 'gpu':     return { category: 'components', subcategory: 'gpus' };
    case 'cooler':  return { category: 'components', subcategory: 'cooling' };
    case 'keyboard':return { category: 'accessories', subcategory: 'keyboards' };
    case 'battery': return { search: 'battery' };
    case 'screen':  return { search: 'screen' };
    default:        return null;
  }
};

// True if a service requires the customer to pick a part before booking.
// Strict: only when the admin explicitly pinned compatible products on the
// service. No auto-detection fallback — services without pinned parts are
// booked as-is.
const serviceNeedsPart = (s: Product): boolean =>
  getServiceCompatibleIds(s).length > 0;

const getAvailableDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 0) {
      dates.push({
        value: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateNum: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
      });
    }
  }
  return dates;
};

/* ─── Reveal text animation ──────────────────────────────────── */
const RevealText = ({ children, className = '', delay = 0 }: { children: string; className?: string; delay?: number }) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {children.split(' ').map((word, i) => (
        <span key={i} className="overflow-hidden inline-block mr-[0.3em]">
          <motion.span className="inline-block"
            initial={{ y: '110%' }} animate={isInView ? { y: '0%' } : { y: '110%' }}
            transition={{ duration: 0.7, delay: delay + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >{word}</motion.span>
        </span>
      ))}
    </span>
  );
};

/* ─── Main Component ─────────────────────────────────────────── */
const RepairBooking: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const { addBooking } = useOrdersStore();
  const { getBlockedSlotsForDate } = useAdminStore();

  const initialDevice = (() => {
    const d = searchParams.get('device') as DeviceType | null;
    return d && ['desktop', 'mobile', 'laptop'].includes(d) ? d : null;
  })();

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(initialDevice);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [deviceModel, setDeviceModel] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>(defaultTimeSlots);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingTicketId, setBookingTicketId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<Product[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [adminCategories, setAdminCategories] = useState<RepairCategory[]>([]);
  const [selectedParts, setSelectedParts] = useState<Record<string, SelectedPart>>({});
  const [pickerService, setPickerService] = useState<{ service: Product; config: PartPickerConfig } | null>(null);

  const availableDates = getAvailableDates();

  // Restore a pending booking after the user signs in.
  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      const raw = sessionStorage.getItem('repair:pending');
      if (!raw) return;
      const v = JSON.parse(raw);
      sessionStorage.removeItem('repair:pending');
      if (v.selectedDate) setSelectedDate(v.selectedDate);
      if (v.selectedTimeSlot) setSelectedTimeSlot(v.selectedTimeSlot);
      if (v.selectedDevice) setSelectedDevice(v.selectedDevice);
      if (Array.isArray(v.selectedServices)) setSelectedServices(v.selectedServices);
      if (v.selectedParts) setSelectedParts(v.selectedParts);
      if (v.deviceModel) setDeviceModel(v.deviceModel);
      if (v.issueDescription) setIssueDescription(v.issueDescription);
      if (Array.isArray(v.imageUrls)) setImageUrls(v.imageUrls);
      if (v.customerName) setCustomerName(v.customerName);
      if (v.customerEmail) setCustomerEmail(v.customerEmail);
      if (v.customerPhone) setCustomerPhone(v.customerPhone);
      setStep(5);
    } catch { /* ignore */ }
  }, [isAuthenticated]);

  // Fetch services
  useEffect(() => {
    (async () => {
      setServicesLoading(true);
      try {
        const res = await api.get('/repairs/services');
        setServices(res.data?.services || (Array.isArray(res.data) ? res.data : []));
      } catch { setError('Failed to load services.'); } finally { setServicesLoading(false); }
    })();
  }, []);

  // Fetch admin-managed repair categories for the chosen device.
  useEffect(() => {
    if (!selectedDevice) { setAdminCategories([]); return; }
    api.get(`/repair-categories?deviceType=${selectedDevice}`)
      .then(res => setAdminCategories(res.data?.categories ?? []))
      .catch(() => setAdminCategories([]));
  }, [selectedDevice]);

  // Fetch time slots when date changes
  useEffect(() => {
    if (!selectedDate) return;
    (async () => {
      try {
        const res = await api.get(`/repairs/availability?date=${selectedDate}`);
        if (res.data.slots) setAvailableSlots(res.data.slots);
      } catch {
        const hash = selectedDate.split('-').reduce((a, b) => a + parseInt(b), 0);
        setAvailableSlots(defaultTimeSlots.map((s, i) => ({ ...s, available: (hash + i) % 3 !== 0 })));
      }
    })();
  }, [selectedDate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/repairs/my-bookings').catch(() => {});
  }, [isAuthenticated]);

  // Services filtered by chosen device.
  const deviceServices = useMemo(() => {
    if (!selectedDevice) return [] as Product[];
    return services.filter(s => {
      const dt = (s as any).deviceType as string | undefined;
      // Services without a deviceType are treated as universal (shown for all).
      return !dt || dt.toLowerCase() === selectedDevice;
    });
  }, [services, selectedDevice]);

  // Match a service to a category. We accept the slug OR the category name
  // (case-insensitive) against the service's own `serviceType` / `subcategory`
  // so admin-tagged values like "Cleaning" still match a slug of "cleaning".
  const serviceMatchesSlug = (s: Product, slug: string, name?: string) => {
    const haystack = [
      (s.serviceType || '').toLowerCase(),
      ((s as any).subcategory || '').toLowerCase(),
    ];
    const needles = [slug.toLowerCase(), ...(name ? [name.toLowerCase()] : [])];
    return needles.some(n => haystack.includes(n));
  };

  // Category list: prefer admin-managed RepairCategory rows for this device,
  // but only show ones that actually have services attached. Falls back to
  // deriving from each service's own serviceType when no categories exist.
  const categories = useMemo(() => {
    if (adminCategories.length) {
      const withCounts = adminCategories
        .map(c => ({
          slug: c.slug,
          name: c.name,
          count: deviceServices.filter(s => serviceMatchesSlug(s, c.slug, c.name)).length,
        }))
        .filter(c => c.count > 0);
      // Always include "All" up front; show categories only when at least one
      // has services, otherwise the pills row would just be a single "All".
      return [{ slug: 'all', name: 'All', count: deviceServices.length }, ...withCounts];
    }
    const set = new Set<string>();
    deviceServices.forEach(s => { if (s.serviceType) set.add(s.serviceType); });
    return [
      { slug: 'all', name: 'All', count: deviceServices.length },
      ...Array.from(set).sort().map(slug => ({ slug, name: slug, count: deviceServices.filter(s => (s.serviceType || '') === slug).length })),
    ];
  }, [adminCategories, deviceServices]);

  // Reset the category pill if the previously-selected one no longer has any
  // services after data changes (e.g. after switching device).
  useEffect(() => {
    if (selectedCategory !== 'all' && !categories.some(c => c.slug === selectedCategory)) {
      setSelectedCategory('all');
    }
  }, [categories, selectedCategory]);

  const filteredServices = selectedCategory === 'all'
    ? deviceServices
    : deviceServices.filter(s => {
        const cat = categories.find(c => c.slug === selectedCategory);
        return serviceMatchesSlug(s, selectedCategory, cat?.name);
      });

  const getSelectedServiceObjects = () => services.filter(s => selectedServices.includes(s.id));

  // For totals, only fixed-price services contribute (range/quote = pending quote).
  // Selected parts (RAM/SSD/etc.) always count if picked.
  const calculateTotal = () => getSelectedServiceObjects().reduce((t, s) => {
    const mode = getServicePricingMode(s);
    const svcPart = mode === 'fixed' ? normalizePrice(s.price) : 0;
    const part = selectedParts[s.id]?.partsTotal || 0;
    return t + svcPart + part;
  }, 0);

  const hasQuoteService = () =>
    getSelectedServiceObjects().some(s => getServicePricingMode(s) !== 'fixed');

  const isQuoteRequest = hasQuoteService;
  const STEPS = hasQuoteService() ? STEPS_QUOTE : STEPS_FIXED;

  // Open the part-picker for a service. Strict: only opens when the admin
  // explicitly pinned compatible products. No auto-detection fallback — we
  // never show unrelated catalog items.
  const openPartPicker = (svc: Product) => {
    const compatibleProductIds = getServiceCompatibleIds(svc);
    if (compatibleProductIds.length === 0) return;
    setPickerService({
      service: svc,
      config: {
        kind: 'generic' as any,
        serviceName: svc.name,
        servicePrice: normalizePrice(svc.price),
        productQuery: {},
        compatibleProductIds,
      },
    });
  };

  const toggleService = (id: string) => {
    setSelectedServices(prev => {
      if (prev.includes(id)) {
        setSelectedParts(p => { const n = { ...p }; delete n[id]; return n; });
        return prev.filter(x => x !== id);
      }
      const svc = services.find(s => s.id === id);
      if (svc && serviceNeedsPart(svc)) openPartPicker(svc);
      return [...prev, id];
    });
  };

  const buildQuoteItems = () => {
    const items: { name: string; description?: string; price: number }[] = [];
    getSelectedServiceObjects().forEach(s => {
      const mode = getServicePricingMode(s);
      const desc = mode === 'quote'
        ? 'Quote on inspection'
        : (mode === 'range' && s.priceMax
            ? `Estimated Rs. ${formatPrice(s.price)} – ${formatPrice(s.priceMax)}`
            : undefined);
      items.push({ name: s.name, description: desc, price: mode === 'fixed' ? normalizePrice(s.price) : 0 });
      const part = selectedParts[s.id]?.product;
      if (part) items.push({ name: `↳ ${part.name}`, description: part.brand || undefined, price: Number(part.price) });
    });
    return items;
  };

  // Image upload
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', 'repair-requests');
        const res = await api.post('/uploads/image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data?.url) uploaded.push(res.data.url);
      }
      setImageUrls(prev => [...prev, ...uploaded]);
    } catch {
      setError('Failed to upload one or more images.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) =>
    setImageUrls(prev => prev.filter(u => u !== url));

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      // Stash the request locally so we can resume after login.
      try {
        sessionStorage.setItem('repair:pending', JSON.stringify({
          selectedDate, selectedTimeSlot, selectedDevice, selectedServices,
          selectedParts, deviceModel, issueDescription, imageUrls,
          customerName, customerEmail, customerPhone,
        }));
      } catch { /* ignore */ }
      navigate('/login?next=/repair');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const serviceNames = getSelectedServiceObjects().map(s => {
        const part = selectedParts[s.id]?.product;
        return part ? `${s.name} (${part.name})` : s.name;
      });
      const deviceLabel = DEVICE_OPTIONS.find(d => d.id === selectedDevice)?.label || 'Device';
      const ticketId = addBooking({
        deviceType: deviceLabel,
        deviceModel: deviceModel || deviceLabel,
        issueDescription: issueDescription || 'General repair service',
        bookedDate: selectedDate,
        totalCost: calculateTotal(),
        services: serviceNames,
        timeSlot: selectedTimeSlot,
        customerName, customerEmail, customerPhone,
      });
      setBookingTicketId(ticketId);
      try {
        await api.post('/repairs/book', {
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          deviceType: deviceLabel,
          deviceModel,
          images: imageUrls,
          services: serviceNames,
          issueDescription,
          customerName, customerEmail, customerPhone,
          totalAmount: calculateTotal(),
          requestType: isQuoteRequest() ? 'quote' : 'booking',
        });
      } catch { /* local save succeeded */ }
      setBookingSuccess(true);
    } catch { setError('Failed to create booking.'); } finally { setIsLoading(false); }
  };

  const resetForm = () => {
    setStep(1); setSelectedDate(''); setSelectedTimeSlot('');
    setSelectedDevice(null); setSelectedCategory('all');
    setSelectedServices([]); setDeviceModel(''); setIssueDescription('');
    setImageUrls([]); setBookingSuccess(false);
    setBookingTicketId(''); setError(null);
  };

  /* ─── Success Screen ─────────────────────────────────────── */
  if (bookingSuccess) {
    const rangeNote = hasQuoteService();
    return (
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="text-center"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 border-2 border-white flex items-center justify-center mx-auto mb-10"
            >
              <Check className="w-8 h-8 text-white" strokeWidth={1.5} />
            </motion.div>

            <h1 className="text-4xl font-light text-white tracking-tight mb-3">
              {rangeNote ? 'Quote Requested' : 'Booking Confirmed'}
            </h1>
            <p className="text-white/40 mb-2">
              {rangeNote
                ? 'We\'ll send your final price by SMS, email and a web notification. Open the notification to confirm and book.'
                : 'Your repair appointment has been scheduled. You\'ll receive a confirmation by SMS and email.'}
            </p>
            <p className="text-sm font-mono text-white/60 mb-10">Ticket: {bookingTicketId}</p>

            <div className="border border-white/10 p-8 text-left mb-10">
              <h3 className="text-sm font-mono text-white/40 uppercase tracking-wider mb-6">Request Details</h3>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Date</p>
                  <p className="text-white font-light">{availableDates.find(d => d.value === selectedDate)?.label}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Time</p>
                  <p className="text-white font-light">{selectedTimeSlot}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Device</p>
                  <p className="text-white font-light capitalize">{selectedDevice}{deviceModel ? ` · ${deviceModel}` : ''}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Estimate</p>
                  <p className="text-white font-light">
                    {rangeNote ? 'Pending quote' : `Rs. ${formatPrice(calculateTotal())}`}
                  </p>
                </div>
              </div>

              <div className="border-t border-white/5 pt-6">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-4">Services</p>
                {getSelectedServiceObjects().map(s => {
                  const pd = getPriceDisplay(s);
                  return (
                    <div key={s.id} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-white/70 text-sm">{s.name}</span>
                      <span className="text-white text-sm font-mono">{pd.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {rangeNote && (
              <p className="text-xs text-white/40 mb-6 max-w-md mx-auto">
                You'll receive a notification and an email at <span className="text-white/70">{customerEmail}</span> as
                soon as the shop confirms the exact repair price.
              </p>
            )}

            <div className="flex gap-4 justify-center">
              <button onClick={resetForm}
                className="px-8 py-4 border border-white/20 text-white text-sm font-medium hover:bg-white/5 transition-colors"
              >Book Another</button>
              <button onClick={() => navigate('/')}
                className="px-8 py-4 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
              >Go Home</button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ─── Main Booking Page ────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      {/* Header */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-white/20" />
              <span className="text-xs font-mono tracking-[0.3em] text-white/40 uppercase">Book Repair</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-light text-white tracking-tight mb-4">
              <RevealText>Schedule Your</RevealText>
            </h1>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-light text-white/30 tracking-tight">
              <RevealText delay={0.3}>Repair</RevealText>
            </h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }} className="text-sm text-white/40 mt-6 max-w-lg"
            >Pick a date, tell us about your device, and we'll send you a quote.</motion.p>
          </motion.div>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="pb-12">
        <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <motion.div className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className={`w-10 h-10 flex items-center justify-center text-sm font-medium transition-all duration-500 ${
                    step > s.num ? 'bg-white text-black' : step === s.num ? 'border-2 border-white text-white' : 'border border-white/10 text-white/20'
                  }`}>
                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-[10px] mt-2 tracking-wider uppercase hidden md:block transition-colors ${
                    step >= s.num ? 'text-white/60' : 'text-white/20'
                  }`}>{s.label}</span>
                </motion.div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 mx-3">
                    <div className="h-px relative bg-white/5">
                      <motion.div className="absolute inset-y-0 left-0 bg-white"
                        initial={{ width: '0%' }}
                        animate={{ width: step > s.num ? '100%' : '0%' }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Step Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
          <AnimatePresence mode="wait">

            {/* ── Step 1: Date & Time ───────────────────────────── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-12"
              >
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-4 h-4 text-white/30" />
                    <h3 className="text-lg font-light text-white">Select Date</h3>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2">
                    {availableDates.map((date, i) => (
                      <motion.button key={date.value}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => setSelectedDate(date.value)}
                        className={`group p-4 border text-center transition-all duration-300 ${
                          selectedDate === date.value
                            ? 'bg-white text-black border-white'
                            : 'border-white/10 text-white hover:border-white/30'
                        }`}
                      >
                        <div className={`text-[10px] uppercase tracking-wider mb-1 ${
                          selectedDate === date.value ? 'text-black/50' : 'text-white/30'
                        }`}>{date.day}</div>
                        <div className="text-2xl font-light">{date.dateNum}</div>
                        <div className={`text-[10px] mt-1 ${
                          selectedDate === date.value ? 'text-black/50' : 'text-white/30'
                        }`}>{date.month}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {selectedDate && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-3 mb-6">
                      <Clock className="w-4 h-4 text-white/30" />
                      <h3 className="text-lg font-light text-white">Select Time</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {availableSlots.map((slot) => {
                        const blocked = getBlockedSlotsForDate(selectedDate).includes(slot.time);
                        const ok = slot.available && !blocked;
                        return (
                          <motion.button key={slot.id}
                            onClick={() => ok && setSelectedTimeSlot(slot.time)}
                            disabled={!ok}
                            className={`p-4 border text-sm font-light transition-all duration-300 ${
                              !ok ? 'border-white/5 text-white/15 cursor-not-allowed'
                                : selectedTimeSlot === slot.time ? 'bg-white text-black border-white'
                                : 'border-white/10 text-white hover:border-white/30'
                            }`}
                          >
                            {slot.time}
                            {!slot.available && <span className="block text-[10px] mt-1 text-white/20">Booked</span>}
                            {slot.available && blocked && <span className="block text-[10px] mt-1 text-white/20">Unavailable</span>}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-end">
                  <button onClick={() => setStep(2)} disabled={!selectedDate || !selectedTimeSlot}
                    className="group flex items-center gap-3 px-8 py-4 bg-white text-black text-sm font-medium disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                  >
                    Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Device ─────────────────────────────── */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-10"
              >
                <div>
                  <h3 className="text-lg font-light text-white mb-2">What needs fixing?</h3>
                  <p className="text-white/40 text-sm">Pick the type of device you'd like to repair.</p>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {DEVICE_OPTIONS.map((opt, i) => {
                    const Icon = opt.icon;
                    const active = selectedDevice === opt.id;
                    return (
                      <motion.button key={opt.id}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        onClick={() => { setSelectedDevice(opt.id); setSelectedCategory('all'); setSelectedServices([]); }}
                        className={`p-8 border text-left transition-all duration-300 ${
                          active ? 'bg-white text-black border-white' : 'border-white/10 hover:border-white/30 text-white'
                        }`}
                      >
                        <Icon className="w-8 h-8 mb-6" strokeWidth={1.5} />
                        <div className="text-xl font-light mb-1">{opt.label}</div>
                        <div className={`text-xs ${active ? 'text-black/60' : 'text-white/40'}`}>{opt.blurb}</div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setStep(1)}
                    className="flex items-center gap-3 px-8 py-4 border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors"
                  ><ArrowLeft className="w-4 h-4" /> Back</button>
                  <button onClick={() => setStep(3)} disabled={!selectedDevice}
                    className="group flex items-center gap-3 px-8 py-4 bg-white text-black text-sm font-medium disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                  >Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Services ──────────────────────────────── */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-10"
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-lg font-light text-white capitalize">
                      {selectedDevice} repair services
                    </h3>
                    <p className="text-white/40 text-xs mt-1">
                      Some services show a price range. The final price is confirmed after inspection.
                    </p>
                  </div>
                </div>

                {/* Category pills */}
                {categories.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button key={cat.slug} onClick={() => setSelectedCategory(cat.slug)}
                        className={`px-5 py-2.5 text-xs font-medium tracking-wide transition-all duration-300 capitalize ${
                          selectedCategory === cat.slug
                            ? 'bg-white text-black' : 'border border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                        }`}
                      >{cat.name}</button>
                    ))}
                  </div>
                )}

                {servicesLoading ? (
                  <div className="flex justify-center py-20">
                    <motion.div className="w-10 h-10 border border-white/20 border-t-white"
                      animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                  </div>
                ) : filteredServices.length === 0 ? (
                  <p className="text-center text-white/30 py-20">No services found for this device yet.</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredServices.map((service, i) => {
                      const isSelected = selectedServices.includes(service.id);
                      const pd = getPriceDisplay(service);
                      return (
                        <motion.div key={service.id}
                          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => toggleService(service.id)}
                          className={`group relative p-6 border cursor-pointer transition-all duration-500 ${
                            isSelected ? 'border-white bg-white/[0.03]' : 'border-white/10 hover:border-white/25'
                          }`}
                        >
                          <div className={`absolute top-4 right-4 w-5 h-5 flex items-center justify-center transition-all duration-300 ${
                            isSelected ? 'bg-white' : 'border border-white/20'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-black" />}
                          </div>

                          {service.image && (
                            <div className="h-32 mb-4 overflow-hidden bg-white/[0.02]"
                              style={{ backgroundImage: `url(${service.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                            >
                              <div className="w-full h-full bg-gradient-to-t from-black/80 to-transparent" />
                            </div>
                          )}

                          <h4 className="text-white font-medium text-sm mb-2 pr-6">{service.name}</h4>
                          <p className="text-white/30 text-xs mb-4 line-clamp-2 leading-relaxed">{service.description}</p>

                          <div className="flex items-center justify-between">
                            <span className="text-white font-mono text-sm">{pd.label}</span>
                            <span className="text-[10px] text-white/20 uppercase tracking-wider">
                              {pd.mode === 'fixed' ? 'Fixed' : pd.mode === 'range' ? 'Estimate' : 'Quote'}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Selected summary */}
                {selectedServices.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="border border-white/10 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono text-white/40 uppercase tracking-wider">
                        Selected ({selectedServices.length})
                      </span>
                      <span className="text-white font-mono">
                        {hasQuoteService() ? 'Quote pending' : `Rs. ${formatPrice(calculateTotal())}`}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {getSelectedServiceObjects().map(s => {
                        const pd = getPriceDisplay(s);
                        const needsPart = serviceNeedsPart(s);
                        const part = selectedParts[s.id];
                        return (
                          <div key={s.id} className="py-2 border-b border-white/5 last:border-0">
                            <div className="flex justify-between">
                              <span className="text-white/60 text-sm">{s.name}</span>
                              <span className="text-white/40 text-sm font-mono">{pd.label}</span>
                            </div>
                            {needsPart && (
                              <div className="mt-2 pl-3 border-l border-white/10 text-xs">
                                {part?.product ? (
                                  <div className="flex justify-between text-white/50">
                                    <span>↳ {part.product.name}</span>
                                    <span className="font-mono">Rs. {formatPrice(part.product.price)}</span>
                                  </div>
                                ) : (
                                  <div className="text-amber-300/80">Part required. Pick one from our inventory.</div>
                                )}
                                <button onClick={() => openPartPicker(s)}
                                  className="text-[10px] uppercase tracking-wider text-white/50 hover:text-white mt-1"
                                >{part?.product ? 'Change part' : 'Select part'}</button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-between">
                  <button onClick={() => setStep(2)}
                    className="flex items-center gap-3 px-8 py-4 border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors"
                  ><ArrowLeft className="w-4 h-4" /> Back</button>
                  <button onClick={() => setStep(4)} disabled={selectedServices.length === 0 || getSelectedServiceObjects().some(s => serviceNeedsPart(s) && !selectedParts[s.id]?.product)}
                    className="group flex items-center gap-3 px-8 py-4 bg-white text-black text-sm font-medium disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                  >Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button>
                </div>
              </motion.div>
            )}

            {/* ── Step 4: Details (quote flow) or Contact (fixed flow) ─── */}
            {step === 4 && isQuoteRequest() && (
              <motion.div key="s4q" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-10 max-w-2xl mx-auto"
              >
                <div>
                  <h3 className="text-lg font-light text-white">Tell us about your device</h3>
                  <p className="text-white/40 text-xs mt-2">
                    These details help us send an accurate quote before any work begins.
                  </p>
                </div>

                <div>
                  <label className="text-xs text-white/30 uppercase tracking-wider mb-3 block">Device model</label>
                  <input type="text" value={deviceModel} onChange={e => setDeviceModel(e.target.value)}
                    placeholder={selectedDevice === 'mobile' ? 'e.g. iPhone 13, Samsung A52' : selectedDevice === 'laptop' ? 'e.g. Asus TUF F15, MacBook Pro 14' : 'e.g. Custom build, Dell OptiPlex 7080'}
                    className="w-full py-4 bg-transparent border-b border-white/10 text-white text-sm placeholder-white/20 focus:border-white/40 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/30 uppercase tracking-wider mb-3 block">Describe the issue</label>
                  <textarea value={issueDescription} onChange={e => setIssueDescription(e.target.value)}
                    placeholder="What's wrong? When did it start? Any visible damage?"
                    className="w-full h-28 bg-transparent border border-white/10 p-4 text-white text-sm placeholder-white/20 focus:border-white/30 focus:outline-none resize-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/30 uppercase tracking-wider mb-3 block">Photos (optional)</label>
                  <label className="flex items-center justify-center gap-3 border border-dashed border-white/15 hover:border-white/30 py-6 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-white/40" />
                    <span className="text-sm text-white/50">
                      {uploading ? 'Uploading…' : 'Click to upload photos of the device / damage'}
                    </span>
                    <input type="file" accept="image/*" multiple className="hidden"
                      onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
                    />
                  </label>
                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                      {imageUrls.map(url => (
                        <div key={url} className="relative group aspect-square border border-white/10 overflow-hidden">
                          <img src={url} alt="repair upload" className="w-full h-full object-cover" />
                          <button onClick={() => removeImage(url)}
                            className="absolute top-1 right-1 w-6 h-6 bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          ><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-6 pt-2">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <User className="w-3.5 h-3.5 text-white/20" />
                      <label className="text-xs text-white/30 uppercase tracking-wider">Full Name</label>
                    </div>
                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                      className="w-full py-4 bg-transparent border-b border-white/10 text-white text-sm placeholder-white/20 focus:border-white/40 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Mail className="w-3.5 h-3.5 text-white/20" />
                      <label className="text-xs text-white/30 uppercase tracking-wider">Email</label>
                    </div>
                    <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                      className="w-full py-4 bg-transparent border-b border-white/10 text-white text-sm placeholder-white/20 focus:border-white/40 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Phone className="w-3.5 h-3.5 text-white/20" />
                      <label className="text-xs text-white/30 uppercase tracking-wider">Phone</label>
                    </div>
                    <input type="tel" inputMode="numeric" maxLength={10}
                      value={customerPhone}
                      onChange={e => setCustomerPhone(sanitizePhone(e.target.value))}
                      placeholder="0701234567"
                      className="w-full py-4 bg-transparent border-b border-white/10 text-white text-sm placeholder-white/20 focus:border-white/40 focus:outline-none transition-colors"
                    />
                    {customerPhone.length > 0 && !isValidLkPhone(customerPhone) && (
                      <p className="text-red-400/70 text-[11px] mt-2">
                        Enter a 10-digit phone number (e.g. 0701234567).
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setStep(3)}
                    className="flex items-center gap-3 px-8 py-4 border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors"
                  ><ArrowLeft className="w-4 h-4" /> Back</button>
                  <button onClick={() => setStep(5)} disabled={!customerName || !customerEmail || !isValidLkPhone(customerPhone)}
                    className="group flex items-center gap-3 px-8 py-4 bg-white text-black text-sm font-medium disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                  >Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button>
                </div>
              </motion.div>
            )}

            {/* Fixed-price flow: contact-only step 4 */}
            {step === 4 && !isQuoteRequest() && (
              <motion.div key="s4f" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-10 max-w-2xl mx-auto"
              >
                <div>
                  <h3 className="text-lg font-light text-white">Contact Information</h3>
                  <p className="text-white/40 text-xs mt-2">
                    Fixed-price services. We'll confirm your appointment right after you submit.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <User className="w-3.5 h-3.5 text-white/20" />
                      <label className="text-xs text-white/30 uppercase tracking-wider">Full Name</label>
                    </div>
                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                      className="w-full py-4 bg-transparent border-b border-white/10 text-white text-sm placeholder-white/20 focus:border-white/40 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Mail className="w-3.5 h-3.5 text-white/20" />
                      <label className="text-xs text-white/30 uppercase tracking-wider">Email</label>
                    </div>
                    <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                      className="w-full py-4 bg-transparent border-b border-white/10 text-white text-sm placeholder-white/20 focus:border-white/40 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Phone className="w-3.5 h-3.5 text-white/20" />
                      <label className="text-xs text-white/30 uppercase tracking-wider">Phone</label>
                    </div>
                    <input type="tel" inputMode="numeric" maxLength={10}
                      value={customerPhone}
                      onChange={e => setCustomerPhone(sanitizePhone(e.target.value))}
                      placeholder="0701234567"
                      className="w-full py-4 bg-transparent border-b border-white/10 text-white text-sm placeholder-white/20 focus:border-white/40 focus:outline-none transition-colors"
                    />
                    {customerPhone.length > 0 && !isValidLkPhone(customerPhone) && (
                      <p className="text-red-400/70 text-[11px] mt-2">
                        Enter a 10-digit phone number (e.g. 0701234567).
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setStep(3)}
                    className="flex items-center gap-3 px-8 py-4 border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors"
                  ><ArrowLeft className="w-4 h-4" /> Back</button>
                  <button onClick={() => setStep(5)} disabled={!customerName || !customerEmail || !isValidLkPhone(customerPhone)}
                    className="group flex items-center gap-3 px-8 py-4 bg-white text-black text-sm font-medium disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                  >Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button>
                </div>
              </motion.div>
            )}

            {/* ── Step 5: Confirm ───────────────────────────────── */}
            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-10 max-w-3xl mx-auto"
              >
                <h3 className="text-lg font-light text-white">Review Request</h3>

                <div className="border border-white/10 divide-y divide-white/5">
                  <div className="p-6 grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Date</p>
                      <p className="text-white font-light">{availableDates.find(d => d.value === selectedDate)?.label}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Time</p>
                      <p className="text-white font-light">{selectedTimeSlot}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Device</p>
                      <p className="text-white font-light capitalize">{selectedDevice}{deviceModel ? ` · ${deviceModel}` : ''}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Estimate</p>
                      <p className="text-white font-light">
                        {hasQuoteService() ? 'Pending quote' : `Rs. ${formatPrice(calculateTotal())}`}
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Contact</p>
                    <p className="text-white font-light">{customerName}</p>
                    <p className="text-white/40 text-sm">{customerEmail} • {customerPhone}</p>
                  </div>

                  <div className="p-6">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-4">Services</p>
                    {getSelectedServiceObjects().map(s => {
                      const pd = getPriceDisplay(s);
                      return (
                        <div key={s.id} className="flex justify-between py-2.5 border-b border-white/5 last:border-0">
                          <span className="text-white/70 text-sm">{s.name}</span>
                          <span className="text-white text-sm font-mono">{pd.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {imageUrls.length > 0 && (
                    <div className="p-6">
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Photos</p>
                      <div className="flex flex-wrap gap-2">
                        {imageUrls.map(url => (
                          <img key={url} src={url} alt="" className="w-16 h-16 object-cover border border-white/10" />
                        ))}
                      </div>
                    </div>
                  )}

                  {issueDescription && (
                    <div className="p-6">
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Issue</p>
                      <p className="text-white/50 text-sm whitespace-pre-line">{issueDescription}</p>
                    </div>
                  )}
                </div>

                {hasQuoteService() && (
                  <div className="border border-white/10 bg-white/[0.02] p-4 text-xs text-white/60">
                    One or more selected services show a price range. The shop will inspect your device and
                    send a final price by email and as a web notification before any work begins.
                  </div>
                )}

                {error && (
                  <div className="border border-white/10 p-4 text-white/60 text-sm">{error}</div>
                )}

                <div className="flex justify-between items-center flex-wrap gap-3">
                  <button onClick={() => setStep(4)}
                    className="flex items-center gap-3 px-8 py-4 border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors"
                  ><ArrowLeft className="w-4 h-4" /> Back</button>
                  <div className="flex items-center gap-2 flex-wrap">
                    <EmailQuoteButton
                      type="repair"
                      items={buildQuoteItems()}
                      total={calculateTotal()}
                      defaultEmail={customerEmail}
                      defaultName={customerName}
                      meta={{ Date: selectedDate || undefined, Time: selectedTimeSlot || undefined, Phone: customerPhone || undefined, Device: deviceModel || undefined }}
                      notes={issueDescription || undefined}
                      label="Email me this quote"
                    />
                    <button onClick={handleSubmit} disabled={isLoading}
                      className="group flex items-center gap-3 px-10 py-4 bg-white text-black text-sm font-medium disabled:opacity-50 transition-opacity"
                    >
                      {isLoading ? (
                        <><motion.div className="w-4 h-4 border-2 border-black border-t-transparent"
                          animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        /> Submitting…</>
                      ) : (
                        <>{isQuoteRequest() ? 'Request Quote' : 'Confirm Booking'} <Check className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>

      {pickerService && (
        <RepairPartPicker
          open={!!pickerService}
          onClose={() => setPickerService(null)}
          config={pickerService.config}
          initial={selectedParts[pickerService.service.id]}
          onConfirm={(sel) => setSelectedParts(prev => ({ ...prev, [pickerService.service.id]: sel }))}
        />
      )}
    </div>
  );
};

export default RepairBooking;
