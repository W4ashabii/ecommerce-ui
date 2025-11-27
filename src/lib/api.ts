const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Public config from API
export interface AppConfig {
  googleClientId: string;
  allowedAdminEmails: string[];
  cloudinaryCloudName: string;
  appName: string;
  appVersion: string;
}

let cachedConfig: AppConfig | null = null;

export const configApi = {
  get: async (): Promise<AppConfig> => {
    if (cachedConfig) {
      return cachedConfig;
    }
    
    const response = await fetch(`${API_URL}/config`);
    if (!response.ok) {
      throw new Error('Failed to fetch config');
    }
    
    cachedConfig = await response.json();
    return cachedConfig!;
  },
  
  // For SSR - get config synchronously if already cached
  getCached: (): AppConfig | null => cachedConfig,
};

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = response.headers.get('content-type')?.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new ApiError(
      data?.error || 'An error occurred',
      response.status,
      data
    );
  }

  return data;
}

// Auth API
export const authApi = {
  // Get Google OAuth URL for redirect
  getGoogleAuthUrl: () =>
    request<{ url: string }>('/auth/google/url'),

  // Exchange authorization code for tokens (secure flow)
  exchangeCode: (code: string) =>
    request<{ token: string; user: User }>('/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  // Login with ID token (alternative flow)
  loginWithGoogle: (idToken: string) =>
    request<{ token: string; user: User }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }),

  validateAdmin: (token: string) =>
    request<{ isAdmin: boolean; user?: User }>('/auth/validate-admin', {
      token,
    }),

  getMe: (token: string) =>
    request<User>('/auth/me', { token }),
};

// Products API
export const productsApi = {
  getAll: (params?: ProductFilters) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return request<ProductsResponse>(`/products${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => request<Product>(`/products/${id}`),
  
  getBySlug: (slug: string) => request<Product>(`/products/slug/${slug}`),

  getFeatured: (limit = 8) => request<Product[]>(`/products/featured?limit=${limit}`),
  
  getNew: (limit = 8) => request<Product[]>(`/products/new?limit=${limit}`),
  
  getBestSellers: (limit = 8) => request<Product[]>(`/products/bestsellers?limit=${limit}`),

  getByCategory: (categoryId: string, page = 1, limit = 20) =>
    request<{ products: Product[]; total: number; pages: number }>(
      `/products/category/${categoryId}?page=${page}&limit=${limit}`
    ),

  create: (product: ProductInput, token: string) =>
    request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
      token,
    }),

  update: (id: string, product: Partial<ProductInput>, token: string) =>
    request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
      token,
    }),

  delete: (id: string, token: string) =>
    request<void>(`/products/${id}`, {
      method: 'DELETE',
      token,
    }),

  addColorVariant: (productId: string, variant: ColorVariant, token: string) =>
    request<Product>(`/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(variant),
      token,
    }),

  updateColorVariant: (productId: string, variantId: string, variant: Partial<ColorVariant>, token: string) =>
    request<Product>(`/products/${productId}/variants/${variantId}`, {
      method: 'PUT',
      body: JSON.stringify(variant),
      token,
    }),

  removeColorVariant: (productId: string, variantId: string, token: string) =>
    request<Product>(`/products/${productId}/variants/${variantId}`, {
      method: 'DELETE',
      token,
    }),
};

// Categories API
export const categoriesApi = {
  getAll: (includeInactive = false) =>
    request<Category[]>(`/categories${includeInactive ? '?includeInactive=true' : ''}`),

  getById: (id: string) => request<Category>(`/categories/${id}`),

  getBySlug: (slug: string) => request<Category>(`/categories/slug/${slug}`),

  getRootCategories: () => request<Category[]>('/categories/root'),

  getSubcategories: (parentId: string) =>
    request<Category[]>(`/categories/${parentId}/subcategories`),

  create: (category: CategoryInput, token: string) =>
    request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
      token,
    }),

  update: (id: string, category: Partial<CategoryInput>, token: string) =>
    request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
      token,
    }),

  delete: (id: string, token: string) =>
    request<void>(`/categories/${id}`, {
      method: 'DELETE',
      token,
    }),

  reorder: (orderedIds: string[], token: string) =>
    request<void>('/categories/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderedIds }),
      token,
    }),
};

// Settings API
export const settingsApi = {
  get: () => request<Settings>('/settings'),

  update: (settings: Partial<Settings>, token: string) =>
    request<Settings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
      token,
    }),

  addHeroSlide: (slide: HeroSlide, token: string) =>
    request<Settings>('/settings/hero-slides', {
      method: 'POST',
      body: JSON.stringify(slide),
      token,
    }),

  updateHeroSlide: (id: string, slide: Partial<HeroSlide>, token: string) =>
    request<Settings>(`/settings/hero-slides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(slide),
      token,
    }),

  removeHeroSlide: (id: string, token: string) =>
    request<Settings>(`/settings/hero-slides/${id}`, {
      method: 'DELETE',
      token,
    }),

  addBanner: (banner: Banner, token: string) =>
    request<Settings>('/settings/banners', {
      method: 'POST',
      body: JSON.stringify(banner),
      token,
    }),

  updateBanner: (id: string, banner: Partial<Banner>, token: string) =>
    request<Settings>(`/settings/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(banner),
      token,
    }),

  removeBanner: (id: string, token: string) =>
    request<Settings>(`/settings/banners/${id}`, {
      method: 'DELETE',
      token,
    }),

  setFeaturedProducts: (productIds: string[], token: string) =>
    request<Settings>('/settings/featured-products', {
      method: 'PUT',
      body: JSON.stringify({ productIds }),
      token,
    }),

  updateAnnouncement: (announcement: { text: string; link?: string; isActive: boolean }, token: string) =>
    request<Settings>('/settings/announcement', {
      method: 'PUT',
      body: JSON.stringify(announcement),
      token,
    }),

  updateSocialLinks: (links: Record<string, string>, token: string) =>
    request<Settings>('/settings/social-links', {
      method: 'PUT',
      body: JSON.stringify(links),
      token,
    }),

  updateContactInfo: (info: Record<string, string>, token: string) =>
    request<Settings>('/settings/contact-info', {
      method: 'PUT',
      body: JSON.stringify(info),
      token,
    }),
};

