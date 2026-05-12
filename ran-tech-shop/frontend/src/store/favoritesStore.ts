import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  brand?: string;
}

interface FavoritesState {
  items: FavoriteItem[];
  isFavorite: (id: string) => boolean;
  toggle: (item: FavoriteItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  loadUserFavorites: (items: FavoriteItem[]) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      isFavorite: (id) => get().items.some((i) => i.id === id),
      toggle: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.id === item.id);
          return {
            items: exists
              ? state.items.filter((i) => i.id !== item.id)
              : [{ ...item }, ...state.items],
          };
        }),
      remove: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      loadUserFavorites: (items) => set({ items }),
    }),
    { name: 'ran-favorites' }
  )
);
