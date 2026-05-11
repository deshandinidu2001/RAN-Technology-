import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { useOrdersStore } from '../store/ordersStore';
import api from '../utils/api';
import Button from '../components/ui/Button';

type ProfileTab = 'account' | 'orders' | 'repairs' | 'favorites' | 'settings';

interface RepairBooking {
  id: string;
  date: string;
  timeSlot: string;
  deviceType: string;
  issueDescription: string;
  status: string;
  createdAt: string;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300',
  confirmed: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
  'in-progress': 'bg-[#F7B500]/15 border-[#F7B500]/30 text-[#F7B500]',
  completed: 'bg-green-500/15 border-green-500/30 text-green-300',
  cancelled: 'bg-red-500/15 border-red-500/30 text-red-300',
};

const Profile: React.FC = () => {
  const { user, isAuthenticated, logout, updateProfile, isLoading, error, clearError } = useAuthStore();
  const favorites = useFavoritesStore((s) => s.items);
  const removeFavorite = useFavoritesStore((s) => s.remove);
  const localOrders = useOrdersStore((s) => s.orders);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>('account');
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Repair bookings - merge API + local store (local is the source of truth in
  // this app; the API call is best-effort for cross-device sync).
  const [apiBookings, setApiBookings] = useState<RepairBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    setBookingsLoading(true);
    api
      .get('/repairs/my-bookings', { params: { email: user.email } })
      .then((res) => {
        if (cancelled) return;
        setApiBookings(res.data?.bookings || []);
      })
      .catch(() => {
        /* fall back to local store silently */
      })
      .finally(() => {
        if (!cancelled) setBookingsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  const userEmail = user?.email?.toLowerCase() || '';

  // Only use API bookings — no local store merge
  const bookings: RepairBooking[] = apiBookings;

  // Orders from local store, filtered to current user
  const userOrders = localOrders.filter(
    (o) => !userEmail || o.customerEmail?.toLowerCase() === userEmail
  );

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const handleSave = async () => {
    clearError();
    try {
      await updateProfile({ name: editName, email: editEmail });
      setEditMode(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      /* handled by store */
    }
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center py-20">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="w-20 h-20 bg-white/5 flex items-center justify-center mx-auto mb-6" style={{ borderRadius: '4px' }}>
                <svg className="w-10 h-10 text-[#F7B500]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Sign In Required</h1>
              <p className="text-white/50 text-sm mb-8">Sign in to access your profile, orders, and settings.</p>
              <Link to="/login" state={{ from: { pathname: '/profile' } }}>
                <Button variant="primary" size="lg">
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U';
  const memberSince = 'Member since 2024';

  const ongoingBookings = bookings.filter((b) =>
    ['pending', 'confirmed', 'in-progress'].includes(b.status)
  );
  const pastBookings = bookings.filter((b) => !['pending', 'confirmed', 'in-progress'].includes(b.status));

  const tabs: { id: ProfileTab; label: string; badge?: number }[] = [
    { id: 'account', label: 'Account' },
    { id: 'orders', label: 'Orders', badge: userOrders.length || undefined },
    { id: 'repairs', label: 'Repairs', badge: ongoingBookings.length || undefined },
    { id: 'favorites', label: 'Favorites', badge: favorites.length || undefined },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#0A0A0B]">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header - split left/right */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            {/* Left side - identity */}
            <div className="flex items-center gap-5">
              <div
                className="w-16 h-16 flex items-center justify-center text-xl font-bold text-black flex-shrink-0"
                style={{ backgroundColor: '#F7B500', borderRadius: '4px' }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white truncate">{user?.name}</h1>
                <p className="text-white/40 text-sm truncate">{user?.email}</p>
                <p className="text-white/25 text-xs mt-1">{memberSince}</p>
              </div>
            </div>

            {/* Right side - quick stats + sign out */}
            <div className="flex items-center justify-start lg:justify-end gap-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{ongoingBookings.length}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Ongoing</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{favorites.length}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Favorites</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{userOrders.length}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Orders</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-white/40 hover:text-white/70 transition-colors text-sm flex items-center gap-1.5 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-0 mb-8 border-b border-white/10 overflow-x-auto"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium transition-colors relative whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id ? 'text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: '#F7B500', color: '#0A0A0B' }}
                >
                  {tab.badge}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="profileTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F7B500]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Tab Content - left/right split */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left - personal info */}
              <div className="space-y-6">
                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-sm"
                    style={{ borderRadius: '4px' }}
                  >
                    Profile updated successfully.
                  </motion.div>
                )}

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm" style={{ borderRadius: '4px' }}>
                    {error}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Personal Information</h3>
                    {!editMode ? (
                      <button
                        onClick={() => {
                          setEditName(user?.name || '');
                          setEditEmail(user?.email || '');
                          setEditMode(true);
                        }}
                        className="text-[#F7B500] text-sm hover:text-[#F7B500]/80 transition-colors"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button onClick={() => { setEditMode(false); clearError(); }} className="text-white/40 text-sm hover:text-white/60 transition-colors">
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isLoading}
                          className="text-[#F7B500] text-sm hover:text-[#F7B500]/80 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/30 text-xs mb-1.5">Full Name</label>
                      {editMode ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F7B500]/50 transition-colors"
                          style={{ borderRadius: '4px' }}
                        />
                      ) : (
                        <p className="text-white text-sm py-2.5 border-b border-white/5">{user?.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-white/30 text-xs mb-1.5">Email Address</label>
                      {editMode ? (
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F7B500]/50 transition-colors"
                          style={{ borderRadius: '4px' }}
                        />
                      ) : (
                        <p className="text-white text-sm py-2.5 border-b border-white/5">{user?.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-white/30 text-xs mb-1.5">Account ID</label>
                      <p className="text-white/40 text-sm py-2.5 border-b border-white/5 font-mono text-xs break-all">
                        {user?.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right - quick links + ongoing repair preview */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Quick Links</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/shop" className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors group" style={{ borderRadius: '4px' }}>
                      <svg className="w-5 h-5 text-white/30 group-hover:text-[#F7B500] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span className="text-white/60 text-sm group-hover:text-white transition-colors">Shop</span>
                    </Link>
                    <Link to="/checkout" className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors group" style={{ borderRadius: '4px' }}>
                      <svg className="w-5 h-5 text-white/30 group-hover:text-[#F7B500] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17" />
                      </svg>
                      <span className="text-white/60 text-sm group-hover:text-white transition-colors">Cart</span>
                    </Link>
                    <Link to="/repair" className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors group" style={{ borderRadius: '4px' }}>
                      <svg className="w-5 h-5 text-white/30 group-hover:text-[#F7B500] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-white/60 text-sm group-hover:text-white transition-colors">Book Repair</span>
                    </Link>
                    <Link to="/contact" className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors group" style={{ borderRadius: '4px' }}>
                      <svg className="w-5 h-5 text-white/30 group-hover:text-[#F7B500] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-white/60 text-sm group-hover:text-white transition-colors">Support</span>
                    </Link>
                  </div>
                </div>

                {/* Ongoing repair preview */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Ongoing Repairs</h3>
                    {ongoingBookings.length > 0 && (
                      <button onClick={() => setActiveTab('repairs')} className="text-[#F7B500] text-xs hover:underline">
                        View all
                      </button>
                    )}
                  </div>

                  {bookingsLoading ? (
                    <p className="text-white/30 text-sm">Loading…</p>
                  ) : ongoingBookings.length === 0 ? (
                    <div className="p-6 bg-white/[0.03] border border-white/5 text-center" style={{ borderRadius: '4px' }}>
                      <p className="text-white/40 text-sm mb-3">No ongoing repairs.</p>
                      <Link to="/repair" className="text-[#F7B500] text-sm hover:underline">
                        Book a repair →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ongoingBookings.slice(0, 3).map((b) => (
                        <BookingRow key={b.id} booking={b} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Repairs Tab */}
          {activeTab === 'repairs' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">
                  Ongoing Repairs ({ongoingBookings.length})
                </h3>
                {bookingsLoading ? (
                  <p className="text-white/40 text-sm">Loading your bookings…</p>
                ) : ongoingBookings.length === 0 ? (
                  <div className="p-8 bg-white/[0.03] border border-white/5 text-center" style={{ borderRadius: '4px' }}>
                    <svg className="w-10 h-10 text-white/10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <p className="text-white/40 text-sm mb-4">No active repairs right now.</p>
                    <Link to="/repair">
                      <button className="px-5 py-2.5 text-sm font-medium text-black" style={{ backgroundColor: '#F7B500', borderRadius: '4px' }}>
                        Book a Repair
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ongoingBookings.map((b) => (
                      <BookingRow key={b.id} booking={b} expanded />
                    ))}
                  </div>
                )}
              </div>

              {pastBookings.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">
                    History ({pastBookings.length})
                  </h3>
                  <div className="space-y-3">
                    {pastBookings.map((b) => (
                      <BookingRow key={b.id} booking={b} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div>
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">
                Saved Items ({favorites.length})
              </h3>
              {favorites.length === 0 ? (
                <div className="p-8 bg-white/[0.03] border border-white/5 text-center" style={{ borderRadius: '4px' }}>
                  <svg className="w-10 h-10 text-white/10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <p className="text-white/40 text-sm mb-4">You haven't favorited any products yet.</p>
                  <Link to="/shop">
                    <button className="px-5 py-2.5 text-sm font-medium text-black" style={{ backgroundColor: '#F7B500', borderRadius: '4px' }}>
                      Browse Shop
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map((item) => (
                    <div
                      key={item.id}
                      className="group relative bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors overflow-hidden"
                      style={{ borderRadius: '6px' }}
                    >
                      <Link to={`/product/${item.id}`} className="block">
                        <div className="aspect-square overflow-hidden bg-white/5">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://placehold.co/400/1a1b1e/f7b500?text=Product';
                            }}
                          />
                        </div>
                        <div className="p-4">
                          {item.category && (
                            <p className="text-[10px] text-[#F7B500] uppercase tracking-wider mb-1">
                              {item.category.replace(/-/g, ' ')}
                            </p>
                          )}
                          <p className="text-white text-sm font-medium line-clamp-2 mb-2">{item.name}</p>
                          <p className="text-white font-bold">Rs. {item.price.toLocaleString()}</p>
                        </div>
                      </Link>
                      <button
                        onClick={() => removeFavorite(item.id)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center"
                        title="Remove from favorites"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">
                Orders ({userOrders.length})
              </h3>
              {userOrders.length === 0 ? (
                <div className="p-8 bg-white/[0.03] border border-white/5 text-center" style={{ borderRadius: '4px' }}>
                  <svg className="w-12 h-12 text-white/10 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-white/40 text-sm mb-1">No orders yet</p>
                  <p className="text-white/25 text-xs mb-6">Your order history will appear here.</p>
                  <Link to="/shop">
                    <button className="px-5 py-2.5 text-sm font-medium text-black" style={{ backgroundColor: '#F7B500', borderRadius: '4px' }}>
                      Browse Shop
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {userOrders.map((o) => (
                    <OrderRow key={o.id} order={o} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Security</h3>
                <button
                  className="w-full flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors text-left"
                  style={{ borderRadius: '4px' }}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-white/60 text-sm">Change Password</span>
                  </div>
                  <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Account</h3>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-4 border border-red-500/10 hover:border-red-500/20 text-red-400/60 hover:text-red-400 transition-colors text-sm"
                  style={{ borderRadius: '4px' }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const BookingRow: React.FC<{ booking: RepairBooking; expanded?: boolean }> = ({ booking, expanded }) => {
  const statusClass =
    STATUS_COLORS[booking.status] || 'bg-white/10 border-white/20 text-white/70';

  return (
    <div
      className="p-4 bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
      style={{ borderRadius: '4px' }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm font-medium truncate">{booking.deviceType}</p>
          <p className="text-white/40 text-xs mt-0.5">
            {booking.date} · {booking.timeSlot}
          </p>
          {expanded && booking.issueDescription && (
            <p className="text-white/60 text-xs mt-2 leading-relaxed line-clamp-3">
              {booking.issueDescription}
            </p>
          )}
        </div>
        <span
          className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 border rounded-full whitespace-nowrap ${statusClass}`}
        >
          {booking.status.replace('-', ' ')}
        </span>
      </div>
      {expanded && (booking.estimatedCost || booking.actualCost) && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-6 text-xs">
          {booking.estimatedCost ? (
            <span className="text-white/40">
              Est. <span className="text-white">Rs. {booking.estimatedCost.toLocaleString()}</span>
            </span>
          ) : null}
          {booking.actualCost ? (
            <span className="text-white/40">
              Final <span className="text-[#F7B500]">Rs. {booking.actualCost.toLocaleString()}</span>
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};

type StoredOrder = ReturnType<typeof useOrdersStore.getState>['orders'][number];

const ORDER_STATUS_COLORS: Record<string, string> = {
  processing: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300',
  shipped: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
  delivered: 'bg-green-500/15 border-green-500/30 text-green-300',
  cancelled: 'bg-red-500/15 border-red-500/30 text-red-300',
};

const OrderRow: React.FC<{ order: StoredOrder }> = ({ order }) => {
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const previewItems = order.items.slice(0, 3);
  const overflow = order.items.length - previewItems.length;
  const statusClass = ORDER_STATUS_COLORS[order.status] || 'bg-white/10 border-white/20 text-white/70';

  return (
    <div className="p-4 bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors" style={{ borderRadius: '4px' }}>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <div className="min-w-0">
          <p className="text-white text-sm font-medium font-mono">{order.id}</p>
          <p className="text-white/40 text-xs mt-0.5">
            {order.date} · {itemCount} item{itemCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 border rounded-full whitespace-nowrap ${statusClass}`}>
            {order.status}
          </span>
          <span className="text-white font-bold text-sm">Rs. {order.total.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {previewItems.map((item) => (
          <div
            key={item.id}
            className="w-12 h-12 rounded bg-white/5 border border-white/5 overflow-hidden flex-shrink-0"
            title={item.name}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/100/1a1b1e/f7b500?text=•';
              }}
            />
          </div>
        ))}
        {overflow > 0 && (
          <span className="text-white/40 text-xs ml-1">+{overflow} more</span>
        )}
      </div>

      {order.shippingAddress && order.shippingAddress !== 'Address not provided' && (
        <p className="text-white/40 text-xs mt-3 line-clamp-1">
          Ship to: <span className="text-white/60">{order.shippingAddress}</span>
        </p>
      )}
    </div>
  );
};

export default Profile;
