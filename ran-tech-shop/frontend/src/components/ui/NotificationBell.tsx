import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  link?: string | null;
  type?: string;
  read: boolean;
  createdAt: string;
}

const POLL_MS = 30_000;

const formatWhen = (iso: string) => {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return '';
  const diff = Date.now() - t;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString();
};

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const email = user?.email;

  useEffect(() => {
    if (!email) return;
    let alive = true;
    const fetchOnce = async () => {
      try {
        const res = await api.get(`/notifications?email=${encodeURIComponent(email)}`);
        if (!alive) return;
        setItems(res.data?.notifications ?? []);
        setUnread(res.data?.unread ?? 0);
      } catch {/* silent */}
    };
    fetchOnce();
    const t = setInterval(fetchOnce, POLL_MS);
    return () => { alive = false; clearInterval(t); };
  }, [email]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!email) return null;

  const markAll = async () => {
    try {
      await api.post('/notifications/read-all', { email });
      setItems(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch {/* silent */}
  };

  const openOne = async (n: NotificationItem) => {
    if (!n.read) {
      try {
        await api.patch(`/notifications/${n.id}/read`);
        setItems(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
        setUnread(u => Math.max(0, u - 1));
      } catch {/* silent */}
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(o => !o)}
        className="w-10 h-10 rounded-full flex items-center justify-center border border-white/20 hover:border-primary/50 transition-colors relative"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-white/70" strokeWidth={1.5} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-black text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 max-h-[480px] overflow-hidden rounded-xl border border-white/10 bg-black/95 backdrop-blur-md z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-white text-sm font-semibold">Notifications</span>
              {unread > 0 && (
                <button onClick={markAll} className="text-[11px] uppercase tracking-wider text-white/50 hover:text-white">
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-4 py-10 text-center text-white/40 text-sm">No notifications yet.</div>
              ) : (
                items.map(n => (
                  <button
                    key={n.id}
                    onClick={() => openOne(n)}
                    className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                      n.read ? 'opacity-70' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <div className="text-white text-sm font-medium truncate">{n.title}</div>
                        <div className="text-white/60 text-xs mt-0.5 line-clamp-2">{n.body}</div>
                        <div className="text-white/30 text-[10px] uppercase tracking-wider mt-1">
                          {formatWhen(n.createdAt)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
