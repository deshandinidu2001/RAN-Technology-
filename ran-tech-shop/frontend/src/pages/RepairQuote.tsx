import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

interface Booking {
  id: string;
  serialNo?: number;
  date: string;
  timeSlot: string;
  deviceType: string;
  deviceModel?: string | null;
  issueDescription?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  quotedPrice: number | null;
  quotedPriceMax: number | null;
  quoteMessage?: string | null;
  services?: string | null;
  images?: string | null;
}

const fmtRs = (n: number) => `Rs. ${Number(n || 0).toLocaleString('en-LK')}`;

const RepairQuote: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await api.get(`/repairs/booking/${id}`);
        setBooking(res.data.booking);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Unable to load this quote.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const services: string[] = (() => {
    if (!booking?.services) return [];
    try { const v = JSON.parse(booking.services); return Array.isArray(v) ? v : []; }
    catch { return []; }
  })();

  const images: string[] = (() => {
    if (!booking?.images) return [];
    try { const v = JSON.parse(booking.images); return Array.isArray(v) ? v : []; }
    catch { return []; }
  })();

  const accept = async () => {
    if (!booking) return;
    setAccepting(true);
    setError(null);
    try {
      await api.post(`/repairs/booking/${booking.id}/accept`, {
        email: user?.email || booking.customerEmail,
      });
      setAccepted(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Could not accept the quote.');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-6">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white text-xs uppercase tracking-wider mb-8"
        ><ArrowLeft className="w-4 h-4" /> Back</button>

        {loading && <p className="text-white/40">Loading quote…</p>}

        {!loading && error && (
          <div className="border border-white/10 p-6 text-white/60 text-sm">{error}</div>
        )}

        {!loading && booking && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-white/20" />
              <span className="text-xs font-mono tracking-[0.3em] text-white/40 uppercase">
                {accepted ? 'Booking Confirmed' : 'Your Repair Quote'}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-light text-white tracking-tight mb-10">
              {accepted
                ? 'Thanks, we are on it.'
                : booking.quotedPrice != null
                  ? (booking.quotedPriceMax != null && booking.quotedPriceMax > booking.quotedPrice
                      ? `${fmtRs(booking.quotedPrice)} to ${fmtRs(booking.quotedPriceMax)}`
                      : fmtRs(booking.quotedPrice))
                  : 'Awaiting quote'}
            </h1>
            {booking.serialNo != null && (
              <p className="text-white/40 text-xs uppercase tracking-wider mb-6">Ref REP#{booking.serialNo}</p>
            )}

            {booking.quoteMessage && !accepted && (
              <div className="border-l-2 border-white/30 pl-4 mb-8 text-white/70 text-sm whitespace-pre-line">
                {booking.quoteMessage}
              </div>
            )}

            <div className="border border-white/10 divide-y divide-white/5 mb-10">
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Device</p>
                  <p className="text-white font-light capitalize">
                    {booking.deviceType}{booking.deviceModel ? ` · ${booking.deviceModel}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Appointment</p>
                  <p className="text-white font-light">{booking.date} · {booking.timeSlot}</p>
                </div>
              </div>

              {services.length > 0 && (
                <div className="p-6">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Services</p>
                  <ul className="space-y-1">
                    {services.map((s, i) => (
                      <li key={i} className="text-white/70 text-sm">{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {booking.issueDescription && (
                <div className="p-6">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Issue</p>
                  <p className="text-white/60 text-sm whitespace-pre-line">{booking.issueDescription}</p>
                </div>
              )}

              {images.length > 0 && (
                <div className="p-6">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Photos</p>
                  <div className="flex flex-wrap gap-2">
                    {images.map(url => (
                      <img key={url} src={url} alt="" className="w-20 h-20 object-cover border border-white/10" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!accepted && booking.quotedPrice != null && (booking.status === 'quote-sent' || booking.status === 'quote-requested') && (
              <div className="flex gap-3 flex-wrap">
                <button onClick={accept} disabled={accepting}
                  className="flex items-center gap-3 px-8 py-4 bg-white text-black text-sm font-medium disabled:opacity-50"
                >
                  {accepting ? 'Confirming…' : 'Accept & Book'} <Check className="w-4 h-4" />
                </button>
                <button onClick={() => navigate('/repair')}
                  className="px-8 py-4 border border-white/15 text-white text-sm hover:bg-white/5"
                >Maybe later</button>
              </div>
            )}

            {accepted && (
              <p className="text-white/50 text-sm">
                You'll get a confirmation by SMS and email. See you on {booking.date} at {booking.timeSlot}.
              </p>
            )}

            {booking.quotedPrice == null && (
              <p className="text-white/40 text-sm">
                We're still reviewing your request. You'll get an SMS, email and notification once the price is ready.
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RepairQuote;
