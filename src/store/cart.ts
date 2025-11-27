import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  quantity: number;
  size?: string;
  color?: string;
  colorHex?: string;
  image?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Computed
  getItemCount: () => number;
  getSubtotal: () => number;
  getItemKey: (productId: string, size?: string, color?: string) => string;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      getItemKey: (productId: string, size?: string, color?: string) => {
        return `${productId}-${size || 'none'}-${color || 'none'}`;
      },

      addItem: (item: CartItem) => {
        set((state) => {
          const key = get().getItemKey(item.productId, item.size, item.color);
          const existingIndex = state.items.findIndex(
            (i) => get().getItemKey(i.productId, i.size, i.color) === key
          );

          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + item.quantity,
            };
            return { items: newItems, isOpen: true };
          }

          return { items: [...state.items, item], isOpen: true };
        });
      },

      removeItem: (productId: string, size?: string, color?: string) => {
        set((state) => {
          const key = get().getItemKey(productId, size, color);
          return {
            items: state.items.filter(
              (item) => get().getItemKey(item.productId, item.size, item.color) !== key
            ),
          };
        });
      },

      updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => {
        if (quantity < 1) {
          get().removeItem(productId, size, color);
          return;
        }

        set((state) => {
          const key = get().getItemKey(productId, size, color);
          return {
            items: state.items.map((item) =>
              get().getItemKey(item.productId, item.size, item.color) === key
                ? { ...item, quantity }
                : item
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      openCart: () => set({ isOpen: true }),

      closeCart: () => set({ isOpen: false }),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.salePrice || item.price;
          return total + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