// Upload API
export const uploadApi = {
  uploadProductImage: (image: string, token: string) =>
    request<UploadResult>('/upload/product-image', {
      method: 'POST',
      body: JSON.stringify({ image }),
      token,
    }),

  uploadProductImages: (images: string[], token: string) =>
    request<UploadResult[]>('/upload/product-images', {
      method: 'POST',
      body: JSON.stringify({ images }),
      token,
    }),

  uploadModel: (model: string, token: string) =>
    request<UploadResult>('/upload/model', {
      method: 'POST',
      body: JSON.stringify({ model }),
      token,
    }),

  uploadHeroImage: (image: string, token: string) =>
    request<UploadResult>('/upload/hero-image', {
      method: 'POST',
      body: JSON.stringify({ image }),
      token,
    }),

  uploadBannerImage: (image: string, token: string) =>
    request<UploadResult>('/upload/banner-image', {
      method: 'POST',
      body: JSON.stringify({ image }),
      token,
    }),

  uploadCategoryImage: (image: string, token: string) =>
    request<UploadResult>('/upload/category-image', {
      method: 'POST',
      body: JSON.stringify({ image }),
      token,
    }),

  deleteFile: (publicId: string, resourceType: string, token: string) =>
    request<void>('/upload', {
      method: 'DELETE',
      body: JSON.stringify({ publicId, resourceType }),
      token,
    }),
};

// Orders API
export const ordersApi = {
  getAll: (params?: OrderFilters, token?: string) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return request<OrdersResponse>(`/orders${query ? `?${query}` : ''}`, { token });
  },

  getById: (id: string, token: string) =>
    request<Order>(`/orders/${id}`, { token }),

  getMyOrders: (page = 1, limit = 10, token: string) =>
    request<{ orders: Order[]; total: number; pages: number }>(
      `/orders/my-orders?page=${page}&limit=${limit}`,
      { token }
    ),

  create: (order: CreateOrderInput) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),

  track: (orderNumber: string) =>
    request<{ orderNumber: string; status: string; trackingNumber?: string }>(
      `/orders/track/${orderNumber}`
    ),

  updateStatus: (id: string, status: string, token: string) =>
    request<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      token,
    }),

  updatePaymentStatus: (id: string, paymentStatus: string, paymentId?: string, token?: string) =>
    request<Order>(`/orders/${id}/payment-status`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus, paymentId }),
      token,
    }),

  addTracking: (id: string, trackingNumber: string, token: string) =>
    request<Order>(`/orders/${id}/tracking`, {
      method: 'PATCH',
      body: JSON.stringify({ trackingNumber }),
      token,
    }),

  getStats: (token: string) =>
    request<OrderStats>('/orders/stats', { token }),
};

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: 'admin' | 'customer' | 'none';
}

export interface ColorVariant {
  _id?: string;
  name: string;
  hex: string;
  images: string[];
  stock: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  category: { _id: string; name: string; slug: string };
  colorVariants: ColorVariant[];
  sizes: string[];
  modelUrl?: string;
  modelPublicId?: string;
  featured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  slug?: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  colorVariants?: ColorVariant[];
  sizes?: string[];
  modelUrl?: string;
  modelPublicId?: string;
  featured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isActive?: boolean;
  tags?: string[];
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string;
  colors?: string;
  featured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  pages: number;
  currentPage: number;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imagePublicId?: string;
  parent?: { _id: string; name: string; slug: string };
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  imagePublicId?: string;
  parent?: string;
  isActive?: boolean;
  order?: number;
}

export interface HeroSlide {
  _id?: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  image: string;
  imagePublicId?: string;
  isActive: boolean;
  order: number;
}

export interface Banner {
  _id?: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  image: string;
  imagePublicId?: string;
  position: 'top' | 'middle' | 'bottom';
  isActive: boolean;
}

export interface TeamMember {
  _id?: string;
  name: string;
  role: string;
  image?: string;
  imagePublicId?: string;
}

export interface AboutPage {
  title: string;
  subtitle?: string;
  heroImage?: string;
  heroImagePublicId?: string;
  story: {
    title: string;
    content: string;
  };
  mission: {
    title: string;
    content: string;
  };
  values: {
    title: string;
    items: string[];
  };
  team: {
    title: string;
    subtitle?: string;
    members: TeamMember[];
  };
}

export interface CollectionsPage {
  title: string;
  subtitle?: string;
  heroImage?: string;
  heroImagePublicId?: string;
  featuredCollectionIds: string[];
}

export interface Settings {
  _id: string;
  heroSlides: HeroSlide[];
  banners: Banner[];
  featuredProductIds: string[];
  announcementBar?: {
    text: string;
    link?: string;
    isActive: boolean;
  };
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    pinterest?: string;
    tiktok?: string;
  };
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
  };
  seoDefaults: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  aboutPage?: AboutPage;
  collectionsPage?: CollectionsPage;
}

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  resourceType: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user?: { _id: string; email: string; name: string };
  guestEmail?: string;
  items: {
    product: { _id: string; name: string; slug: string };
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    image?: string;
  }[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentId?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  items: {
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
  }[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod?: string;
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  pages: number;
  currentPage: number;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
}

