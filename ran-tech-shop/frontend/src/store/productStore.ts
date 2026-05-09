import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';

interface ProductStore {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (productData) => {
        const newProduct: Product = {
          ...productData,
          id: `prod_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          products: [...state.products, newProduct],
        }));
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id
              ? { ...product, ...updates, updatedAt: new Date().toISOString() }
              : product
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        }));
      },

      getProduct: (id) => {
        return get().products.find((product) => product.id === id);
      },
    }),
    {
      name: 'ran-product-storage',
    }
  )
);
