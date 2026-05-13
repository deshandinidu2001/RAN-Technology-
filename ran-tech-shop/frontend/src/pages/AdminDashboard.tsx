import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../store/adminStore';
import { useOrdersStore, RepairBooking, Order } from '../store/ordersStore';
import { Product } from '../types';
import api from '../utils/api';
import RepairCategoryManager from '../components/admin/RepairCategoryManager';
import QuoteRequestsPanel from '../components/admin/QuoteRequestsPanel';

type TabType = 'repairs' | 'quote-requests' | 'history' | 'orders' | 'products' | 'services' | 'repair-categories' | 'categories' | 'users' | 'timeslots' | 'settings';

const repairStages = ['Received', 'Diagnosing', 'Waiting for Parts', 'Repairing', 'Ready for Pickup', 'Collected'];
const technicians = ['Kasun Silva', 'Nimesh Jayawardena', 'Pradeep Fernando', 'Ruwan Perera'];

const timeSlots = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
];

type BackendBooking = {
  id: string;
  date?: string;
  timeSlot?: string;
  deviceType?: string;
  issueDescription?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  status?: string;
  estimatedCost?: number | null;
  actualCost?: number | null;
  completedAt?: string | null;
  createdAt?: string;
};

type BackendOrder = {
  id: string;
  status?: string;
  total: number;
  createdAt?: string;
  shippingName?: string | null;
  shippingEmail?: string | null;
  shippingAddress?: string | null;
  shippingCity?: string | null;
  shippingZip?: string | null;
  user?: { name?: string | null; email?: string | null } | null;
  items?: Array<{
    id?: string;
    quantity: number;
    price: number;
    product?: {
      id?: string;
      name?: string;
      image?: string;
    } | null;
  }>;
};

type SpecField = { label: string; options: string[] };

type AdminFilterCategory = {
  id?: string;
  slug: string;
  name: string;
  parentSlug?: string | null;
  order: number;
  visible: boolean;
  specFields?: SpecField[];
};

const DEFAULT_FILTER_CATEGORIES: AdminFilterCategory[] = [
  { slug: 'laptops', name: 'Laptops', order: 10, visible: true },
  { slug: 'ram', name: 'RAM Memory', order: 20, visible: true },
  { slug: 'ssd', name: 'SSD Storage', order: 30, visible: true },
  { slug: 'battery', name: 'Laptop Batteries', order: 40, visible: true },
  { slug: 'cooling-pad', name: 'Cooling', order: 50, visible: true },
  { slug: 'processor', name: 'Processors', order: 60, visible: true },
  { slug: 'motherboard', name: 'Motherboards', order: 70, visible: true },
  { slug: 'psu', name: 'Power Supplies', order: 80, visible: true },
  { slug: 'case', name: 'PC Cases', order: 90, visible: true },
  { slug: 'graphics-cards', name: 'Graphics Cards', order: 100, visible: true },
  { slug: 'monitors', name: 'Monitors', order: 110, visible: true },
  { slug: 'storage', name: 'Storage', order: 120, visible: true },
  { slug: 'gaming', name: 'Gaming', order: 130, visible: true },
  { slug: 'smartphones', name: 'Smartphones', order: 140, visible: true },
  { slug: 'accessories', name: 'Accessories', order: 150, visible: true },
  { slug: 'gaming-laptop', name: 'Gaming Laptops', parentSlug: 'laptops', order: 10, visible: true },
  { slug: 'business-laptop', name: 'Business Laptops', parentSlug: 'laptops', order: 20, visible: true },
  { slug: 'used-laptop', name: 'Used Laptops', parentSlug: 'laptops', order: 30, visible: true },
];

const FILTER_DETAIL_FIELDS: Record<string, string[]> = {
  laptops: ['Processor', 'RAM', 'Storage'],
  ram: ['Type', 'Capacity', 'Speed'],
  ssd: ['Type', 'Capacity'],
  battery: ['Compatibility', 'Capacity', 'Warranty'],
  'cooling-pad': ['Type', 'Compatibility'],
  processor: ['Socket', 'Cores'],
  motherboard: ['Socket', 'Chipset'],
  psu: ['Wattage', 'Efficiency'],
  case: ['Form Factor', 'Size'],
  'graphics-cards': ['Chipset', 'Memory'],
  monitors: ['Resolution', 'Refresh Rate', 'Panel Type'],
  storage: ['Type', 'Capacity'],
  smartphones: ['RAM', 'Storage'],
  gaming: ['Platform', 'Type'],
  accessories: ['Type', 'Compatibility'],
};

// Seeded dropdown options shown when a category's `specFields` is empty.
// Admins can override these in the Filter Categories → Specification Dropdowns panel.
const DEFAULT_SPEC_FIELD_OPTIONS: Record<string, SpecField[]> = {
  laptops: [
    {
      label: 'Processor',
      options: [
        'Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9',
        'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9',
        'Apple M1', 'Apple M2', 'Apple M3', 'Apple M4',
      ],
    },
    { label: 'RAM', options: ['4GB', '8GB', '16GB', '32GB', '64GB'] },
    {
      label: 'Storage',
      options: [
        '128GB SSD', '256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD',
        '500GB HDD', '1TB HDD', '2TB HDD',
      ],
    },
  ],
  ram: [
    { label: 'Type', options: ['DDR3', 'DDR4', 'DDR5'] },
    { label: 'Capacity', options: ['4GB', '8GB', '16GB', '32GB', '64GB'] },
    { label: 'Speed', options: ['2400 MHz', '2666 MHz', '3200 MHz', '3600 MHz', '4800 MHz', '5600 MHz', '6000 MHz'] },
  ],
  ssd: [
    { label: 'Type', options: ['SATA', 'NVMe M.2', 'PCIe Gen4', 'PCIe Gen5'] },
    { label: 'Capacity', options: ['128GB', '256GB', '512GB', '1TB', '2TB', '4TB'] },
  ],
};

const PRODUCT_CATEGORY_PARENT: Record<string, string> = {
  ram: 'laptop-accessories',
  ssd: 'laptop-accessories',
  battery: 'laptop-accessories',
  'cooling-pad': 'laptop-accessories',
  processor: 'components',
  motherboard: 'components',
  psu: 'components',
  case: 'components',
};

const bookingStatusToStage = (status?: string) => {
  switch (status) {
    case 'confirmed':
      return 1;
    case 'in-progress':
      return 3;
    case 'ready-for-pickup':
      return 4;
    case 'completed':
      return 5;
    case 'cancelled':
      return 0;
    case 'pending':
    default:
      return 0;
  }
};

const stageToBookingStatus = (stage: number) => {
  if (stage >= 5) return 'completed';
  if (stage >= 4) return 'ready-for-pickup';
  if (stage >= 3) return 'in-progress';
  if (stage >= 1) return 'confirmed';
  return 'pending';
};

const mapBackendBooking = (booking: BackendBooking): RepairBooking => ({
  ticketId: booking.id,
  serialNo: (booking as any).serialNo ?? null,
  deviceType: booking.deviceType || 'Device',
  deviceModel: (booking as any).deviceModel || booking.deviceType || 'General Repair',
  issueDescription: booking.issueDescription || '',
  currentStage: bookingStatusToStage(booking.status),
  bookedDate: booking.date || booking.createdAt?.split('T')[0] || '',
  estimatedCompletion: booking.completedAt?.split('T')[0] || booking.date || booking.createdAt?.split('T')[0] || '',
  technicianName: 'RAN Service Team',
  totalCost: Number(booking.actualCost ?? booking.estimatedCost ?? 0),
  services: (() => {
    const raw = (booking as any).services;
    if (!raw) return [] as string[];
    try { const v = typeof raw === 'string' ? JSON.parse(raw) : raw; return Array.isArray(v) ? v.map(String) : []; }
    catch { return [] as string[]; }
  })(),
  timeSlot: booking.timeSlot || '',
  customerName: booking.customerName || 'Customer',
  customerEmail: booking.customerEmail || '',
  customerPhone: booking.customerPhone || '',
  createdAt: booking.createdAt || new Date().toISOString(),
  requestType: ((booking as any).requestType as 'quote' | 'booking') || 'booking',
  status: booking.status,
  quotedPrice: (booking as any).quotedPrice ?? null,
  quotedPriceMax: (booking as any).quotedPriceMax ?? null,
  quoteMessage: (booking as any).quoteMessage ?? null,
  issueImages: (() => {
    const raw = (booking as any).images;
    if (!raw) return [] as string[];
    try { const v = typeof raw === 'string' ? JSON.parse(raw) : raw; return Array.isArray(v) ? v : []; }
    catch { return [] as string[]; }
  })(),
});

