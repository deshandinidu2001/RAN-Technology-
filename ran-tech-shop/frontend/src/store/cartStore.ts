import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;

  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  getItemQuantity: (id: string) => number;
}

const calculateTotals = (items: CartItem[]) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { total, itemCount };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);

          let newItems: CartItem[];
          if (existingItem) {
            newItems = state.items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            );
          } else {
            newItems = [...state.items, { ...item, quantity }];
          }

          return {
            items: newItems,
            ...calculateTotals(newItems),
          };
        });
      },

      removeItem: (id) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== id);
          return {
            items: newItems,
            ...calculateTotals(newItems),
          };
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;

        set((state) => {
          const newItems = state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          );
          return {
            items: newItems,
            ...calculateTotals(newItems),
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
          total: 0,
          itemCount: 0,
        });
      },

      isInCart: (id) => {
        return get().items.some((item) => item.id === id);
      },

      getItemQuantity: (id) => {
        const item = get().items.find((item) => item.id === id);
        return item?.quantity || 0;
      },
    }),
    {
      name: 'ran-cart-storage',
    }
  )
);
