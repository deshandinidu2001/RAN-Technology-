import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminState {
  isAdminAuthenticated: boolean;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  
  // Blocked time slots
  blockedTimeSlots: { date: string; slots: string[] }[];
  blockTimeSlot: (date: string, slot: string) => void;
  unblockTimeSlot: (date: string, slot: string) => void;
  isTimeSlotBlocked: (date: string, slot: string) => boolean;
  getBlockedSlotsForDate: (date: string) => string[];
}

// Simple admin password - in production, use proper authentication
const ADMIN_PASSWORD = 'ran@admin2026';

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAdminAuthenticated: false,
      blockedTimeSlots: [],

      adminLogin: (password: string) => {
        if (password === ADMIN_PASSWORD) {
          set({ isAdminAuthenticated: true });
          return true;
        }
        return false;
      },

      adminLogout: () => {
        set({ isAdminAuthenticated: false });
      },

      blockTimeSlot: (date: string, slot: string) => {
        set((state) => {
          const existing = state.blockedTimeSlots.find(b => b.date === date);
          if (existing) {
            if (!existing.slots.includes(slot)) {
              return {
                blockedTimeSlots: state.blockedTimeSlots.map(b =>
                  b.date === date ? { ...b, slots: [...b.slots, slot] } : b
                ),
              };
            }
            return state;
          }
          return {
            blockedTimeSlots: [...state.blockedTimeSlots, { date, slots: [slot] }],
          };
        });
      },

      unblockTimeSlot: (date: string, slot: string) => {
        set((state) => ({
          blockedTimeSlots: state.blockedTimeSlots
            .map(b => b.date === date ? { ...b, slots: b.slots.filter(s => s !== slot) } : b)
            .filter(b => b.slots.length > 0),
        }));
      },

      isTimeSlotBlocked: (date: string, slot: string) => {
        const blocked = get().blockedTimeSlots.find(b => b.date === date);
        return blocked ? blocked.slots.includes(slot) : false;
      },

      getBlockedSlotsForDate: (date: string) => {
        const blocked = get().blockedTimeSlots.find(b => b.date === date);
        return blocked ? blocked.slots : [];
      },
    }),
    {
      name: 'ran-admin-storage',
    }
  )
);
