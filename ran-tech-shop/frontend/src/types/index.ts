export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface RepairReview {
  id: string;
  serviceType: string;
  serviceName: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  subcategory?: string;
  stock: number;
  featured: boolean;
  brand?: string;
  sku?: string;
  specs?: Record<string, string>;
  features?: string[];
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
  // RAM specific
  ramType?: string;
  ramSpeed?: number;
  ramCapacity?: number;
  // SSD specific
  ssdType?: string;
  ssdCapacity?: number;
  // GPU specific
  gpuMemory?: number;
  gpuChipset?: string;
  // Display specific
  displaySize?: number;
  displayRes?: string;
  displayType?: string;
  // Compatibility
  compatibility?: string;
  condition?: string;
  // Service fields
  isService?: boolean;
  serviceType?: string;
  // Repair-service targeting + pricing range
  deviceType?: string;        // 'desktop' | 'mobile' | 'laptop'
  priceMax?: number | null;   // optional upper bound; if null/equal to price, treated as fixed
  priceMode?: 'fixed' | 'range' | 'quote';
}

export interface RepairCategory {
  id: string;
  name: string;
  slug: string;
  deviceType: 'desktop' | 'laptop' | 'mobile';
  order: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  count: number;
  image?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface ShippingInfo {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface PaymentInfo {
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvc: string;
}
