import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useOrdersStore } from '../store/ordersStore';
import { useAdminStore } from '../store/adminStore';
import { ArrowRight, ArrowLeft, Check, Clock, Calendar, User, Mail, Phone, ChevronDown } from 'lucide-react';
import api from '../utils/api';
import type { Product } from '../types';
import RepairPartPicker, { detectPartConfig, type SelectedPart, type PartPickerConfig } from '../components/repair/RepairPartPicker';
import EmailQuoteButton from '../components/ui/EmailQuoteButton';

/* ─── Types ───────────────────────────────────────────────────── */
interface TimeSlot { id: string; time: string; available: boolean }

/* ─── Constants ──────────────────────────────────────────────── */
const serviceCategories = [
  { id: 'all', name: 'All Services' },
  { id: 'hardware', name: 'Hardware' },
  { id: 'software', name: 'Software' },
  { id: 'data', name: 'Data Recovery' },
  { id: 'upgrade', name: 'Upgrades' },
  { id: 'cleaning', name: 'Cleaning' },
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

const STEPS = [
  { num: 1, label: 'Date & Time' },
  { num: 2, label: 'Services' },
  { num: 3, label: 'Contact' },
  { num: 4, label: 'Confirm' },
];

/* ─── Helpers ─────────────────────────────────────────────────── */
const normalizePrice = (price: number | string | null | undefined) => {
  const n = typeof price === 'number' ? price : Number(price);
  return Number.isFinite(n) ? n : 0;
};
const formatPrice = (p: number | string | null | undefined) => normalizePrice(p).toLocaleString('en-LK');

const getCategoryServiceTypes = (cat: string): string[] => {
  switch (cat) {
    case 'hardware': return ['repair', 'hardware'];
    case 'software': return ['software'];
    case 'data': return ['data'];
    case 'upgrade': return ['upgrade'];
    case 'cleaning': return ['cleaning', 'maintenance'];
    default: return [];
  }
};

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

  // Pre-select the service category when the page is opened from a footer
  // category link (e.g. /repair?category=upgrade). Falls back to "all".
  const initialCategory = (() => {
    const c = searchParams.get('category');
    return c && serviceCategories.some(sc => sc.id === c) ? c : 'all';
  })();

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [issueDescription, setIssueDescription] = useState('');
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
  const [selectedParts, setSelectedParts] = useState<Record<string, SelectedPart>>({});
  const [pickerService, setPickerService] = useState<{ service: Product; config: PartPickerConfig } | null>(null);

  const availableDates = getAvailableDates();

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

  // React to URL category changes (e.g. footer Category link clicked while
  // already on this page. Router updates searchParams without a remount).
  useEffect(() => {
    const c = searchParams.get('category');
    const next = c && serviceCategories.some(sc => sc.id === c) ? c : 'all';
    if (next !== selectedCategory) setSelectedCategory(next);
  }, [searchParams]);

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

  // Fetch user bookings
  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/repairs/my-bookings').catch(() => {});
  }, [isAuthenticated]);

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => getCategoryServiceTypes(selectedCategory).includes(s.serviceType || ''));

  const getSelectedServiceObjects = () => services.filter(s => selectedServices.includes(s.id));
  const calculateTotal = () => getSelectedServiceObjects().reduce((t, s) => {
    const partsTotal = selectedParts[s.id]?.partsTotal || 0;
    return t + normalizePrice(s.price) + partsTotal;
  }, 0);
  const toggleService = (id: string) => {
    setSelectedServices(prev => {
      const isRemoving = prev.includes(id);
      if (isRemoving) {
        // Removing a service also clears its part selection.
        setSelectedParts(p => { const n = { ...p }; delete n[id]; return n; });
        return prev.filter(x => x !== id);
      }
      // Adding: open part picker if this service needs one.
      const svc = services.find(s => s.id === id);
      if (svc) {
        const cfg = detectPartConfig({ name: svc.name, price: normalizePrice(svc.price), serviceType: svc.serviceType, compatibility: (svc as any).compatibility });
        if (cfg) setPickerService({ service: svc, config: cfg });
      }
      return [...prev, id];
    });
  };
  const openPartPicker = (svc: Product) => {
    const cfg = detectPartConfig({ name: svc.name, price: normalizePrice(svc.price), serviceType: svc.serviceType, compatibility: (svc as any).compatibility });
    if (cfg) setPickerService({ service: svc, config: cfg });
  };
  const buildQuoteItems = () => {
    const out: { name: string; description?: string; quantity?: number; price: number }[] = [];
    getSelectedServiceObjects().forEach(s => {
      const part = selectedParts[s.id];
      const desc = part?.laptop ? `For ${part.laptop.brand || ''} ${part.laptop.name}`.trim() : undefined;
      out.push({ name: s.name, description: desc, price: normalizePrice(s.price) });
      if (part?.product) {
        out.push({ name: `↳ ${part.product.name}`, description: part.product.brand || undefined, price: Number(part.product.price) });
      }
    });
    return out;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const serviceNames = getSelectedServiceObjects().map(s => s.name);
      const ticketId = addBooking({
        deviceType: 'Laptop', deviceModel: 'Device',
        issueDescription: issueDescription || 'General repair service',
        bookedDate: selectedDate, totalCost: calculateTotal(),
        services: serviceNames, timeSlot: selectedTimeSlot,
        customerName, customerEmail, customerPhone,
      });
      setBookingTicketId(ticketId);
      try { await api.post('/repairs/book', {
        date: selectedDate, timeSlot: selectedTimeSlot, deviceType: 'Laptop',
        issueDescription, customerName, customerEmail, customerPhone,
        totalAmount: calculateTotal(),
      }); } catch { /* local save succeeded */ }
      setBookingSuccess(true);
    } catch { setError('Failed to create booking.'); } finally { setIsLoading(false); }
  };

  const resetForm = () => {
    setStep(1); setSelectedDate(''); setSelectedTimeSlot(''); setSelectedCategory('all');
    setSelectedServices([]); setIssueDescription(''); setBookingSuccess(false);
    setBookingTicketId(''); setError(null);
  };

  /* ─── Success Screen ─────────────────────────────────────── */
  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="text-center"
          >
            {/* Success icon */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 border-2 border-white flex items-center justify-center mx-auto mb-10"
            >
              <Check className="w-8 h-8 text-white" strokeWidth={1.5} />
            </motion.div>

            <h1 className="text-4xl font-light text-white tracking-tight mb-3">Booking Confirmed</h1>
            <p className="text-white/40 mb-2">Your repair appointment has been scheduled.</p>
            <p className="text-sm font-mono text-white/60 mb-10">Ticket: {bookingTicketId}</p>

            {/* Details card */}
            <div className="border border-white/10 p-8 text-left mb-10">
              <h3 className="text-sm font-mono text-white/40 uppercase tracking-wider mb-6">Appointment Details</h3>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Date</p>
                  <p className="text-white font-light">{availableDates.find(d => d.value === selectedDate)?.label}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Time</p>
                  <p className="text-white font-light">{selectedTimeSlot}</p>
                </div>
              </div>

              <div className="border-t border-white/5 pt-6">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-4">Services</p>
                {getSelectedServiceObjects().map(s => (
                  <div key={s.id} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-white/70 text-sm">{s.name}</span>
                    <span className="text-white text-sm font-mono">Rs. {formatPrice(s.price)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-4 mt-2">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-white font-medium text-lg">Rs. {formatPrice(calculateTotal())}</span>
                </div>
              </div>
            </div>

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
            >Select your services and preferred time. We'll take care of the rest.</motion.p>
          </motion.div>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="pb-12">
        <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
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
                {i < 3 && (
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
            {/* ── Step 1: Date & Time ─────────────────────────── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-12"
              >
                {/* Date */}
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

                {/* Time */}
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

                {/* Shop hours */}
                <div className="border border-white/5 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-4 h-4 text-white/20" />
                    <span className="text-xs font-mono text-white/30 uppercase tracking-wider">Shop Hours</span>
                  </div>
                  <div className="grid grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="text-white/30 text-xs mb-1">Mon - Fri</p>
                      <p className="text-white/60 font-light">9AM - 6PM</p>
                    </div>
                    <div>
                      <p className="text-white/30 text-xs mb-1">Saturday</p>
                      <p className="text-white/60 font-light">10AM - 4PM</p>
                    </div>
                    <div>
                      <p className="text-white/30 text-xs mb-1">Sunday</p>
                      <p className="text-white/30 font-light">Closed</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={() => setStep(2)} disabled={!selectedDate || !selectedTimeSlot}
                    className="group flex items-center gap-3 px-8 py-4 bg-white text-black text-sm font-medium disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                  >
                    Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Services ──────────────────────────────── */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-10"
              >
                {/* Category pills */}
                <div className="flex flex-wrap gap-2">
                  {serviceCategories.map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                      className={`px-5 py-2.5 text-xs font-medium tracking-wide transition-all duration-300 ${
                        selectedCategory === cat.id
                          ? 'bg-white text-black' : 'border border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                      }`}
                    >{cat.name}</button>
                  ))}
                </div>

                {/* Services grid */}
                {servicesLoading ? (
                  <div className="flex justify-center py-20">
                    <motion.div className="w-10 h-10 border border-white/20 border-t-white"
                      animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                  </div>
                ) : filteredServices.length === 0 ? (
                  <p className="text-center text-white/30 py-20">No services found.</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredServices.map((service, i) => {
                      const isSelected = selectedServices.includes(service.id);
                      return (
                        <motion.div key={service.id}
                          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => toggleService(service.id)}
                          className={`group relative p-6 border cursor-pointer transition-all duration-500 ${
                            isSelected ? 'border-white bg-white/[0.03]' : 'border-white/10 hover:border-white/25'
                          }`}
                        >
                          {/* Selection indicator */}
                          <div className={`absolute top-4 right-4 w-5 h-5 flex items-center justify-center transition-all duration-300 ${
                            isSelected ? 'bg-white' : 'border border-white/20'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-black" />}
                          </div>

                          {/* Image */}
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
                            <span className="text-white font-mono text-sm">Rs. {formatPrice(service.price)}</span>
                            <span className="text-[10px] text-white/20 uppercase tracking-wider">{service.serviceType || 'Service'}</span>
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
                      <span className="text-white font-mono">Rs. {formatPrice(calculateTotal())}</span>
                    </div>
                    <div className="space-y-2">
                      {getSelectedServiceObjects().map(s => {
                        const part = selectedParts[s.id];
                        const cfg = detectPartConfig({ name: s.name, price: normalizePrice(s.price), serviceType: s.serviceType, compatibility: (s as any).compatibility });
                        return (
                          <div key={s.id} className="py-2 border-b border-white/5 last:border-0">
                            <div className="flex justify-between">
                              <span className="text-white/60 text-sm">{s.name}</span>
                              <span className="text-white/40 text-sm font-mono">Rs. {formatPrice(s.price)}</span>
                            </div>
                            {cfg && (
                              <div className="mt-2 pl-3 border-l border-white/10 text-xs">
                                {part?.laptop && (
                                  <div className="text-white/40">For: <span className="text-white/70">{part.laptop.brand} {part.laptop.name}</span></div>
                                )}
                                {part?.product && (
                                  <div className="flex justify-between text-white/40 mt-0.5">
                                    <span>↳ {part.product.name}</span>
                                    <span className="font-mono">Rs. {formatPrice(part.product.price)}</span>
                                  </div>
                                )}
                                <button onClick={() => openPartPicker(s)}
                                  className="text-[10px] uppercase tracking-wider text-white/50 hover:text-white mt-1"
                                >
                                  {part?.product || part?.laptop ? 'Change selection' : 'Select part'}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Email quote on services step */}
                {selectedServices.length > 0 && (
                  <div className="flex justify-end">
                    <EmailQuoteButton
                      type="repair"
                      items={buildQuoteItems()}
                      total={calculateTotal()}
                      defaultEmail={customerEmail}
                      defaultName={customerName}
                      meta={{ Date: selectedDate || undefined, Time: selectedTimeSlot || undefined }}
                      notes={issueDescription || undefined}
                      label="Email me this quote"
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <h3 className="text-sm font-light text-white/50 mb-3">Additional Notes</h3>
                  <textarea value={issueDescription} onChange={e => setIssueDescription(e.target.value)}
                    placeholder="Describe your issue or special requirements..."
                    className="w-full h-28 bg-transparent border border-white/10 p-4 text-white text-sm placeholder-white/20 focus:border-white/30 focus:outline-none resize-none transition-colors"
                  />
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setStep(1)}
                    className="flex items-center gap-3 px-8 py-4 border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors"
                  ><ArrowLeft className="w-4 h-4" /> Back</button>
                  <button onClick={() => setStep(3)} disabled={selectedServices.length === 0}
                    className="group flex items-center gap-3 px-8 py-4 bg-white text-black text-sm font-medium disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                  >Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Contact Info ─────────────────────────── */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-10 max-w-2xl mx-auto"
              >
                <div>
                  <h3 className="text-lg font-light text-white mb-8">Contact Information</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <User className="w-3.5 h-3.5 text-white/20" />
                        <label className="text-xs text-white/30 uppercase tracking-wider">Full Name</label>
                      </div>
                      <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                        placeholder="Deshan Dinidu"
                        className="w-full py-4 bg-transparent border-b border-white/10 text-white text-sm placeholder-white/20 focus:border-white/40 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <Mail className="w-3.5 h-3.5 text-white/20" />
                        <label className="text-xs text-white/30 uppercase tracking-wider">Email</label>
                      </div>
                      <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                        placeholder="deshandinidu@gmail.com"
                        className="w-full py-4 bg-transparent border-b border-white/10 text-white text-sm placeholder-white/20 focus:border-white/40 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <Phone className="w-3.5 h-3.5 text-white/20" />
                        <label className="text-xs text-white/30 uppercase tracking-wider">Phone</label>
                      </div>
                      <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                        placeholder="+94 77 343 9842"
                        className="w-full py-4 bg-transparent border-b border-white/10 text-white text-sm placeholder-white/20 focus:border-white/40 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setStep(2)}
                    className="flex items-center gap-3 px-8 py-4 border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors"
                  ><ArrowLeft className="w-4 h-4" /> Back</button>
                  <button onClick={() => setStep(4)} disabled={!customerName || !customerEmail || !customerPhone}
                    className="group flex items-center gap-3 px-8 py-4 bg-white text-black text-sm font-medium disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                  >Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button>
                </div>
              </motion.div>
            )}

            {/* ── Step 4: Confirm ───────────────────────────────── */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-10 max-w-3xl mx-auto"
              >
                <h3 className="text-lg font-light text-white">Review Booking</h3>

                <div className="border border-white/10 divide-y divide-white/5">
                  {/* Date & Time */}
                  <div className="p-6 grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Date</p>
                      <p className="text-white font-light">{availableDates.find(d => d.value === selectedDate)?.label}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Time</p>
                      <p className="text-white font-light">{selectedTimeSlot}</p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="p-6">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Contact</p>
                    <p className="text-white font-light">{customerName}</p>
                    <p className="text-white/40 text-sm">{customerEmail} • {customerPhone}</p>
                  </div>

                  {/* Services */}
                  <div className="p-6">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-4">Services</p>
                    {getSelectedServiceObjects().map(s => {
                      const part = selectedParts[s.id];
                      return (
                        <div key={s.id} className="py-2.5 border-b border-white/5 last:border-0">
                          <div className="flex justify-between">
                            <span className="text-white/70 text-sm">{s.name}</span>
                            <span className="text-white text-sm font-mono">Rs. {formatPrice(s.price)}</span>
                          </div>
                          {part?.laptop && (
                            <p className="text-xs text-white/40 mt-1">For: {part.laptop.brand} {part.laptop.name}</p>
                          )}
                          {part?.product && (
                            <div className="flex justify-between text-xs text-white/50 mt-1">
                              <span>↳ {part.product.name}</span>
                              <span className="font-mono">Rs. {formatPrice(part.product.price)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div className="flex justify-between pt-4 mt-2">
                      <span className="text-white font-medium">Total</span>
                      <span className="text-white font-medium text-xl">Rs. {formatPrice(calculateTotal())}</span>
                    </div>
                  </div>

                  {issueDescription && (
                    <div className="p-6">
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Notes</p>
                      <p className="text-white/50 text-sm">{issueDescription}</p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="border border-white/10 p-4 text-white/60 text-sm">{error}</div>
                )}

                <div className="flex justify-between items-center flex-wrap gap-3">
                  <button onClick={() => setStep(3)}
                    className="flex items-center gap-3 px-8 py-4 border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors"
                  ><ArrowLeft className="w-4 h-4" /> Back</button>
                  <div className="flex items-center gap-2 flex-wrap">
                    <EmailQuoteButton
                      type="repair"
                      items={buildQuoteItems()}
                      total={calculateTotal()}
                      defaultEmail={customerEmail}
                      defaultName={customerName}
                      meta={{ Date: selectedDate || undefined, Time: selectedTimeSlot || undefined, Phone: customerPhone || undefined }}
                      notes={issueDescription || undefined}
                      label="Email me this quote"
                    />
                  <button onClick={handleSubmit} disabled={isLoading}
                    className="group flex items-center gap-3 px-10 py-4 bg-white text-black text-sm font-medium disabled:opacity-50 transition-opacity"
                  >
                    {isLoading ? (
                      <><motion.div className="w-4 h-4 border-2 border-black border-t-transparent"
                        animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      /> Booking...</>
                    ) : (
                      <>Confirm Booking <Check className="w-4 h-4" /></>
                    )}
                  </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Info Footer ──────────────────────────────────────── */}
      <section className="py-20 bg-black border-t border-white/5">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid md:grid-cols-3 gap-1">
            {[
              { icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>, title: 'Expert Technicians', desc: 'Certified professionals with years of experience' },
              { icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, title: 'Fast Turnaround', desc: 'Most repairs completed within 24-48 hours' },
              { icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7.268-4.394a1.5 1.5 0 10-2.122-2.122l-.841.84-.172-.172a1.5 1.5 0 10-2.122 2.122l3.264 3.264a1.5 1.5 0 002.122 0l3.071-3.071zM12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, title: '90-Day Warranty', desc: 'All repairs covered by our service warranty' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group p-10 border border-white/5 hover:border-white/15 transition-all duration-700"
              >
                <div className="text-3xl mb-6">{item.icon}</div>
                <h4 className="text-white font-medium text-sm mb-2 tracking-tight">{item.title}</h4>
                <p className="text-white/30 text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Part picker modal */}
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