const mapBackendOrder = (order: BackendOrder): Order => ({
  id: order.id,
  date: order.createdAt?.split('T')[0] || '',
  status: order.status === 'pending' ? 'processing' : (order.status as Order['status']) || 'processing',
  items: (order.items || []).map((item, index) => ({
    id: item.product?.id || item.id || `item-${index}`,
    name: item.product?.name || 'Product',
    quantity: item.quantity,
    price: item.price,
    image: item.product?.image || '/images/placeholder-product.jpg',
  })),
  total: order.total,
  shippingAddress: [order.shippingAddress, order.shippingCity, order.shippingZip].filter(Boolean).join(', '),
  trackingNumber: undefined,
  customerName: order.shippingName || order.user?.name || 'Customer',
  customerEmail: order.shippingEmail || order.user?.email || '',
  customerPhone: '',
});

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAdminAuthenticated, adminLogout, blockTimeSlot, unblockTimeSlot, getBlockedSlotsForDate } = useAdminStore();
  const {
    updateBookingStage, updateBookingTechnician, updateBookingEstCompletion, updateBookingCost,
    updateOrderStatus
  } = useOrdersStore();
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [liveBookings, setLiveBookings] = useState<RepairBooking[]>([]);
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [filterCategories, setFilterCategories] = useState<AdminFilterCategory[]>(DEFAULT_FILTER_CATEGORIES);

  // Fetch products from database API
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const response = await api.get('/products?limit=500');
      const products = Array.isArray(response.data) ? response.data : (response.data.products || []);
      setDbProducts(products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/users');
      setDbUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, []);

  const fetchFilterCategories = useCallback(async () => {
    try {
      const response = await api.get('/filter-categories?includeHidden=true');
      const loaded = response.data?.categories || [];
      if (Array.isArray(loaded) && loaded.length > 0) {
        const bySlug = new Map<string, AdminFilterCategory>();
        [...DEFAULT_FILTER_CATEGORIES, ...loaded].forEach((cat) => bySlug.set(cat.slug, cat));
        setFilterCategories(Array.from(bySlug.values()));
      } else {
        setFilterCategories(DEFAULT_FILTER_CATEGORIES);
      }
    } catch (error) {
      console.error('Failed to fetch filter categories:', error);
      setFilterCategories(DEFAULT_FILTER_CATEGORIES);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const response = await api.get('/repairs/admin/bookings?limit=500');
      const bookingsList = response.data?.bookings || [];
      setLiveBookings(bookingsList.map(mapBackendBooking));
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setLiveBookings([]);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get('/orders/all?limit=500');
      const ordersList = response.data?.orders || [];
      setLiveOrders(ordersList.map(mapBackendOrder));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setLiveOrders([]);
    }
  }, []);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchProducts();
      fetchUsers();
      fetchBookings();
      fetchOrders();
      fetchFilterCategories();
    }
  }, [isAdminAuthenticated, fetchProducts, fetchUsers, fetchBookings, fetchOrders, fetchFilterCategories]);

  // Auto-refresh data every 3s while admin dashboard is open.
  // Filter categories don't poll — they change rarely and refetch on save.
  useEffect(() => {
    if (!isAdminAuthenticated) return;
    const interval = setInterval(() => {
      fetchProducts();
      fetchUsers();
      fetchBookings();
      fetchOrders();
    }, 3000);
    return () => clearInterval(interval);
  }, [isAdminAuthenticated, fetchProducts, fetchUsers, fetchBookings, fetchOrders]);

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Delete ${product.name}?`)) return;
    try {
      await api.delete(`/products/${product.id}`);
      setDbProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. It may have orders associated with it.');
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    const next = !(product as any).featured;
    // Optimistic update so the UI reacts instantly.
    setDbProducts(prev => prev.map(p => p.id === product.id ? ({ ...p, featured: next } as Product) : p));
    try {
      const response = await api.put(`/products/${product.id}`, { featured: next });
      const updated = response.data?.product ?? response.data;
      if (updated && updated.id) {
        setDbProducts(prev => prev.map(p => p.id === product.id ? updated : p));
      }
    } catch (error: any) {
      console.error('Failed to toggle featured:', error);
      // Revert on failure.
      setDbProducts(prev => prev.map(p => p.id === product.id ? ({ ...p, featured: !next } as Product) : p));
      alert(error?.response?.data?.error || 'Failed to update featured status');
    }
  };

  const handleSaveProduct = async (productData: any, isEdit: boolean, productId?: string) => {
    try {
      if (isEdit && productId) {
        const response = await api.put(`/products/${productId}`, productData);
        const updated = response.data?.product ?? response.data;
        setDbProducts(prev => prev.map(p => p.id === productId ? updated : p));
      } else {
        const response = await api.post('/products', productData);
        const created = response.data?.product ?? response.data;
        setDbProducts(prev => [...prev, created]);
      }
      setShowProductForm(false);
      setSelectedProduct(null);
      setServiceFormMode(false);
      setProductFormCategory('');
    } catch (error: any) {
      console.error('Failed to save product:', error);
      alert(error.response?.data?.error || 'Failed to save product');
    }
  };

  const [activeTab, setActiveTab] = useState<TabType>('repairs');
  const [selectedRepair, setSelectedRepair] = useState<RepairBooking | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [serviceFormMode, setServiceFormMode] = useState(false);
  const [servicesDeviceFilter, setServicesDeviceFilter] = useState<'all' | 'desktop' | 'laptop' | 'mobile' | 'unassigned'>('all');
  // Service-form local state for the multi-step "Add Service" UI.
  const [svcFormDevice, setSvcFormDevice] = useState<'' | 'desktop' | 'laptop' | 'mobile'>('');
  const [svcFormCategories, setSvcFormCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [svcFormPriceMode, setSvcFormPriceMode] = useState<'fixed' | 'range' | 'quote'>('fixed');

  useEffect(() => {
    if (!svcFormDevice) { setSvcFormCategories([]); return; }
    api.get(`/repair-categories?deviceType=${svcFormDevice}`)
      .then(res => setSvcFormCategories(res.data?.categories ?? []))
      .catch(() => setSvcFormCategories([]));
  }, [svcFormDevice]);
  const [productFormCategory, setProductFormCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // Cloudinary-backed image uploads for the product form.
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Whenever the form opens (new or edit), seed the upload state from the row.
  useEffect(() => {
    if (!showProductForm) return;
    setMainImageUrl(selectedProduct?.image || '');
    const raw = (selectedProduct as any)?.images;
    let gallery: string[] = [];
    if (Array.isArray(raw)) {
      gallery = raw.filter(Boolean);
    } else if (typeof raw === 'string' && raw) {
      try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) gallery = parsed.filter(Boolean); }
      catch { gallery = raw.split(',').map(s => s.trim()).filter(Boolean); }
    }
    setGalleryUrls(gallery);
  }, [showProductForm, selectedProduct]);

  const uploadMainImage = async (file: File) => {
    setUploadingMain(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'ran-tech-shop/products');
      const res = await api.post('/uploads/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMainImageUrl(res.data.url);
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploadingMain(false);
    }
  };

  const uploadGalleryImages = async (files: FileList) => {
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach(f => fd.append('files', f));
      fd.append('folder', 'ran-tech-shop/products');
      const res = await api.post('/uploads/images', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const newUrls = (res.data.images || []).map((i: any) => i.url);
      setGalleryUrls(prev => [...prev, ...newUrls]);
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to upload images');
    } finally {
      setUploadingGallery(false);
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin');
    }
  }, [isAdminAuthenticated, navigate]);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin');
  };

  const handleRepairStageUpdate = async (ticketId: string, stage: number) => {
    updateBookingStage(ticketId, stage);
    setLiveBookings(prev =>
      prev.map(booking => booking.ticketId === ticketId ? { ...booking, currentStage: stage } : booking)
    );

    try {
      await api.patch(`/repairs/admin/booking/${ticketId}`, {
        status: stageToBookingStatus(stage),
      });
      fetchBookings();
    } catch (error) {
      console.error('Failed to update repair stage:', error);
    }
  };

  const handleRepairCostUpdate = async (ticketId: string, totalCost: number) => {
    updateBookingCost(ticketId, totalCost);
    setLiveBookings(prev =>
      prev.map(booking => booking.ticketId === ticketId ? { ...booking, totalCost } : booking)
    );

    try {
      await api.patch(`/repairs/admin/booking/${ticketId}`, {
        actualCost: totalCost,
      });
      fetchBookings();
    } catch (error) {
      console.error('Failed to update repair cost:', error);
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
    setLiveOrders(prev =>
      prev.map(order => order.id === orderId ? { ...order, status } : order)
    );

    try {
      const backendStatus = status === 'processing' ? 'processing' : status;
      await api.put(`/orders/${orderId}/status`, { status: backendStatus });
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  // Admin only renders data from the backend (Supabase). No local-store fallback.
  const bookingSource = liveBookings;
  const orderSource = liveOrders;

  // Filter repairs based on search (active tab shows only non-collected)
  const filteredBookings = bookingSource.filter(b =>
    b.currentStage < 5 && (
      b.ticketId.includes(searchTerm) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerPhone.includes(searchTerm) ||
      b.deviceType.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Filter orders based on search
  const filteredOrders = orderSource.filter(o =>
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerPhone.includes(searchTerm)
  );

  const displayOrders = filteredOrders;
  const displayBookings = filteredBookings;

  const blockedSlots = getBlockedSlotsForDate(selectedDate);

  // Filter products (non-services) based on search
  const filteredProducts = dbProducts.filter(p =>
    !(p as any).isService && (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Filter services (isService=true), optionally restricted to a device type.
  const filteredServices = dbProducts.filter(p => {
    if (!(p as any).isService) return false;
    const matchesText =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((p as any).serviceType || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesText) return false;
    if (servicesDeviceFilter === 'all') return true;
    const dt = ((p as any).deviceType || '').toLowerCase();
    if (servicesDeviceFilter === 'unassigned') return !dt;
    return dt === servicesDeviceFilter;
  });

  // Stats
  const stats = {
    totalRepairs: bookingSource.length,
    pendingRepairs: bookingSource.filter(b => b.currentStage < 5).length,
    completedRepairs: bookingSource.filter(b => b.currentStage === 5).length,
    totalOrders: orderSource.length,
    processingOrders: orderSource.filter(o => o.status === 'processing').length,
    totalProducts: dbProducts.length,
    lowStockProducts: dbProducts.filter(p => p.stock < 10).length,
  };

  const visibleFilterCategories = filterCategories
    .filter((cat) => cat.visible !== false && cat.slug !== 'laptop-accessories' && cat.slug !== 'components')
    .sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name));
  const mainCategoryOptions = visibleFilterCategories.filter((cat) => !cat.parentSlug);
  const subcategoryOptions = productFormCategory
    ? visibleFilterCategories.filter((cat) => cat.parentSlug === productFormCategory)
    : [];
  // Spec dropdowns: prefer the per-category `specFields` configured by admin
  // (saved in DB), fall back to seeded defaults, then to a plain-text field list.
  const categorySpecFields: SpecField[] = (() => {
    const fromDb = filterCategories.find((c) => c.slug === productFormCategory)?.specFields;
    if (Array.isArray(fromDb) && fromDb.length > 0) return fromDb;
    if (DEFAULT_SPEC_FIELD_OPTIONS[productFormCategory]) {
      return DEFAULT_SPEC_FIELD_OPTIONS[productFormCategory];
    }
    const labels = FILTER_DETAIL_FIELDS[productFormCategory] || ['Type', 'Compatibility'];
    return labels.map((label) => ({ label, options: [] }));
  })();
  const hasAnyDropdownOptions = categorySpecFields.some((f) => f.options.length > 0);
  // Legacy var kept for any downstream reference — derive labels from categorySpecFields.
  const quickSpecFields = categorySpecFields.map((f) => f.label);

  const readSpecs = (product?: Product | null): Record<string, string> => {
    if (!product?.specs) return {};
    if (typeof product.specs === 'string') {
      try { return JSON.parse(product.specs); } catch { return {}; }
    }
    return product.specs as Record<string, string>;
  };
  const categoryForForm = (product: Product) =>
    PRODUCT_CATEGORY_PARENT[product.subcategory || ''] ? (product.subcategory as string) : product.category || '';

  if (!isAdminAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* ── SIDEBAR ───────────────────────────────────────────── */}
      <aside className="w-64 shrink-0 bg-black border-r border-white/15 flex flex-col sticky top-0 h-screen">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-black text-lg">
              R
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm tracking-wide">RAN ADMIN</p>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mt-0.5">Control Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          {[
            { id: 'repairs', label: 'Repairs', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { id: 'quote-requests', label: 'Quote Requests', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
            { id: 'history', label: 'Repair History', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
            { id: 'orders', label: 'Orders', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
            { id: 'products', label: 'Products', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
            { id: 'services', label: 'Services', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
            { id: 'repair-categories', label: 'Repair Categories', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h12" /></svg> },
            { id: 'categories', label: 'Filter Categories', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg> },
            { id: 'users', label: 'Users', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
            { id: 'timeslots', label: 'Time Slots', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { id: 'settings', label: 'Settings', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-left transition-colors border-l-2 ${
                activeTab === tab.id
                  ? 'bg-white text-black border-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5 border-transparent'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/15 p-3">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 bg-white text-black font-bold text-sm hover:bg-white/85 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN ──────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="bg-black border-b border-white/15 px-6 py-4 sticky top-0 z-40 flex items-center justify-between">
          <div>
            <h1 className="text-white text-lg font-bold tracking-wide uppercase">
              {activeTab === 'repairs' && 'Repairs'}
              {activeTab === 'history' && 'Repair History'}
              {activeTab === 'orders' && 'Orders'}
              {activeTab === 'products' && 'Products'}
              {activeTab === 'services' && 'Services'}
              {activeTab === 'quote-requests' && 'Quote Requests'}
              {activeTab === 'repair-categories' && 'Repair Categories'}
              {activeTab === 'categories' && 'Filter Categories'}
              {activeTab === 'users' && 'Users'}
              {activeTab === 'timeslots' && 'Time Slots'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <p className="text-white/40 text-xs mt-0.5">Auto-refreshing every 3s</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 border border-white/15">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping bg-white opacity-75" />
              <span className="relative inline-flex h-2 w-2 bg-white" />
            </span>
            <span className="text-white/70 text-[10px] tracking-[0.2em] uppercase font-semibold">Live</span>
          </div>
        </header>

        <div className="px-6 py-6">
        {/* Stats Cards — square, white/black */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-px mb-6 bg-white/15">
          <div className="bg-black p-4">
            <p className="text-white/50 text-[10px] uppercase tracking-[0.2em] mb-1">Total Repairs</p>
            <p className="text-3xl font-black text-white">{stats.totalRepairs}</p>
          </div>
          <div className="bg-black p-4">
            <p className="text-white/50 text-[10px] uppercase tracking-[0.2em] mb-1">Pending</p>
            <p className="text-3xl font-black text-white">{stats.pendingRepairs}</p>
          </div>
          <div className="bg-black p-4">
            <p className="text-white/50 text-[10px] uppercase tracking-[0.2em] mb-1">Completed</p>
            <p className="text-3xl font-black text-white">{stats.completedRepairs}</p>
          </div>
          <div className="bg-black p-4">
            <p className="text-white/50 text-[10px] uppercase tracking-[0.2em] mb-1">Total Orders</p>
            <p className="text-3xl font-black text-white">{stats.totalOrders}</p>
          </div>
          <div className="bg-black p-4">
            <p className="text-white/50 text-[10px] uppercase tracking-[0.2em] mb-1">Processing</p>
            <p className="text-3xl font-black text-white">{stats.processingOrders}</p>
          </div>
          <div className="bg-black p-4">
            <p className="text-white/50 text-[10px] uppercase tracking-[0.2em] mb-1">Products</p>
            <p className="text-3xl font-black text-white">{stats.totalProducts}</p>
          </div>
          <div className="bg-black p-4">
            <p className="text-white/50 text-[10px] uppercase tracking-[0.2em] mb-1">Low Stock</p>
            <p className="text-3xl font-black text-white">{stats.lowStockProducts}</p>
          </div>
        </div>

        {/* Legacy tabs row removed — sidebar handles navigation now. */}
        <div className="hidden">
          {[
            { id: 'repairs', label: 'Repairs', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { id: 'quote-requests', label: 'Quote Requests', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
            { id: 'history', label: 'Repair History', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
            { id: 'orders', label: 'Orders', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
            { id: 'products', label: 'Products', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
            { id: 'services', label: 'Services', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
            { id: 'repair-categories', label: 'Repair Categories', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h12" /></svg> },
            { id: 'categories', label: 'Filter Categories', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg> },
            { id: 'users', label: 'Users', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
            { id: 'timeslots', label: 'Time Slots', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { id: 'settings', label: 'Settings', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2  font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-dark'
                  : 'bg-dark-100/50 text-white/70 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        {(activeTab === 'repairs' || activeTab === 'history' || activeTab === 'orders' || activeTab === 'products' || activeTab === 'services' || activeTab === 'users') && (
          <div className="mb-6">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-12 pr-4 py-3 bg-dark-100/50 border border-white/10  text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
        )}

        {/* Repairs Tab */}
        {activeTab === 'repairs' && (
          <div className="space-y-4">
            {displayBookings.length === 0 ? (
              <div className="text-center py-12 text-white/50">
                No repairs found
              </div>
            ) : (
              displayBookings.map((repair) => (
                <motion.div
                  key={repair.ticketId}
                  layout
                  className="bg-dark-100/50 border border-white/10  p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-primary font-bold">{repair.serialNo != null ? `REP#${repair.serialNo}` : `#${repair.ticketId.slice(0, 8)}`}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          repair.currentStage === 5 ? 'bg-blue-500/20 text-blue-400' :
                          repair.currentStage === 4 ? 'bg-green-500/20 text-green-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {repairStages[repair.currentStage]}
                        </span>
                      </div>
                      <p className="text-white font-medium">{repair.deviceType} - {repair.deviceModel}</p>
                      <p className="text-white/50 text-sm">{repair.customerName} • {repair.customerPhone}</p>
                      <p className="text-white/40 text-xs mt-1">Booked: {repair.bookedDate} | Est: {repair.estimatedCompletion}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRepair(repair)}
                        className="px-3 py-2 bg-primary/10 text-primary  hover:bg-primary/20 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('Delete this repair?')) return;
                          try {
                            await api.delete(`/repairs/admin/booking/${repair.ticketId}`);
                            setLiveBookings(prev => prev.filter(b => b.ticketId !== repair.ticketId));
                          } catch (err) {
                            console.error('Failed to delete repair', err);
                            alert('Failed to delete repair.');
                          }
                        }}
                        className="px-3 py-2 bg-red-500/10 text-red-400  hover:bg-red-500/20 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {/* Quick Stage Update */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-white/50 text-xs mb-2">Update Stage:</p>
                    <div className="flex flex-wrap gap-2">
                      {repairStages.map((stage, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleRepairStageUpdate(repair.ticketId, idx)}
                          className={`px-3 py-1.5  text-xs transition-colors ${
                            repair.currentStage === idx
                              ? 'bg-primary text-dark font-medium'
                              : 'bg-dark-200/50 text-white/60 hover:text-white'
                          }`}
                        >
                          {stage}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Repair History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold text-lg">Completed Repairs</h3>
              <span className="text-white/50 text-sm">{bookingSource.filter(b => b.currentStage === 5).length} total</span>
            </div>
            {bookingSource.filter(b =>
              b.currentStage === 5 &&
              (b.ticketId.includes(searchTerm) ||
               b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               b.customerPhone.includes(searchTerm) ||
               b.deviceType.toLowerCase().includes(searchTerm.toLowerCase()))
            ).length === 0 ? (
              <div className="text-center py-12 text-white/50">No completed repairs found</div>
            ) : (
              bookingSource.filter(b =>
                b.currentStage === 5 &&
                (b.ticketId.includes(searchTerm) ||
                 b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 b.customerPhone.includes(searchTerm) ||
                 b.deviceType.toLowerCase().includes(searchTerm.toLowerCase()))
              ).map((repair) => (
                <motion.div
                  key={repair.ticketId}
                  layout
                  className="bg-dark-100/50 border border-blue-500/20  p-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-primary font-bold">{repair.serialNo != null ? `REP#${repair.serialNo}` : `#${repair.ticketId.slice(0, 8)}`}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                          Collected
                        </span>
                      </div>
                      <p className="text-white font-medium">{repair.deviceType} - {repair.deviceModel}</p>
                      <p className="text-white/50 text-sm">{repair.customerName} • {repair.customerPhone}</p>
                      <p className="text-white/40 text-xs mt-1">
                        Booked: {repair.bookedDate} | Completed: {repair.estimatedCompletion}
                        {repair.totalCost ? ` | Cost: Rs. ${repair.totalCost.toLocaleString()}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {displayOrders.length === 0 ? (
              <div className="text-center py-12 text-white/50">
                No orders found
              </div>
            ) : (
              displayOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  className="bg-dark-100/50 border border-white/10  p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-blue-400 font-bold">{order.id}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                          order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                          order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-white font-medium">{order.items.length} item(s) • Rs. {order.total.toLocaleString()}</p>
                      <p className="text-white/50 text-sm">{order.customerName} • {order.customerPhone}</p>
                      <p className="text-white/40 text-xs mt-1">Date: {order.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-2 bg-primary/10 text-primary  hover:bg-primary/20 transition-colors text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('Delete this order?')) return;
                          try {
                            await api.delete(`/orders/${order.id}`);
                            setLiveOrders(prev => prev.filter(o => o.id !== order.id));
                          } catch (err) {
                            console.error('Failed to delete order', err);
                            alert('Failed to delete order.');
                          }
                        }}
                        className="px-3 py-2 bg-red-500/10 text-red-400  hover:bg-red-500/20 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {/* Quick Status Update */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-white/50 text-xs mb-2">Update Status:</p>
                    <div className="flex flex-wrap gap-2">
                      {(['processing', 'shipped', 'delivered', 'cancelled'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleOrderStatusChange(order.id, status)}
                          className={`px-3 py-1.5  text-xs transition-colors ${
                            order.status === status
                              ? 'bg-primary text-dark font-medium'
                              : 'bg-dark-200/50 text-white/60 hover:text-white'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            {/* Add Product Button */}
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="text-white text-xl font-bold">{filteredProducts.length} Products</h2>
                <button
                  onClick={fetchProducts}
                  disabled={productsLoading}
                  className="p-2 text-white/40 hover:text-white transition-colors disabled:opacity-50"
                  title="Refresh products"
                >
                  <svg className={`w-5 h-5 ${productsLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setServiceFormMode(false);
                  setProductFormCategory('');
                  setShowProductForm(true);
                }}
                className="px-6 py-3 bg-primary text-dark  font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </button>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-white/50">
                No products found
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    className="bg-dark-100/50 border border-white/10  p-4 hover:border-primary/30 transition-colors"
                  >
                    {/* Product Image */}
                    {product.image && (
                      <div className="aspect-square  overflow-hidden mb-3 bg-dark-200/50">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-white font-semibold line-clamp-2">{product.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                          product.stock > 10 
                            ? 'bg-green-500/20 text-green-400' 
                            : product.stock > 0 
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                      
                      <p className="text-white/50 text-sm line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                          {product.category}
                        </span>
                        {product.brand && (
                          <span className="text-xs px-2 py-1 bg-white/10 text-white/70 rounded-full">
                            {product.brand}
                          </span>
                        )}
                        {(product as any).featured && (
                          <span className="text-xs px-2 py-1 bg-amber-400/20 text-amber-300 rounded-full">
                            ★ Featured
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <p className="text-primary text-xl font-bold">
                          Rs. {product.price.toLocaleString()}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleFeatured(product)}
                            title={(product as any).featured ? 'Unmark as featured (hide from home showcase)' : 'Mark as featured (show in home showcase)'}
                            className={`p-2  transition-colors ${
                              (product as any).featured
                                ? 'bg-amber-400/20 text-amber-400 hover:bg-amber-400/30'
                                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-amber-300'
                            }`}
                          >
                            <svg className="w-5 h-5" fill={(product as any).featured ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.075 10.1c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.673z" />
                            </svg>
                          </button>
                          <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setServiceFormMode(false);
                                setProductFormCategory(categoryForForm(product));
                                setShowProductForm(true);
                              }}
                            className="p-2 bg-blue-500/20 text-blue-400  hover:bg-blue-500/30 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="p-2 bg-red-500/20 text-red-400  hover:bg-red-500/30 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-white text-xl font-bold">{filteredServices.length} Services</h2>
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-medium">
                  ★ {filteredServices.filter(s => (s as any).featured).length} on home page
                </span>
                <button
                  onClick={fetchProducts}
                  disabled={productsLoading}
                  className="p-2 text-white/40 hover:text-white transition-colors disabled:opacity-50"
                  title="Refresh services"
                >
                  <svg className={`w-5 h-5 ${productsLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setServiceFormMode(true);
                  setProductFormCategory('services');
                  setSvcFormDevice('');
                  setSvcFormPriceMode('fixed');
                  setShowProductForm(true);
                }}
                className="px-6 py-3 bg-primary text-dark  font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Service
              </button>
            </div>

            {/* Device-type tabs — let admin manage services per device. */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-3">
              {([
                { id: 'all',         label: 'All' },
                { id: 'desktop',     label: 'Desktop Repair' },
                { id: 'laptop',      label: 'Laptop Repair' },
                { id: 'mobile',      label: 'Mobile Repair' },
                { id: 'unassigned',  label: 'Unassigned' },
              ] as const).map(tab => {
                const count = dbProducts.filter(p => {
                  if (!(p as any).isService) return false;
                  const dt = ((p as any).deviceType || '').toLowerCase();
                  if (tab.id === 'all') return true;
                  if (tab.id === 'unassigned') return !dt;
                  return dt === tab.id;
                }).length;
                const active = servicesDeviceFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setServicesDeviceFilter(tab.id)}
                    className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      active
                        ? 'bg-primary text-dark'
                        : 'border border-white/10 text-white/60 hover:text-white hover:border-white/30'
                    }`}
                  >
                    {tab.label} <span className="ml-1 opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>

            {filteredServices.length === 0 ? (
              <div className="text-center py-12 text-white/50">No services found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map((service) => {
                  const sType = (service as any).serviceType as string | undefined;
                  const typeColor: Record<string, string> = {
                    repair: 'bg-red-500/20 text-red-400',
                    software: 'bg-blue-500/20 text-blue-400',
                    data: 'bg-purple-500/20 text-purple-400',
                    upgrade: 'bg-emerald-500/20 text-emerald-400',
                    maintenance: 'bg-amber-500/20 text-amber-400',
                    cleaning: 'bg-cyan-500/20 text-cyan-400',
                  };
                  return (
                    <motion.div
                      key={service.id}
                      layout
                      className="bg-dark-100/50 border border-white/10  p-4 hover:border-primary/30 transition-colors"
                    >
                      {service.image && (
                        <div className="relative aspect-video  overflow-hidden mb-3 bg-dark-200/50">
                          <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                          {(service as any).featured && (
                            <span className="absolute top-2 left-2 px-2 py-1  bg-amber-500/90 text-black text-[10px] font-bold tracking-wider uppercase shadow-lg">
                              ★ On Home
                            </span>
                          )}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-white font-semibold line-clamp-2">{service.name}</h3>
                          {sType && (
                            <span className={`text-xs px-2 py-1 rounded-full shrink-0 capitalize ${typeColor[sType] || 'bg-white/10 text-white/70'}`}>
                              {sType}
                            </span>
                          )}
                        </div>
                        <p className="text-white/50 text-sm line-clamp-2">{service.description}</p>
                        {((service as any).deviceType) && (
                          <span className="inline-block text-[10px] px-2 py-0.5 bg-white/5 text-white/60 uppercase tracking-wider capitalize">
                            {(service as any).deviceType}
                          </span>
                        )}
                        <div className="flex items-center justify-between pt-2">
                          <p className="text-primary text-xl font-bold">
                            {(service as any).priceMax != null && (service as any).priceMax > service.price
                              ? `Rs. ${service.price.toLocaleString()} – ${(service as any).priceMax.toLocaleString()}`
                              : `Rs. ${service.price.toLocaleString()}`}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleFeatured(service)}
                              title={(service as any).featured
                                ? 'Hide from home page (currently shown in “What We Repair” / “Upgrade Your Device”)'
                                : 'Show on home page'}
                              className={`p-2  transition-colors ${
                                (service as any).featured
                                  ? 'bg-amber-500/25 text-amber-400 hover:bg-amber-500/35'
                                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
                              }`}
                            >
                              <svg className="w-5 h-5" fill={(service as any).featured ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProduct(service);
                                setServiceFormMode(true);
                                setProductFormCategory('services');
                                const dt = ((service as any).deviceType || '') as '' | 'desktop' | 'laptop' | 'mobile';
                                setSvcFormDevice(dt);
                                const pmRaw = (service as any).priceMode as string | undefined;
                                const pm: 'fixed' | 'range' | 'quote' =
                                  pmRaw === 'range' || pmRaw === 'quote' ? pmRaw
                                  : ((service as any).priceMax != null && (service as any).priceMax > service.price ? 'range' : 'fixed');
                                setSvcFormPriceMode(pm);
                                setShowProductForm(true);
                              }}
                              title="Edit service"
                              className="p-2 bg-blue-500/20 text-blue-400  hover:bg-blue-500/30 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(service)}
                              title="Delete service"
                              className="p-2 bg-red-500/20 text-red-400  hover:bg-red-500/30 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Quote Requests Tab */}
        {activeTab === 'quote-requests' && (
          <QuoteRequestsPanel
            bookings={liveBookings}
            onUpdated={(u) =>
              setLiveBookings(prev =>
                prev.map(b => b.ticketId === u.ticketId ? { ...b, ...u } : b)
              )
            }
          />
        )}

        {/* Repair Categories Tab */}
        {activeTab === 'repair-categories' && (
          <RepairCategoryManager />
        )}

        {/* Filter Categories Tab */}
        {activeTab === 'categories' && (
          <FilterCategoriesAdmin />
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-white text-xl font-bold mb-4">Total Users: {dbUsers.length}</h2>
            {dbUsers.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
              <div className="text-center py-12 text-white/50">
                No users found
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dbUsers.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                  <motion.div
                    key={user.id}
                    layout
                    className="bg-dark-100/50 border border-white/10  p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg shrink-0">
                         {user.name?.charAt(0).toUpperCase()}
                       </div>
                       <div>
                         <h3 className="text-white font-semibold">{user.name}</h3>
                         <p className="text-white/60 text-sm">{user.email}</p>
                       </div>
                    </div>
                    <div className="pt-3 mt-3 border-t border-white/10 flex justify-between items-center text-sm">
                      <span className="text-white/50">Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                      <span className="text-primary">{user._count?.orders || 0} Orders</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Time Slots Tab */}
        {activeTab === 'timeslots' && (
          <div className="bg-dark-100/50 border border-white/10  p-6">
            <div className="mb-6">
              <label className="block text-white/70 text-sm mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="px-4 py-3 bg-dark-200/50 border border-white/10  text-white focus:outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Time Slots for {selectedDate}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {timeSlots.map((slot) => {
                  const isBlocked = blockedSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      onClick={() => {
                        if (isBlocked) {
                          unblockTimeSlot(selectedDate, slot);
                        } else {
                          blockTimeSlot(selectedDate, slot);
                        }
                      }}
                      className={`p-4  border transition-all ${
                        isBlocked
                          ? 'bg-red-500/20 border-red-500/50 text-red-400'
                          : 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                      }`}
                    >
                      <p className="font-medium">{slot}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {isBlocked ? '🚫 Blocked' : '✅ Available'}
                      </p>
                    </button>
                  );
                })}
              </div>
              <p className="text-white/40 text-sm mt-4">
                Click a slot to toggle availability. Blocked slots won't be available for booking.
              </p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-dark-100/50 border border-white/10  p-6 space-y-6">
            <div>
              <h3 className="text-white font-semibold mb-4">Data Management</h3>
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    if (!confirm('Clear all repairs? This cannot be undone.')) return;
                    await Promise.all(liveBookings.map(b => api.delete(`/repairs/admin/booking/${b.ticketId}`).catch(() => {})));
                    fetchBookings();
                  }}
                  className="w-full sm:w-auto px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/30  hover:bg-red-500/20 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All Repairs
                </button>
                <button
                  onClick={async () => {
                    if (!confirm('Clear all orders? This cannot be undone.')) return;
                    await Promise.all(liveOrders.map(o => api.delete(`/orders/${o.id}`).catch(() => {})));
                    fetchOrders();
                  }}
                  className="w-full sm:w-auto px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/30  hover:bg-red-500/20 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All Orders
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Admin Info</h3>
              <div className="bg-dark-200/50  p-4">
                <p className="text-white/70 text-sm">Admin password can be changed in the code.</p>
                <p className="text-white/50 text-xs mt-2">Current file: src/store/adminStore.ts</p>
              </div>
            </div>
          </div>
        )}
      </div>
      </main>

      {/* Repair Edit Modal */}
      <AnimatePresence>
        {selectedRepair && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRepair(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-100 border border-white/10  p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Edit Repair {selectedRepair.serialNo != null ? `REP#${selectedRepair.serialNo}` : `#${selectedRepair.ticketId.slice(0, 8)}`}</h2>
                <button
                  onClick={() => setSelectedRepair(null)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Stage</label>
                  <select
                    value={selectedRepair.currentStage}
                    onChange={(e) => {
                      const nextStage = Number(e.target.value);
                      handleRepairStageUpdate(selectedRepair.ticketId, nextStage);
                      setSelectedRepair({ ...selectedRepair, currentStage: nextStage });
                    }}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/10  text-white focus:outline-none focus:border-primary/50"
                  >
                    {repairStages.map((stage, idx) => (
                      <option key={idx} value={idx}>{stage}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Technician</label>
                  <select
                    value={selectedRepair.technicianName}
                    onChange={(e) => {
                      updateBookingTechnician(selectedRepair.ticketId, e.target.value);
                      setSelectedRepair({ ...selectedRepair, technicianName: e.target.value });
                    }}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/10  text-white focus:outline-none focus:border-primary/50"
                  >
                    {technicians.map((tech) => (
                      <option key={tech} value={tech}>{tech}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Estimated Completion</label>
                  <input
                    type="date"
                    value={selectedRepair.estimatedCompletion}
                    onChange={(e) => {
                      updateBookingEstCompletion(selectedRepair.ticketId, e.target.value);
                      setSelectedRepair({ ...selectedRepair, estimatedCompletion: e.target.value });
                    }}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/10  text-white focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Total Cost (Rs.)</label>
                  <input
                    type="number"
                    value={selectedRepair.totalCost}
                    onChange={(e) => {
                      const cost = Number(e.target.value);
                      handleRepairCostUpdate(selectedRepair.ticketId, cost);
                      setSelectedRepair({ ...selectedRepair, totalCost: cost });
                    }}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/10  text-white focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-white/70 text-sm mb-2">Send Quote to Customer</h4>
                  <p className="text-white/40 text-xs mb-3">
                    Sends the customer a web notification + email with this final repair price.
                  </p>
                  <div className="flex flex-col gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Final price (Rs.)"
                      value={(selectedRepair as any)._quoteDraft ?? selectedRepair.totalCost ?? ''}
                      onChange={(e) => setSelectedRepair({ ...selectedRepair, _quoteDraft: e.target.value } as any)}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50"
                    />
                    <textarea
                      placeholder="Optional note for the customer (e.g. parts ordered, ETA)..."
                      value={(selectedRepair as any)._quoteMsg ?? ''}
                      onChange={(e) => setSelectedRepair({ ...selectedRepair, _quoteMsg: e.target.value } as any)}
                      rows={2}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 resize-none"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const raw = (selectedRepair as any)._quoteDraft ?? selectedRepair.totalCost;
                        const price = Number(raw);
                        if (!Number.isFinite(price) || price < 0) {
                          alert('Enter a valid quote price.');
                          return;
                        }
                        try {
                          await api.post(`/repairs/admin/booking/${selectedRepair.ticketId}/quote`, {
                            quotedPrice: price,
                            quoteMessage: (selectedRepair as any)._quoteMsg || undefined,
                          });
                          handleRepairCostUpdate(selectedRepair.ticketId, price);
                          setSelectedRepair({ ...selectedRepair, totalCost: price, _quoteSent: true } as any);
                          alert('Quote sent to customer.');
                        } catch (err: any) {
                          alert(err?.response?.data?.error || 'Failed to send quote.');
                        }
                      }}
                      className="px-4 py-3 bg-primary text-dark font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Send Quote
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-white/70 text-sm mb-2">Customer Info</h4>
                  <p className="text-white">{selectedRepair.customerName}</p>
                  <p className="text-white/60 text-sm">{selectedRepair.customerEmail}</p>
                  <p className="text-white/60 text-sm">{selectedRepair.customerPhone}</p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-white/70 text-sm mb-2">Device Info</h4>
                  <p className="text-white">{selectedRepair.deviceType} - {selectedRepair.deviceModel}</p>
                  <p className="text-white/60 text-sm mt-1">{selectedRepair.issueDescription}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedRepair.services.map((service, idx) => (
                      <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSelectedRepair(null)}
                  className="flex-1 py-3 bg-primary text-dark font-semibold  hover:bg-primary/90 transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order View Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-100 border border-white/10  p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Order {selectedOrder.id}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Status</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      const status = e.target.value as Order['status'];
                      handleOrderStatusChange(selectedOrder.id, status);
                      setSelectedOrder({ ...selectedOrder, status });
                    }}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/10  text-white focus:outline-none focus:border-primary/50"
                  >
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-white/70 text-sm mb-2">Customer Info</h4>
                  <p className="text-white">{selectedOrder.customerName}</p>
                  <p className="text-white/60 text-sm">{selectedOrder.customerEmail}</p>
                  <p className="text-white/60 text-sm">{selectedOrder.customerPhone}</p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-white/70 text-sm mb-2">Shipping Address</h4>
                  <p className="text-white/80 text-sm">{selectedOrder.shippingAddress}</p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-white/70 text-sm mb-2">Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-dark-200/30 ">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover  bg-dark-200" />
                        <div className="flex-1">
                          <p className="text-white text-sm">{item.name}</p>
                          <p className="text-white/50 text-xs">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-primary font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-primary text-xl font-bold">Rs. {selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-3 bg-primary text-dark font-semibold  hover:bg-primary/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Form Modal */}
      <AnimatePresence>
        {showProductForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setShowProductForm(false); setServiceFormMode(false); setProductFormCategory(''); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black border-2 border-white/20 p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-white/15">
                <div>
                  <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-medium mb-1">
                    {selectedProduct ? 'Editing' : 'New entry'}
                  </p>
                  <h2 className="text-white text-2xl font-black uppercase tracking-wide">
                    {selectedProduct
                      ? ((selectedProduct as any).isService || serviceFormMode ? 'Edit Service' : 'Edit Product')
                      : (serviceFormMode ? 'Add New Service' : 'Add New Product')}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowProductForm(false); setServiceFormMode(false); setProductFormCategory(''); setSelectedProduct(null); }}
                  className="w-8 h-8 border border-white/15 text-white/60 hover:text-white hover:border-white/40 flex items-center justify-center"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  
                  let parsedSpecs = selectedProduct?.specs || {};
                  try {
                    const specsVal = formData.get('specs') as string;
                    if (specsVal) parsedSpecs = JSON.parse(specsVal);
                  } catch (err) {}

                  const quickSpecs: Record<string, string> = {};
                  formData.forEach((value, key) => {
                    if (!key.startsWith('spec:')) return;
                    const specKey = key.slice(5);
                    const specValue = String(value).trim();
                    if (specKey && specValue) quickSpecs[specKey] = specValue;
                  });
                  parsedSpecs = { ...(parsedSpecs || {}), ...quickSpecs };

                  let parsedFeatures = selectedProduct?.features || [];
                  try {
                    const featuresVal = formData.get('features') as string;
                    if (featuresVal) {
                      if (featuresVal.trim().startsWith('[')) {
                        parsedFeatures = JSON.parse(featuresVal);
                      } else {
                        parsedFeatures = featuresVal.split('\n').map(f => f.trim()).filter(Boolean);
                      }
                    }
                  } catch (err) {}

                  const isServiceForm = serviceFormMode || (selectedProduct as any)?.isService;
                  const serviceType = formData.get('serviceType') as string || undefined;
                  const compatibleIdsRaw = formData.get('compatibleProductIds') as string;
                  const compatibleIds = compatibleIdsRaw ? compatibleIdsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
                  const selectedCategorySlug = formData.get('category') as string;
                  const parentCategory = PRODUCT_CATEGORY_PARENT[selectedCategorySlug];

                  const productData: any = {
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    price: Number(formData.get('price')),
                    image: formData.get('image') as string,
                    category: isServiceForm ? 'services' : (parentCategory || selectedCategorySlug),
                    isService: !!isServiceForm,
                    serviceType: isServiceForm ? serviceType : undefined,
                    featured: formData.get('featured') === 'on',
                  };

                  if (isServiceForm) {
                    productData.subcategory = serviceType;
                    // Stock kept as a sane default for services so booking flows work.
                    productData.stock = 999;
                    productData.deviceType = (formData.get('deviceType') as string) || null;
                    const priceMode = (formData.get('priceMode') as string) || 'fixed';
                    productData.priceMode = ['fixed', 'range', 'quote'].includes(priceMode) ? priceMode : 'fixed';
                    if (priceMode === 'range') {
                      const priceMaxRaw = formData.get('priceMax') as string;
                      productData.priceMax = priceMaxRaw && priceMaxRaw.trim() !== ''
                        ? Number(priceMaxRaw) : null;
                    } else {
                      productData.priceMax = null;
                    }
                    if (priceMode === 'quote') productData.price = 0;
                    // For services we use the `compatibility` field to store JSON of compatible product IDs
                    // shown in the part picker on the repair page.
                    productData.compatibility = JSON.stringify(compatibleIds);
                  } else {
                    productData.subcategory = parentCategory
                      ? selectedCategorySlug
                      : (formData.get('subcategory') as string || undefined);
                    productData.stock = Number(formData.get('stock'));
                    productData.brand = formData.get('brand') as string || undefined;
                    productData.sku = formData.get('sku') as string || undefined;
                    productData.condition = (formData.get('condition') as string) || undefined;
                    productData.images = (formData.get('images') as string)?.split(',').map(s=>s.trim()).filter(Boolean) || [formData.get('image') as string];
                    productData.specs = parsedSpecs;
                    productData.features = parsedFeatures;
                    // For accessories like batteries: admin-picked compatible laptop product IDs.
                    productData.compatibility = JSON.stringify(compatibleIds);
                  }

                  handleSaveProduct(productData, !!selectedProduct, selectedProduct?.id?.toString());
                }}
                className="space-y-4"
              >
                {/* Progressive flow: pick a category first; the rest of the
                    form only appears once a category has been chosen (or when
                    editing an existing item, or for services which have their
                    own type selector). */}
                {!serviceFormMode && !selectedProduct && (
                  <div className="bg-black border border-white/15 p-5 space-y-3">
                    <label className="block text-white/50 text-[10px] tracking-[0.3em] uppercase font-medium">
                      Step 1 · Pick a product category
                    </label>
                    <select
                      value={productFormCategory}
                      onChange={(e) => setProductFormCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:outline-none focus:border-white/60"
                    >
                      <option value="">Select Category</option>
                      {mainCategoryOptions.map((cat) => (
                        <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                    {!productFormCategory && (
                      <p className="text-white/40 text-xs">
                        Choose what kind of product you're adding. The rest of
                        the form (name, price, specs…) appears once you pick one.
                      </p>
                    )}
                  </div>
                )}

                {/* Only render the heavy form once we know the category /
                    are editing / are adding a service. */}
                {(productFormCategory || serviceFormMode || selectedProduct) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-white/70 text-sm mb-2">{(serviceFormMode || (selectedProduct as any)?.isService) ? 'Service Name *' : 'Product Name *'}</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={selectedProduct?.name}
                      required
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/10  text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50"
                      placeholder={(serviceFormMode || (selectedProduct as any)?.isService) ? 'e.g., Battery Replacement' : 'e.g., iPhone 15 Pro Max'}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-white/70 text-sm mb-2">Description *</label>
                    <textarea
                      name="description"
                      defaultValue={selectedProduct?.description}
                      required
                      rows={3}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/10  text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 resize-none"
                      placeholder={(serviceFormMode || (selectedProduct as any)?.isService) ? 'Service description...' : 'Product description...'}
                    />
                  </div>

                  {/* Services use a redesigned multi-step block below; products keep the
                      original single Price field here. */}
                  {!(serviceFormMode || (selectedProduct as any)?.isService) && (
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Price (Rs.) *</label>
                      <input
                        type="number"
                        name="price"
                        defaultValue={selectedProduct?.price}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-dark-200/50 border border-white/10  text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50"
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  {(serviceFormMode || (selectedProduct as any)?.isService) && (
                    <div className="md:col-span-2 space-y-5 border border-white/10 p-5 bg-white/[0.02]">
                      {/* Step A: Device */}
                      <div>
                        <label className="block text-white/50 text-[10px] tracking-[0.3em] uppercase font-medium mb-2">Step 1 · Device</label>
                        <select
                          name="deviceType"
                          value={svcFormDevice}
                          onChange={(e) => setSvcFormDevice(e.target.value as any)}
                          required
                          className="w-full px-4 py-3 bg-black border border-white/15 text-white focus:outline-none focus:border-white/60"
                        >
                          <option value="">Which device is this for?</option>
                          <option value="desktop">Desktop</option>
                          <option value="laptop">Laptop</option>
                          <option value="mobile">Mobile</option>
                        </select>
                      </div>

                      {/* Step B: Category (from RepairCategory) */}
                      {svcFormDevice && (
                        <div>
                          <label className="block text-white/50 text-[10px] tracking-[0.3em] uppercase font-medium mb-2">Step 2 · Category</label>
                          {svcFormCategories.length === 0 ? (
                            <div className="text-white/50 text-xs border border-white/10 p-3">
                              No categories yet for <span className="capitalize">{svcFormDevice}</span>. Add some under the
                              "Repair Categories" tab — then come back here.
                            </div>
                          ) : (
                            <select
                              name="serviceType"
                              defaultValue={(selectedProduct as any)?.serviceType || ''}
                              required
                              className="w-full px-4 py-3 bg-black border border-white/15 text-white focus:outline-none focus:border-white/60"
                            >
                              <option value="">Select a category</option>
                              {svcFormCategories.map(c => (
                                <option key={c.id} value={c.slug}>{c.name}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}

                      {/* Step C: Price mode */}
                      <div>
                        <label className="block text-white/50 text-[10px] tracking-[0.3em] uppercase font-medium mb-2">Step 3 · Pricing</label>
                        <div className="grid sm:grid-cols-3 gap-2">
                          {([
                            { id: 'fixed', label: 'Fixed price',   blurb: 'Show one final price (e.g. Windows 11 upgrade Rs. 4500).' },
                            { id: 'range', label: 'Min / Max',     blurb: 'Show a range (e.g. Battery Rs. 10k–30k). You confirm the final price after inspection.' },
                            { id: 'quote', label: 'Show cost only', blurb: 'Hide price until after inspection. The customer can\'t book until you reply with a price.' },
                          ] as const).map(opt => (
                            <button
                              type="button"
                              key={opt.id}
                              onClick={() => setSvcFormPriceMode(opt.id)}
                              className={`text-left p-3 border transition-colors ${
                                svcFormPriceMode === opt.id
                                  ? 'border-primary bg-primary/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <div className="text-white text-sm font-semibold">{opt.label}</div>
                              <div className="text-white/40 text-[11px] leading-snug mt-1">{opt.blurb}</div>
                            </button>
                          ))}
                        </div>
                        <input type="hidden" name="priceMode" value={svcFormPriceMode} />
                      </div>

                      {/* Step D: Price inputs */}
                      <div>
                        <label className="block text-white/50 text-[10px] tracking-[0.3em] uppercase font-medium mb-2">
                          Step 4 · Price{svcFormPriceMode === 'quote' ? ' (hidden until quoted)' : ''}
                        </label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-white/60 text-xs mb-1">
                              {svcFormPriceMode === 'range' ? 'Min price (Rs.)' : 'Price (Rs.)'}
                              {svcFormPriceMode !== 'quote' && ' *'}
                            </label>
                            <input
                              type="number"
                              name="price"
                              defaultValue={selectedProduct?.price ?? (svcFormPriceMode === 'quote' ? 0 : '')}
                              required={svcFormPriceMode !== 'quote'}
                              min="0"
                              step="0.01"
                              className="w-full px-4 py-2.5 bg-black border border-white/15 text-white focus:outline-none focus:border-white/60"
                              placeholder="0.00"
                            />
                          </div>
                          {svcFormPriceMode === 'range' && (
                            <div>
                              <label className="block text-white/60 text-xs mb-1">Max price (Rs.) *</label>
                              <input
                                type="number"
                                name="priceMax"
                                defaultValue={(selectedProduct as any)?.priceMax ?? ''}
                                required
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2.5 bg-black border border-white/15 text-white focus:outline-none focus:border-white/60"
                                placeholder="0.00"
                              />
                            </div>
                          )}
                        </div>
                        {svcFormPriceMode === 'quote' && (
                          <p className="text-white/40 text-[11px] mt-2">
                            Customer sees "Quote on inspection" — they submit a request, you reply with the price, then they confirm the booking.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {!(serviceFormMode || (selectedProduct as any)?.isService) && (
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Stock *</label>
                      <input
                        type="number"
                        name="stock"
                        defaultValue={selectedProduct?.stock}
                        required
                        min="0"
                        className="w-full px-4 py-3 bg-dark-200/50 border border-white/10  text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50"
                        placeholder="0"
                      />
                    </div>
                  )}

                  {(serviceFormMode || (selectedProduct as any)?.isService) ? (
                    <>
                      <div className="md:col-span-2">
                        <label className="block text-white/70 text-sm mb-2">Compatible Products (optional)</label>
                        <p className="text-xs text-white/40 mb-2">
                          For upgrade-type services (RAM, SSD, GPU…), pick which products from your shop the customer
                          can choose from when they select this service. Leave empty for repairs that don't need a part picker.
                        </p>
                        <CompatibleProductsPicker
                          allProducts={dbProducts.filter(p => !(p as any).isService)}
                          initialIds={(() => {
                            const c = (selectedProduct as any)?.compatibility;
                            if (!c) return [] as string[];
                            try { const arr = typeof c === 'string' ? JSON.parse(c) : c; return Array.isArray(arr) ? arr.map(String) : []; }
                            catch { return []; }
                          })()}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Category *</label>
                        <select
                          name="category"
                          value={productFormCategory || selectedProduct?.category || ''}
                          onChange={(e) => setProductFormCategory(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-dark-200/50 border border-white/10  text-white focus:outline-none focus:border-primary/50"
                        >
                          <option value="">Select Category</option>
                          {mainCategoryOptions.map((cat) => (
                            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-white/70 text-sm mb-2">Subcategory</label>
                        <select
                          name="subcategory"
                          defaultValue={selectedProduct?.subcategory}
                          className="w-full px-4 py-3 bg-dark-200/50 border border-white/10  text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50"
                        >
                          <option value="">No subcategory</option>
                          {subcategoryOptions.map((cat) => (
                            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                          ))}
                        </select>
                        <p className="text-xs text-white/40 mt-1">Add more options in the Categories tab.</p>
                      </div>
                    </>
                  )}

                  {!(serviceFormMode || (selectedProduct as any)?.isService) && (
                    <>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Brand</label>
                        <input
                          type="text"
                          name="brand"
                          defaultValue={selectedProduct?.brand}
                          className="w-full px-4 py-3 bg-dark-200/50 border border-white/10  text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50"
                          placeholder="e.g., Apple, Samsung"
                        />
                      </div>

                      <div>
                        <label className="block text-white/70 text-sm mb-2">SKU</label>
                        <input
                          type="text"
                          name="sku"
                          defaultValue={selectedProduct?.sku}
                          className="w-full px-4 py-3 bg-dark-200/50 border border-white/10  text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50"
                          placeholder="e.g., IPH-15-PM-256"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-white/70 text-sm mb-2">Condition *</label>
                        <select
                          name="condition"
                          defaultValue={(selectedProduct as any)?.condition || 'new'}
                          required
                          className="w-full px-4 py-3 bg-dark-200/50 border border-white/10  text-white focus:outline-none focus:border-primary/50"
                        >
                          <option value="new">Brand New</option>
                          <option value="used">Used</option>
                          <option value="refurbished">Refurbished</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className={(serviceFormMode || (selectedProduct as any)?.isService) ? 'md:col-span-2' : 'md:col-span-1'}>
                    <label className="block text-white/70 text-sm mb-2">Main Image *</label>
                    <input type="hidden" name="image" value={mainImageUrl} />
                    <div className="flex items-center gap-3">
                      {mainImageUrl ? (
                        <div className="relative">
                          <img src={mainImageUrl} alt="main" className="w-20 h-20 object-cover  border border-white/10" />
                          <button
                            type="button"
                            onClick={() => setMainImageUrl('')}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                            aria-label="Remove main image"
                          >×</button>
                        </div>
                      ) : (
                        <div className="w-20 h-20  border border-dashed border-white/20 flex items-center justify-center text-white/30 text-xs">No image</div>
                      )}
                      <label className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary  cursor-pointer text-sm">
                        {uploadingMain ? 'Uploading…' : (mainImageUrl ? 'Replace' : 'Upload Image')}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingMain}
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMainImage(f); e.currentTarget.value = ''; }}
                        />
                      </label>
                    </div>
                    {!mainImageUrl && <p className="text-xs text-red-400/80 mt-1">Required — upload an image to continue.</p>}
                  </div>

                  {!(serviceFormMode || (selectedProduct as any)?.isService) && (
                    <>
                      <div className="md:col-span-1">
                        <label className="block text-white/70 text-sm mb-2">Other Images</label>
                        <input type="hidden" name="images" value={galleryUrls.join(',')} />
                        <div className="flex flex-wrap items-center gap-2">
                          {galleryUrls.map((url, idx) => (
                            <div key={idx} className="relative">
                              <img src={url} alt={`extra-${idx}`} className="w-16 h-16 object-cover  border border-white/10" />
                              <button
                                type="button"
                                onClick={() => setGalleryUrls(prev => prev.filter((_, i) => i !== idx))}
                                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                                aria-label="Remove image"
                              >×</button>
                            </div>
                          ))}
                          <label className="w-16 h-16  border border-dashed border-white/20 flex items-center justify-center text-white/40 text-xs cursor-pointer hover:border-primary/60 hover:text-primary">
                            {uploadingGallery ? '…' : '+ Add'}
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              disabled={uploadingGallery}
                              onChange={(e) => { if (e.target.files) uploadGalleryImages(e.target.files); e.currentTarget.value = ''; }}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-white/70 text-sm mb-2">Specifications</label>
                        <p className="text-xs text-white/40 mb-3">
                          Pick from the dropdowns configured for this category. Edit the options
                          in <span className="text-primary/80">Filter Categories → Specification Dropdowns</span>.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {categorySpecFields.map((field) => {
                            const currentValue = readSpecs(selectedProduct)[field.label] || '';
                            const hasOptions = field.options.length > 0;
                            const valueInList = hasOptions && field.options.includes(currentValue);

                            if (hasOptions) {
                              return (
                                <div key={field.label}>
                                  <label className="block text-white/50 text-xs mb-1.5">{field.label}</label>
                                  <select
                                    name={`spec:${field.label}`}
                                    defaultValue={valueInList ? currentValue : ''}
                                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/10  text-white focus:outline-none focus:border-primary/50"
                                  >
                                    <option value="">Select {field.label}…</option>
                                    {field.options.map((opt) => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                  {currentValue && !valueInList && (
                                    <p className="text-amber-400/70 text-[10px] mt-1">
                                      Current value "{currentValue}" not in dropdown — add it in Filter Categories.
                                    </p>
                                  )}
                                </div>
                              );
                            }

                            // No options configured for this field — fall back to text input.
                            return (
                              <div key={field.label}>
                                <label className="block text-white/50 text-xs mb-1.5">{field.label}</label>
                                <input
                                  type="text"
                                  name={`spec:${field.label}`}
                                  defaultValue={currentValue}
                                  className="w-full px-4 py-3 bg-dark-200/50 border border-white/10  text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50"
                                  placeholder={`Enter ${field.label}`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* JSON specs editor — only shown for categories without dropdowns
                          so advanced/edge-case categories can still set raw specs. */}
                      {!hasAnyDropdownOptions && (
                        <div className="md:col-span-2">
                          <label className="block text-white/70 text-sm mb-2">Specifications (JSON format)</label>
                          <textarea
                            name="specs"
                            defaultValue={selectedProduct?.specs ? JSON.stringify(selectedProduct.specs, null, 2) : ''}
                            rows={4}
                            className="w-full px-4 py-3 bg-dark-200/50 border border-white/10  text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 font-mono text-xs resize-y"
                            placeholder='{"Processor": "Intel Core i7", "RAM": "16GB DDR5"}'
                          />
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className="block text-white/70 text-sm mb-2">Features (Line separated or JSON Array)</label>
                        <textarea
                          name="features"
                          defaultValue={selectedProduct?.features ? (typeof selectedProduct.features === 'string' ? JSON.parse(selectedProduct.features).join('\n') : selectedProduct.features.join('\n')) : ''}
                          rows={4}
                          className="w-full px-4 py-3 bg-dark-200/50 border border-white/10  text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 text-sm resize-y"
                          placeholder='Ultra-fast performance&#10;Stunning 4K display'
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-white/70 text-sm mb-2">Compatible Devices (optional)</label>
                        <p className="text-xs text-white/40 mb-2">
                          For accessories like batteries — pick the laptop models this part fits. The repair page filters batteries by the brand of these laptops.
                        </p>
                        <CompatibleProductsPicker
                          allProducts={dbProducts.filter(p => !(p as any).isService && p.category === 'laptops')}
                          initialIds={(() => {
                            const c = (selectedProduct as any)?.compatibility;
                            if (!c) return [] as string[];
                            try { const arr = typeof c === 'string' ? JSON.parse(c) : c; return Array.isArray(arr) ? arr.map(String) : []; }
                            catch { return []; }
                          })()}
                        />
                      </div>
                    </>
                  )}

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-white cursor-pointer">
                      <input
                        type="checkbox"
                        name="featured"
                        defaultChecked={selectedProduct?.featured}
                        className="w-5 h-5  border-white/10 bg-dark-200/50 text-primary focus:ring-primary focus:ring-offset-0"
                      />
                      <span>Mark as Featured Product</span>
                    </label>
                  </div>
                </div>
                )}

                {/* Submit row — visible whenever a category has been chosen,
                    we're editing, or we're in service-add mode. */}
                {(productFormCategory || serviceFormMode || selectedProduct) && (
                <div className="flex gap-3 pt-4 border-t border-white/15">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductForm(false);
                      setSelectedProduct(null);
                      setServiceFormMode(false);
                      setProductFormCategory('');
                    }}
                    className="flex-1 py-3 bg-black border border-white/20 text-white font-bold uppercase tracking-wide text-xs hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-white text-black font-black uppercase tracking-wide text-xs hover:bg-white/85 transition-colors"
                  >
                    {selectedProduct ? 'Update Product' : (serviceFormMode ? 'Add Service' : 'Add Product')}
                  </button>
                </div>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/*  CompatibleProductsPicker — multi-select with hidden input  */
/* ─────────────────────────────────────────────────────────── */
const CompatibleProductsPicker: React.FC<{ allProducts: any[]; initialIds: string[] }> = ({ allProducts, initialIds }) => {
  const [selected, setSelected] = useState<string[]>(initialIds);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterSub, setFilterSub] = useState('');
  const categories = Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)));
  const subcategories = Array.from(new Set(
    allProducts
      .filter(p => !filterCat || p.category === filterCat)
      .map(p => p.subcategory)
      .filter(Boolean)
  ));

  const visible = allProducts.filter(p => {
    if (filterCat && p.category !== filterCat) return false;
    if (filterSub && p.subcategory !== filterSub) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name?.toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q) || (p.subcategory || '').toLowerCase().includes(q);
  }).slice(0, 80);

  const toggle = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="border border-white/10  p-3 bg-dark-200/30">
      <input type="hidden" name="compatibleProductIds" value={selected.join(',')} />
      <div className="flex flex-wrap gap-2 mb-3">
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="flex-1 min-w-[160px] px-3 py-2 bg-dark-200/50 border border-white/10  text-white text-sm focus:outline-none focus:border-primary/50"
        />
        <select
          value={filterCat} onChange={(e) => { setFilterCat(e.target.value); setFilterSub(''); }}
          className="px-3 py-2 bg-dark-200/50 border border-white/10  text-white text-sm focus:outline-none focus:border-primary/50"
        >
          <option value="">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterSub} onChange={(e) => setFilterSub(e.target.value)}
          className="px-3 py-2 bg-dark-200/50 border border-white/10  text-white text-sm focus:outline-none focus:border-primary/50"
        >
          <option value="">All subcategories</option>
          {subcategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="button" onClick={() => setSelected([])}
          className="px-3 py-2 text-xs text-white/60 hover:text-white border border-white/10 ">
          Clear
        </button>
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-primary mb-2">{selected.length} selected</p>
      )}
      <div className="max-h-64 overflow-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {visible.length === 0 ? (
          <p className="text-xs text-white/40 col-span-2 py-4 text-center">No matching products.</p>
        ) : visible.map(p => {
          const isSel = selected.includes(p.id);
          return (
            <button type="button" key={p.id} onClick={() => toggle(p.id)}
              className={`flex items-center gap-2 p-2  text-left text-xs transition-colors ${
                isSel ? 'bg-primary/20 border border-primary/40' : 'border border-white/5 hover:border-white/20'
              }`}
            >
              <div className={`w-4 h-4  border flex items-center justify-center flex-shrink-0 ${isSel ? 'bg-primary border-primary' : 'border-white/30'}`}>
                {isSel && <svg className="w-3 h-3 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white truncate">{p.name}</p>
                <p className="text-white/40 truncate">{p.brand || ''} {p.category ? `· ${p.category}` : ''}</p>
              </div>
              <span className="text-white/40 font-mono">Rs. {Number(p.price || 0).toLocaleString('en-LK')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/*  FilterCategoriesAdmin — CRUD for sidebar filter categories */
/* ─────────────────────────────────────────────────────────── */
interface FilterCat {
  id: string;
  slug: string;
  name: string;
  parentSlug?: string | null;
  order: number;
  visible: boolean;
  specFields?: SpecField[];
}

const FilterCategoriesAdmin: React.FC = () => {
  const [cats, setCats] = useState<FilterCat[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentSlug, setParentSlug] = useState('');
  const [order, setOrder] = useState<number>(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editOrder, setEditOrder] = useState<number>(0);
  const [specsOpenId, setSpecsOpenId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get('/filter-categories?includeHidden=true');
      setCats(res.data?.categories || []);
    } catch { setError('Failed to load categories.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const seedDefaults = async () => {
    if (!confirm(`This will add ${DEFAULT_FILTER_CATEGORIES.length} default categories to the database. Continue?`)) return;
    setSeeding(true); setError(null);
    let added = 0;
    for (const cat of DEFAULT_FILTER_CATEGORIES) {
      try {
        await api.post('/filter-categories', {
          name: cat.name, slug: cat.slug,
          parentSlug: cat.parentSlug || undefined,
          order: cat.order, visible: cat.visible,
        });
        added++;
      } catch {
        // skip duplicates silently
      }
    }
    await load();
    setSeeding(false);
    showSuccess(`Added ${added} categories to the database.`);
  };

  const create = async () => {
    setError(null);
    if (!name.trim()) { setError('Name is required.'); return; }
    try {
      await api.post('/filter-categories', { name, slug: slug || undefined, parentSlug: parentSlug || undefined, order });
      setName(''); setSlug(''); setParentSlug(''); setOrder(0);
      await load();
      showSuccess('Category added.');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create.');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try { await api.delete(`/filter-categories/${id}`); await load(); showSuccess('Deleted.'); }
    catch { setError('Failed to delete.'); }
  };

  const toggleVisible = async (cat: FilterCat) => {
    try { await api.patch(`/filter-categories/${cat.id}`, { visible: !cat.visible }); await load(); }
    catch { setError('Failed to update.'); }
  };

  const startEdit = (cat: FilterCat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditOrder(cat.order);
  };

  const saveEdit = async (cat: FilterCat) => {
    try {
      await api.patch(`/filter-categories/${cat.id}`, { name: editName, order: editOrder });
      setEditingId(null);
      await load();
      showSuccess('Updated.');
    } catch { setError('Failed to update.'); }
  };

  const saveSpecs = async (cat: FilterCat, specFields: SpecField[]) => {
    try {
      await api.patch(`/filter-categories/${cat.id}`, { specFields });
      await load();
      showSuccess(`Spec dropdowns saved for ${cat.name}.`);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save spec fields.');
    }
  };

  // Group into parents and children for display
  const parents = cats.filter(c => !c.parentSlug);
  const childrenOf = (slug: string) => cats.filter(c => c.parentSlug === slug);

  return (
    <div className="space-y-6">
      {/* Seed defaults banner */}
      {!loading && cats.length === 0 && (
        <div className="bg-primary/10 border border-primary/30  p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-primary font-semibold text-sm">No filter categories in database yet</p>
            <p className="text-white/60 text-xs mt-1">
              Seed {DEFAULT_FILTER_CATEGORIES.length} default categories (Laptops, RAM, SSD, Smartphones…) to get started instantly.
            </p>
          </div>
          <button
            onClick={seedDefaults}
            disabled={seeding}
            className="px-5 py-2.5 bg-primary text-dark font-bold  text-sm hover:bg-primary/90 disabled:opacity-50 whitespace-nowrap"
          >
            {seeding ? 'Seeding…' : 'Seed Default Categories'}
          </button>
        </div>
      )}

      {/* Feedback */}
      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20  px-4 py-2">{error}</p>}
      {success && <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20  px-4 py-2">{success}</p>}

      {/* Add new category */}
      <div className="bg-dark-100/50 border border-white/10  p-5">
        <h3 className="text-white text-lg font-bold mb-1">Add Filter Category</h3>
        <p className="text-xs text-white/40 mb-4">Categories shown in the shop sidebar. Slug is auto-generated from name if blank.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g. Laptops)"
            className="px-3 py-2 bg-dark-200/50 border border-white/10  text-white text-sm focus:outline-none focus:border-primary/50" />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug (optional, e.g. laptops)"
            className="px-3 py-2 bg-dark-200/50 border border-white/10  text-white text-sm focus:outline-none focus:border-primary/50" />
          <input value={parentSlug} onChange={(e) => setParentSlug(e.target.value)} placeholder="Parent slug (for subcategory)"
            className="px-3 py-2 bg-dark-200/50 border border-white/10  text-white text-sm focus:outline-none focus:border-primary/50" />
          <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} placeholder="Sort order"
            className="px-3 py-2 bg-dark-200/50 border border-white/10  text-white text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={create}
            className="px-5 py-2 bg-primary text-dark font-semibold  text-sm hover:bg-primary/90">
            Add Category
          </button>
          {cats.length > 0 && (
            <button onClick={seedDefaults} disabled={seeding}
              className="px-4 py-2 bg-white/5 text-white/60 hover:text-white border border-white/10  text-sm transition-colors disabled:opacity-50">
              {seeding ? 'Seeding…' : 'Re-seed Defaults'}
            </button>
          )}
        </div>
      </div>

      {/* Existing categories */}
      <div className="bg-dark-100/50 border border-white/10  p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-bold">Shop Filter Categories ({cats.length})</h3>
          <p className="text-white/40 text-xs">These appear in the Shop sidebar for customers to filter products</p>
        </div>
        {loading ? (
          <p className="text-white/50 text-sm">Loading…</p>
        ) : cats.length === 0 ? (
          <p className="text-white/40 text-sm">No categories yet. Use "Seed Default Categories" above to get started.</p>
        ) : (
          <div className="space-y-1">
            {parents.map(c => (
              <div key={c.id}>
                {/* Parent row */}
                <div className={`flex items-center gap-3 px-3 py-2.5  ${c.visible ? '' : 'opacity-50'}`}
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {editingId === c.id ? (
                    <>
                      <input value={editName} onChange={e => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1 bg-dark-200 border border-primary/40  text-white text-sm focus:outline-none" />
                      <input type="number" value={editOrder} onChange={e => setEditOrder(Number(e.target.value))}
                        className="w-16 px-2 py-1 bg-dark-200 border border-white/10  text-white text-sm focus:outline-none" />
                      <button onClick={() => saveEdit(c)} className="px-3 py-1 bg-primary text-dark text-xs font-semibold ">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-white/10 text-white/60 text-xs ">Cancel</button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <span className="text-white text-sm font-semibold">{c.name}</span>
                        <span className="text-white/30 text-xs font-mono ml-2">/{c.slug}</span>
                        <span className="text-white/30 text-xs ml-2">order: {c.order}</span>
                      </div>
                      <button
                        onClick={() => setSpecsOpenId(specsOpenId === c.id ? null : c.id)}
                        className={`px-2.5 py-1 text-xs  transition-colors ${
                          specsOpenId === c.id
                            ? 'bg-primary text-dark font-semibold'
                            : 'text-primary/80 hover:text-primary border border-primary/30 hover:border-primary/50'
                        }`}
                      >
                        Specs{(c.specFields?.length ?? 0) > 0 ? ` (${c.specFields!.length})` : ''}
                      </button>
                      <button onClick={() => startEdit(c)} className="px-2.5 py-1 text-xs text-white/50 hover:text-white border border-white/10  transition-colors">Edit</button>
                      <button onClick={() => toggleVisible(c)}
                        className={`px-2.5 py-1 text-xs  transition-colors ${c.visible ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'bg-dark-200 text-white/40 hover:text-white/60'}`}>
                        {c.visible ? 'Visible' : 'Hidden'}
                      </button>
                      <button onClick={() => remove(c.id)} className="px-2.5 py-1 text-xs text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40  transition-colors">
                        Delete
                      </button>
                    </>
                  )}
                </div>

                {/* Spec dropdowns editor — expanded under the parent row */}
                {specsOpenId === c.id && (
                  <SpecFieldsEditor
                    cat={c}
                    onSave={(fields) => saveSpecs(c, fields)}
                    onClose={() => setSpecsOpenId(null)}
                  />
                )}

                {/* Child rows */}
                {childrenOf(c.slug).map(child => (
                  <div key={child.id} className={`flex items-center gap-3 px-3 py-2 ml-6  ${child.visible ? '' : 'opacity-50'}`}>
                    <span className="text-white/20 text-xs">└</span>
                    {editingId === child.id ? (
                      <>
                        <input value={editName} onChange={e => setEditName(e.target.value)}
                          className="flex-1 px-2 py-1 bg-dark-200 border border-primary/40  text-white text-sm focus:outline-none" />
                        <input type="number" value={editOrder} onChange={e => setEditOrder(Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-dark-200 border border-white/10  text-white text-sm focus:outline-none" />
                        <button onClick={() => saveEdit(child)} className="px-3 py-1 bg-primary text-dark text-xs font-semibold ">Save</button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-white/10 text-white/60 text-xs ">Cancel</button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <span className="text-white/70 text-sm">{child.name}</span>
                          <span className="text-white/25 text-xs font-mono ml-2">/{child.slug}</span>
                        </div>
                        <button onClick={() => startEdit(child)} className="px-2.5 py-1 text-xs text-white/40 hover:text-white border border-white/10  transition-colors">Edit</button>
                        <button onClick={() => toggleVisible(child)}
                          className={`px-2.5 py-1 text-xs  transition-colors ${child.visible ? 'bg-primary/20 text-primary' : 'bg-dark-200 text-white/40'}`}>
                          {child.visible ? 'Visible' : 'Hidden'}
                        </button>
                        <button onClick={() => remove(child.id)} className="px-2.5 py-1 text-xs text-red-400 hover:text-red-300 border border-red-400/20  transition-colors">
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* Orphan children (parent not in list) */}
            {cats.filter(c => c.parentSlug && !parents.find(p => p.slug === c.parentSlug)).map(c => (
              <div key={c.id} className={`flex items-center gap-3 px-3 py-2.5  ${c.visible ? '' : 'opacity-50'}`}
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex-1 min-w-0">
                  <span className="text-white/70 text-sm">{c.name}</span>
                  <span className="text-white/30 text-xs font-mono ml-2">/{c.slug}</span>
                  <span className="text-amber-400/60 text-xs ml-2">parent: {c.parentSlug}</span>
                </div>
                <button onClick={() => toggleVisible(c)}
                  className={`px-2.5 py-1 text-xs  ${c.visible ? 'bg-primary/20 text-primary' : 'bg-dark-200 text-white/40'}`}>
                  {c.visible ? 'Visible' : 'Hidden'}
                </button>
                <button onClick={() => remove(c.id)} className="px-2.5 py-1 text-xs text-red-400 border border-red-400/20 ">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/*  SpecFieldsEditor — manage dropdown options for a category   */
/* ─────────────────────────────────────────────────────────── */
const SpecFieldsEditor: React.FC<{
  cat: FilterCat;
  onSave: (fields: SpecField[]) => Promise<void> | void;
  onClose: () => void;
}> = ({ cat, onSave, onClose }) => {
  // Seed editor from saved value; fall back to defaults if empty
  const seed: SpecField[] = (() => {
    if (Array.isArray(cat.specFields) && cat.specFields.length > 0) return cat.specFields;
    return DEFAULT_SPEC_FIELD_OPTIONS[cat.slug] || [];
  })();
  const [fields, setFields] = useState<SpecField[]>(JSON.parse(JSON.stringify(seed)));
  const [newFieldName, setNewFieldName] = useState('');
  const [newOption, setNewOption] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  const addField = () => {
    const label = newFieldName.trim();
    if (!label) return;
    if (fields.some((f) => f.label.toLowerCase() === label.toLowerCase())) return;
    setFields([...fields, { label, options: [] }]);
    setNewFieldName('');
  };

  const removeField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const addOption = (idx: number) => {
    const val = (newOption[idx] || '').trim();
    if (!val) return;
    const next = [...fields];
    if (next[idx].options.includes(val)) return;
    next[idx] = { ...next[idx], options: [...next[idx].options, val] };
    setFields(next);
    setNewOption({ ...newOption, [idx]: '' });
  };

  const removeOption = (fieldIdx: number, opt: string) => {
    const next = [...fields];
    next[fieldIdx] = { ...next[fieldIdx], options: next[fieldIdx].options.filter((o) => o !== opt) };
    setFields(next);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(fields);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ml-3 my-2 p-4  border border-primary/20 bg-primary/[0.04] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-sm font-semibold">Specification Dropdowns — {cat.name}</p>
          <p className="text-white/40 text-xs mt-0.5">
            These dropdowns appear in the Add Product form when this category is selected.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white text-xs"
        >
          Close
        </button>
      </div>

      {/* Each spec field */}
      {fields.length === 0 && (
        <p className="text-white/40 text-xs italic">No spec dropdowns yet. Add one below.</p>
      )}
      {fields.map((field, idx) => (
        <div key={idx} className="bg-dark-200/40 border border-white/10  p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm font-semibold">{field.label}</span>
            <button
              onClick={() => removeField(idx)}
              className="text-red-400 hover:text-red-300 text-xs"
            >
              Remove field
            </button>
          </div>

          {/* Options as chips */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {field.options.length === 0 && (
              <span className="text-white/30 text-xs italic">No options yet</span>
            )}
            {field.options.map((opt) => (
              <span
                key={opt}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-white/80 text-xs"
              >
                {opt}
                <button
                  onClick={() => removeOption(idx, opt)}
                  className="text-white/40 hover:text-red-400"
                  aria-label={`Remove ${opt}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Add option */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newOption[idx] || ''}
              onChange={(e) => setNewOption({ ...newOption, [idx]: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addOption(idx); }
              }}
              placeholder={`Add option for ${field.label}…`}
              className="flex-1 px-3 py-1.5 bg-dark-200/60 border border-white/10  text-white text-xs focus:outline-none focus:border-primary/50"
            />
            <button
              onClick={() => addOption(idx)}
              className="px-3 py-1.5 bg-primary/20 text-primary text-xs font-semibold  hover:bg-primary/30"
            >
              Add
            </button>
          </div>
        </div>
      ))}

      {/* Add a new field */}
      <div className="flex gap-2 pt-2 border-t border-white/5">
        <input
          type="text"
          value={newFieldName}
          onChange={(e) => setNewFieldName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); addField(); }
          }}
          placeholder="New field name (e.g. Display, GPU)…"
          className="flex-1 px-3 py-2 bg-dark-200/60 border border-white/10  text-white text-sm focus:outline-none focus:border-primary/50"
        />
        <button
          onClick={addField}
          className="px-4 py-2 bg-white/10 text-white text-sm  hover:bg-white/15"
        >
          Add field
        </button>
      </div>

      {/* Save bar */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
        <button
          onClick={onClose}
          className="px-4 py-2 text-xs text-white/60 hover:text-white"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-primary text-dark text-xs font-bold  hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save dropdowns'}
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
