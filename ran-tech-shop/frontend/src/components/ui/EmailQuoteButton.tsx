import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, Check, Loader2 } from 'lucide-react';
import api from '../../utils/api';

export interface QuoteItem {
  name: string;
  description?: string;
  quantity?: number;
  price: number;
}

export interface EmailQuoteButtonProps {
  type: 'repair' | 'build' | 'cart';
  items: QuoteItem[];
  subtotal?: number;
  tax?: number;
  total: number;
  defaultEmail?: string;
  defaultName?: string;
  notes?: string;
  meta?: Record<string, string | undefined>;
  className?: string;
  label?: string;
  variant?: 'light' | 'dark';
  disabled?: boolean;
}

const EmailQuoteButton: React.FC<EmailQuoteButtonProps> = ({
  type, items, subtotal, tax, total,
  defaultEmail = '', defaultName = '', notes, meta,
  className, label = 'Email me a quote', variant = 'dark', disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState(defaultName);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => { setDone(false); setError(null); setSubmitting(false); };

  const handleSend = async () => {
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (items.length === 0) {
      setError('Add at least one item before requesting a quote.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/quotes/send', {
        to: email,
        customerName: name,
        type,
        items,
        subtotal,
        tax,
        total,
        notes,
        meta,
      });
      setDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to send quote. Please try again or contact us.');
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => { setOpen(false); setTimeout(reset, 300); };

  const baseBtn = variant === 'light'
    ? 'bg-white text-black hover:bg-white/90 border border-black/10'
    : 'bg-transparent text-white hover:bg-white/5 border border-white/20';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className={className || `inline-flex items-center gap-2 px-5 py-3 text-xs font-medium tracking-wider uppercase transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${baseBtn}`}
      >
        <Mail className="w-3.5 h-3.5" />
        {label}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed left-0 right-0 bottom-0 top-20 md:top-24 z-40 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-auto"
            onClick={close}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 16, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md my-auto bg-black border border-white/15 text-white"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div>
                  <p className="text-[10px] font-mono tracking-[0.25em] text-white/40 uppercase">Quotation</p>
                  <h3 className="text-lg font-light mt-0.5">Email me a price quote</h3>
                </div>
                <button onClick={close} className="text-white/40 hover:text-white transition-colors" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {done ? (
                <div className="p-8 text-center">
                  <div className="w-14 h-14 border-2 border-white flex items-center justify-center mx-auto mb-5">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-light mb-2">Quote Sent</h4>
                  <p className="text-white/50 text-sm">We've emailed your quotation to <span className="text-white">{email}</span>.</p>
                  <button
                    onClick={close}
                    className="mt-6 px-6 py-3 bg-white text-black text-xs uppercase tracking-wider font-medium"
                  >Done</button>
                </div>
              ) : (
                <div className="p-5 space-y-5">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/40 mb-2 block">Name</label>
                    <input
                      type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-transparent border-b border-white/15 py-2 text-sm focus:border-white/40 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/40 mb-2 block">Email</label>
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full bg-transparent border-b border-white/15 py-2 text-sm focus:border-white/40 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="border border-white/10 p-4 max-h-40 overflow-auto">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Quote Summary ({items.length} item{items.length !== 1 ? 's' : ''})</p>
                    {items.slice(0, 6).map((it, i) => (
                      <div key={i} className="flex justify-between text-xs py-1 text-white/70">
                        <span className="truncate pr-2">{it.name}{it.quantity && it.quantity > 1 ? ` × ${it.quantity}` : ''}</span>
                        <span className="font-mono whitespace-nowrap">Rs. {(it.price * (it.quantity ?? 1)).toLocaleString('en-LK')}</span>
                      </div>
                    ))}
                    {items.length > 6 && (
                      <p className="text-[10px] text-white/30 mt-1">+ {items.length - 6} more</p>
                    )}
                    <div className="flex justify-between mt-3 pt-3 border-t border-white/10 text-sm">
                      <span className="text-white/60">Total</span>
                      <span className="font-mono">Rs. {Number(total || 0).toLocaleString('en-LK')}</span>
                    </div>
                  </div>

                  {error && <div className="text-xs text-red-300/80 border border-red-300/20 p-3">{error}</div>}

                  <button
                    onClick={handleSend} disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black text-xs uppercase tracking-wider font-medium disabled:opacity-50"
                  >
                    {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" /> Sending</>) : (<><Mail className="w-3.5 h-3.5" /> Send Quote</>)}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EmailQuoteButton;
