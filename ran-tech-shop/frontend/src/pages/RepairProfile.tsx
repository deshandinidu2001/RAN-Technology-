import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';

type Tab = 'account' | 'bookings' | 'notifications';

interface RepairBookingRow {
  id: string;
  serialNo?: number;
  date: string;
  timeSlot: string;
  deviceType: string;
  deviceModel?: string | null;
  issueDescription?: string | null;
  status: string;
  requestType?: 'booking' | 'quote';
  createdAt: string;
  quotedPrice?: number | null;
  quotedPriceMax?: number | null;
  quoteMessage?: string | null;
  estimatedCost?: number | null;
  actualCost?: number | null;
  services?: string | null;
}

interface NotificationRow {
  id: string;
  title: string;
  body: string;
  link?: string | null;
  type?: string;
  read: boolean;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300',
  'quote-requested': 'bg-amber-500/15 border-amber-500/30 text-amber-300',
  'quote-sent': 'bg-blue-500/15 border-blue-500/30 text-blue-300',
  confirmed: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
  'in-progress': 'bg-[#F7B500]/15 border-[#F7B500]/30 text-[#F7B500]',
  'ready-for-pickup': 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
  completed: 'bg-green-500/15 border-green-500/30 text-green-300',
  cancelled: 'bg-red-500/15 border-red-500/30 text-red-300',
};

