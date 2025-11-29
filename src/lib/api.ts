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

  // Legacy support for token-based auth (will be removed)
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: 'include', // Include HTTP-only cookies in requests
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

  // Exchange authorization code for tokens (sets HTTP-only cookie)
  exchangeCode: (code: string) =>
    request<{ user: User }>('/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  // Login with ID token (alternative flow, sets HTTP-only cookie)
  loginWithGoogle: (idToken: string) =>
    request<{ user: User }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }),

  // Validate admin access (uses HTTP-only cookie)
  validateAdmin: () =>
    request<{ isAdmin: boolean; user?: User }>('/auth/validate-admin'),

  // Get current user (uses HTTP-only cookie)
  getMe: () =>
    request<User>('/auth/me'),

  // Logout (clears HTTP-only cookie)
  logout: () =>
    request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    }),

  // Update theme preference
  updateTheme: (theme: 'light' | 'dark') =>
    request<{ theme: 'light' | 'dark' }>('/auth/theme', {
      method: 'PUT',
      body: JSON.stringify({ theme }),
    }),
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

  create: (product: ProductInput, _token?: string) =>
    request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),

  update: (id: string, product: Partial<ProductInput>, _token?: string) =>
    request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),

  delete: (id: string, _token?: string) =>
    request<void>(`/products/${id}`, {
      method: 'DELETE',
    }),

  addColorVariant: (productId: string, variant: ColorVariant, _token?: string) =>
    request<Product>(`/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(variant),
    }),

  updateColorVariant: (productId: string, variantId: string, variant: Partial<ColorVariant>, _token?: string) =>
    request<Product>(`/products/${productId}/variants/${variantId}`, {
      method: 'PUT',
      body: JSON.stringify(variant),
    }),

  removeColorVariant: (productId: string, variantId: string, _token?: string) =>
    request<Product>(`/products/${productId}/variants/${variantId}`, {
      method: 'DELETE',
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

  create: (category: CategoryInput, _token?: string) =>
    request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    }),

  update: (id: string, category: Partial<CategoryInput>, _token?: string) =>
    request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    }),

  delete: (id: string, _token?: string) =>
    request<void>(`/categories/${id}`, {
      method: 'DELETE',
    }),

  reorder: (orderedIds: string[], _token?: string) =>
    request<void>('/categories/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderedIds }),
    }),
};

// Settings API (token parameter kept for backward compatibility but not used - auth via HTTP-only cookie)
export const settingsApi = {
  get: () => request<Settings>('/settings'),

  update: (settings: Partial<Settings>, _token?: string) =>
    request<Settings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  addHeroSlide: (slide: HeroSlide, _token?: string) =>
    request<Settings>('/settings/hero-slides', {
      method: 'POST',
      body: JSON.stringify(slide),
    }),

  updateHeroSlide: (id: string, slide: Partial<HeroSlide>, _token?: string) =>
    request<Settings>(`/settings/hero-slides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(slide),
    }),

  removeHeroSlide: (id: string, _token?: string) =>
    request<Settings>(`/settings/hero-slides/${id}`, {
      method: 'DELETE',
    }),

  addBanner: (banner: Banner, _token?: string) =>
    request<Settings>('/settings/banners', {
      method: 'POST',
      body: JSON.stringify(banner),
    }),

  updateBanner: (id: string, banner: Partial<Banner>, _token?: string) =>
    request<Settings>(`/settings/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(banner),
    }),

  removeBanner: (id: string, _token?: string) =>
    request<Settings>(`/settings/banners/${id}`, {
      method: 'DELETE',
    }),

  setFeaturedProducts: (productIds: string[], _token?: string) =>
    request<Settings>('/settings/featured-products', {
      method: 'PUT',
      body: JSON.stringify({ productIds }),
    }),

  updateAnnouncement: (announcement: { text: string; link?: string; isActive: boolean }, _token?: string) =>
    request<Settings>('/settings/announcement', {
      method: 'PUT',
      body: JSON.stringify(announcement),
    }),

  updateSocialLinks: (links: Record<string, string>, _token?: string) =>
    request<Settings>('/settings/social-links', {
      method: 'PUT',
      body: JSON.stringify(links),
    }),

  updateContactInfo: (info: Record<string, string>, _token?: string) =>
    request<Settings>('/settings/contact-info', {
      method: 'PUT',
      body: JSON.stringify(info),
    }),

  updateWebsiteTheme: (theme: 'floral' | 'summer' | 'winter' | 'monsoon' | 'classy' | 'monochrome', _token?: string) =>
    request<Settings>('/settings/website-theme', {
      method: 'PUT',
      body: JSON.stringify({ theme }),
    }),

  updateFeaturedCollection: (collection: {
    label?: string;
    title?: string;
    titleHighlight?: string;
    description?: string;
    buttonText?: string;
    collectionId?: string;
    isActive?: boolean;
  }, _token?: string) =>
    request<Settings>('/settings/featured-collection', {
      method: 'PUT',
      body: JSON.stringify(collection),
    }),
};

// Upload API (token parameter kept for backward compatibility but not used - auth via HTTP-only cookie)
export const uploadApi = {
  uploadProductImage: (image: string, _token?: string) =>
    request<UploadResult>('/upload/product-image', {
      method: 'POST',
      body: JSON.stringify({ image }),
    }),

  uploadProductImages: (images: string[], _token?: string) =>
    request<UploadResult[]>('/upload/product-images', {
      method: 'POST',
      body: JSON.stringify({ images }),
    }),

  // Get Cloudinary upload signature for direct upload (bypasses Vercel body size limit)
  getModelUploadSignature: () =>
    request<{
      signature: string;
      timestamp: number;
      folder: string;
      cloudName: string;
      apiKey: string;
    }>('/upload/model/signature'),

  // Direct upload to Cloudinary (bypasses API, no size limit)
  uploadModelDirect: async (file: File): Promise<UploadResult> => {
    // Get upload signature from API
    const signatureData = await uploadApi.getModelUploadSignature();
    
    // Create FormData for Cloudinary direct upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signatureData.apiKey);
    formData.append('timestamp', signatureData.timestamp.toString());
    formData.append('signature', signatureData.signature);
    formData.append('folder', signatureData.folder);
    formData.append('resource_type', 'raw');
    
    // Upload directly to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/raw/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Failed to upload model');
    }
    
    const result = await response.json();
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
    };
  },

  // Legacy upload method (has size limits, kept for backward compatibility)
  uploadModel: (model: string, _token?: string) =>
    request<UploadResult>('/upload/model', {
      method: 'POST',
      body: JSON.stringify({ model }),
    }),

  uploadHeroImage: (image: string, _token?: string) =>
    request<UploadResult>('/upload/hero-image', {
      method: 'POST',
      body: JSON.stringify({ image }),
    }),

  uploadBannerImage: (image: string, _token?: string) =>
    request<UploadResult>('/upload/banner-image', {
      method: 'POST',
      body: JSON.stringify({ image }),
    }),

  uploadCategoryImage: (image: string, _token?: string) =>
    request<UploadResult>('/upload/category-image', {
      method: 'POST',
      body: JSON.stringify({ image }),
    }),

  deleteFile: (publicId: string, resourceType: string, _token?: string) =>
    request<void>('/upload', {
      method: 'DELETE',
      body: JSON.stringify({ publicId, resourceType }),
    }),
};

// Orders API (token parameter kept for backward compatibility but not used - auth via HTTP-only cookie)
export const ordersApi = {
  getAll: (params?: OrderFilters, _token?: string) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return request<OrdersResponse>(`/orders${query ? `?${query}` : ''}`);
  },

  getById: (id: string, _token?: string) =>
    request<Order>(`/orders/${id}`),

  getMyOrders: (page = 1, limit = 10, _token?: string) =>
    request<{ orders: Order[]; total: number; pages: number }>(
      `/orders/my-orders?page=${page}&limit=${limit}`
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

  updateStatus: (id: string, status: string, _token?: string) =>
    request<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  updatePaymentStatus: (id: string, paymentStatus: string, paymentId?: string, _token?: string) =>
    request<Order>(`/orders/${id}/payment-status`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus, paymentId }),
    }),

  addTracking: (id: string, trackingNumber: string, _token?: string) =>
    request<Order>(`/orders/${id}/tracking`, {
      method: 'PATCH',
      body: JSON.stringify({ trackingNumber }),
    }),

  delete: (id: string, _token?: string) =>
    request<{ success: boolean; message: string }>(`/orders/${id}`, {
      method: 'DELETE',
    }),

  getStats: (_token?: string) =>
    request<OrderStats>('/orders/stats'),
};

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: 'admin' | 'customer' | 'none';
  theme: 'light' | 'dark';
}

export interface ColorVariant {
  _id?: string;
  name: string;
  hex: string;
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
  images: string[]; // Product images (not per color variant)
  colorVariants: ColorVariant[];
  sizes: string[];
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
  images?: string[];
  colorVariants?: ColorVariant[];
  sizes?: string[];
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
  featuredCollection?: {
    label: string;
    title: string;
    titleHighlight: string;
    description: string;
    buttonText: string;
    collectionId?: string;
    isActive: boolean;
  };
  websiteTheme?: 'floral' | 'summer' | 'winter' | 'monsoon' | 'classy' | 'monochrome';
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
    city?: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
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
    city?: string;
    state?: string;
    postalCode?: string;
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
  deliveredOrders: number;
}