const fmtRs = (n: number) => `Rs. ${Number(n || 0).toLocaleString('en-LK')}`;
const fmtWhen = (iso: string) => new Date(iso).toLocaleString('en-LK', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const parseServices = (raw?: string | null): string[] => {
  if (!raw) return [];
  try { const v = JSON.parse(raw); return Array.isArray(v) ? v.map(String) : []; }
  catch { return []; }
};

const RepairProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile, isLoading } = useAuthStore();
  const [tab, setTab] = useState<Tab>('account');
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saveOk, setSaveOk] = useState(false);

  const [bookings, setBookings] = useState<RepairBookingRow[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unread, setUnread] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login?next=/repair/profile');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!user?.email) return;
    setBookingsLoading(true);
    api.get('/repairs/my-bookings', { params: { email: user.email } })
      .then(res => setBookings(res.data?.bookings || []))
      .catch(() => {})
      .finally(() => setBookingsLoading(false));
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;
    setNotifLoading(true);
    api.get(`/notifications?email=${encodeURIComponent(user.email)}`)
      .then(res => {
        setNotifications(res.data?.notifications ?? []);
        setUnread(res.data?.unread ?? 0);
      })
      .catch(() => {})
      .finally(() => setNotifLoading(false));
  }, [user?.email]);

  const saveProfile = async () => {
    if (!name.trim() || !email.trim()) return;
    try {
      await updateProfile({ name, email });
      setEditMode(false);
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 2000);
    } catch { /* error already on store */ }
  };

  const markAllRead = async () => {
    if (!user?.email) return;
    await api.post('/notifications/read-all', { email: user.email }).catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  const openNotification = async (n: NotificationRow) => {
    if (!n.read) {
      await api.patch(`/notifications/${n.id}/read`).catch(() => {});
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
      setUnread(u => Math.max(0, u - 1));
    }
    if (n.link) navigate(n.link);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black pt-28 pb-20">
      <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-12 bg-white/20" />
            <span className="text-xs font-mono tracking-[0.3em] text-white/40 uppercase">My Account</span>
          </div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="text-4xl sm:text-5xl font-light text-white tracking-tight">
              Hi, <span className="text-white/40">{user.name?.split(' ')[0] || 'there'}</span>
            </h1>
            <button onClick={logout}
              className="text-xs uppercase tracking-wider text-white/40 hover:text-white border border-white/15 px-4 py-2 hover:border-white/40"
            >Sign out</button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-3">
          {([
            { id: 'account',       label: 'Account',       count: undefined as number | undefined },
            { id: 'bookings',      label: 'My Repairs',    count: bookings.length },
            { id: 'notifications', label: 'Notifications', count: unread || undefined },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                tab === t.id ? 'bg-white text-black' : 'border border-white/10 text-white/60 hover:text-white hover:border-white/30'
              }`}
            >
              {t.label}
              {t.count != null && <span className="ml-1 opacity-60">({t.count})</span>}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Account ─────────────────────────────────────── */}
          {tab === 'account' && (
            <motion.div key="account" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="border border-white/10 p-8 max-w-xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-full bg-[#7C3AED] text-white text-2xl font-bold flex items-center justify-center">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-white text-lg font-light">{user.name}</p>
                    <p className="text-white/40 text-sm">{user.email}</p>
                  </div>
                </div>

                {!editMode ? (
                  <button onClick={() => { setEditMode(true); setName(user.name || ''); setEmail(user.email || ''); }}
                    className="px-5 py-2.5 text-xs uppercase tracking-wider text-white border border-white/20 hover:bg-white/5"
                  >Edit profile</button>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-white/40">Full name</label>
                      <input value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full py-3 bg-transparent border-b border-white/10 text-white focus:border-white/40 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-white/40">Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full py-3 bg-transparent border-b border-white/10 text-white focus:border-white/40 focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveProfile} disabled={isLoading}
                        className="px-5 py-2.5 text-xs uppercase tracking-wider bg-white text-black hover:bg-white/90 disabled:opacity-50"
                      >{isLoading ? 'Saving' : 'Save'}</button>
                      <button onClick={() => setEditMode(false)}
                        className="px-5 py-2.5 text-xs uppercase tracking-wider border border-white/15 text-white/70 hover:bg-white/5"
                      >Cancel</button>
                    </div>
                    {saveOk && <p className="text-green-400 text-xs">Profile updated.</p>}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Bookings ────────────────────────────────────── */}
          {tab === 'bookings' && (
            <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {bookingsLoading ? (
                <p className="text-white/40 text-sm">Loading your repairs...</p>
              ) : bookings.length === 0 ? (
                <div className="border border-white/10 p-10 text-center">
                  <p className="text-white/50 mb-4">You haven't booked a repair yet.</p>
                  <button onClick={() => navigate('/repair')}
                    className="px-6 py-3 bg-white text-black text-xs uppercase tracking-wider"
                  >Book a repair</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map(b => {
                    const colour = STATUS_COLORS[b.status] || 'bg-white/5 border-white/10 text-white/60';
                    const ref = b.serialNo != null ? `REP#${b.serialNo}` : b.id.slice(0, 8);
                    const services = parseServices(b.services);
                    const priceLabel = b.quotedPrice != null && b.quotedPriceMax != null && b.quotedPriceMax > b.quotedPrice
                      ? `${fmtRs(b.quotedPrice)} to ${fmtRs(b.quotedPriceMax)}`
                      : b.quotedPrice != null ? fmtRs(b.quotedPrice)
                      : b.actualCost != null ? fmtRs(b.actualCost)
                      : b.estimatedCost != null ? fmtRs(b.estimatedCost)
                      : null;
                    return (
                      <div key={b.id} className="border border-white/10 p-5">
                        <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-white font-bold">{ref}</span>
                              <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border ${colour}`}>
                                {b.status.replace(/-/g, ' ')}
                              </span>
                            </div>
                            <p className="text-white/40 text-xs mt-1">{fmtWhen(b.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-white/30 uppercase tracking-wider">Appointment</p>
                            <p className="text-white text-sm">{b.date}</p>
                            <p className="text-white/60 text-xs">{b.timeSlot}</p>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Device</p>
                            <p className="text-white text-sm">
                              <span className="capitalize">{b.deviceType}</span>
                              {b.deviceModel && b.deviceModel !== b.deviceType ? `, ${b.deviceModel}` : ''}
                            </p>
                          </div>
                          {services.length > 0 && (
                            <div>
                              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Services</p>
                              <p className="text-white text-sm">{services.join(', ')}</p>
                            </div>
                          )}
                        </div>

                        {b.status === 'quote-sent' && b.quotedPrice != null && (
                          <div className="border-l-2 border-blue-400/40 pl-3 mb-3">
                            <p className="text-[10px] text-white/30 uppercase tracking-wider">Shop quote</p>
                            <p className="text-white text-sm font-semibold">{priceLabel}</p>
                            {b.quoteMessage && <p className="text-white/50 text-xs mt-1">{b.quoteMessage}</p>}
                            <button onClick={() => navigate(`/repair/quote/${b.id}`)}
                              className="mt-2 text-[10px] uppercase tracking-wider text-white hover:underline"
                            >Review &amp; accept</button>
                          </div>
                        )}

                        {priceLabel && b.status !== 'quote-sent' && (
                          <p className="text-white/60 text-sm">
                            <span className="text-white/30 text-[10px] uppercase tracking-wider mr-2">Estimate</span>
                            {priceLabel}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Notifications ───────────────────────────────── */}
          {tab === 'notifications' && (
            <motion.div key="notifs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-white/50 text-sm">
                  {unread > 0 ? `${unread} unread` : 'You are all caught up.'}
                </p>
                {unread > 0 && (
                  <button onClick={markAllRead}
                    className="text-[10px] uppercase tracking-wider text-white/60 hover:text-white"
                  >Mark all read</button>
                )}
              </div>
              {notifLoading ? (
                <p className="text-white/40 text-sm">Loading...</p>
              ) : notifications.length === 0 ? (
                <p className="text-white/40 text-sm">No notifications yet.</p>
              ) : (
                <div className="border border-white/10">
                  {notifications.map(n => (
                    <button key={n.id} onClick={() => openNotification(n)}
                      className={`w-full text-left p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${n.read ? 'opacity-70' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-[#F7B500] shrink-0" />}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-3">
                            <span className="text-white text-sm font-medium">{n.title}</span>
                            <span className="text-white/30 text-[10px] uppercase tracking-wider">{fmtWhen(n.createdAt)}</span>
                          </div>
                          <p className="text-white/60 text-sm mt-1">{n.body}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RepairProfile;
