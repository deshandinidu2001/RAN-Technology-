import React, { useState } from 'react';
import api from '../../utils/api';
import type { RepairBooking } from '../../store/ordersStore';

interface Props {
  bookings: RepairBooking[];
  onUpdated: (updated: Partial<RepairBooking> & { ticketId: string }) => void;
}

const fmtRs = (n: number) => `Rs. ${Number(n || 0).toLocaleString('en-LK')}`;
const fmtWhen = (iso: string) => new Date(iso).toLocaleString('en-LK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const QuoteRequestsPanel: React.FC<Props> = ({ bookings, onUpdated }) => {
  const [tab, setTab] = useState<'pending' | 'awaiting-customer' | 'all'>('pending');
  const [drafts, setDrafts] = useState<Record<string, { price: string; priceMax: string; msg: string; sending?: boolean }>>({});

  // A booking belongs to the quote queue if either:
  //   - it was submitted as a quote request, OR
  //   - its status is in the quote pipeline
  const isQuoteRow = (b: RepairBooking) =>
    b.requestType === 'quote' ||
    b.status === 'quote-requested' ||
    b.status === 'quote-sent';

  const allQuotes = bookings.filter(isQuoteRow);
  const pending = allQuotes.filter(b => b.status === 'quote-requested' || (b.requestType === 'quote' && b.quotedPrice == null));
  const awaiting = allQuotes.filter(b => b.status === 'quote-sent');
  const list = tab === 'pending' ? pending : tab === 'awaiting-customer' ? awaiting : allQuotes;

  const setDraft = (id: string, patch: Partial<{ price: string; priceMax: string; msg: string; sending: boolean }>) =>
    setDrafts(prev => ({ ...prev, [id]: { ...{ price: '', priceMax: '', msg: '' }, ...(prev[id] || {}), ...patch } }));

  const sendQuote = async (b: RepairBooking) => {
    const d = drafts[b.ticketId] || { price: '', priceMax: '', msg: '' };
    const price = Number(d.price);
    if (!Number.isFinite(price) || price < 0) {
      alert('Enter a valid quote price.');
      return;
    }
    let priceMax: number | null = null;
    if (d.priceMax !== '') {
      const m = Number(d.priceMax);
      if (!Number.isFinite(m) || m < price) {
        alert('Max price must be greater than or equal to the min price.');
        return;
      }
      priceMax = m;
    }
    setDraft(b.ticketId, { sending: true });
    try {
      await api.post(`/repairs/admin/booking/${b.ticketId}/quote`, {
        quotedPrice: price,
        quotedPriceMax: priceMax ?? undefined,
        quoteMessage: d.msg || undefined,
      });
      onUpdated({
        ticketId: b.ticketId,
        status: 'quote-sent',
        quotedPrice: price,
        quotedPriceMax: priceMax,
        quoteMessage: d.msg || null,
        totalCost: priceMax ?? price,
      } as any);
      setDraft(b.ticketId, { sending: false, price: '', priceMax: '', msg: '' });
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to send quote.');
      setDraft(b.ticketId, { sending: false });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-white text-xl font-bold">Quote Requests</h2>
        <p className="text-white/50 text-sm mt-1">
          Repair requests where the customer is waiting for you to send a final price.
          Sending a quote also fires an in-app notification, email and SMS to the customer.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-3">
        {([
          { id: 'pending',            label: 'Waiting on you',    count: pending.length },
          { id: 'awaiting-customer',  label: 'Awaiting customer', count: awaiting.length },
          { id: 'all',                label: 'All',               count: allQuotes.length },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === t.id
                ? 'bg-primary text-dark'
                : 'border border-white/10 text-white/60 hover:text-white hover:border-white/30'
            }`}
          >
            {t.label} <span className="ml-1 opacity-60">({t.count})</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="text-white/40 text-sm">No quote requests in this view.</p>
      ) : (
        <div className="space-y-4">
          {list.map(b => {
            const d = drafts[b.ticketId] || {
              price: b.quotedPrice != null ? String(b.quotedPrice) : '',
              priceMax: (b as any).quotedPriceMax != null ? String((b as any).quotedPriceMax) : '',
              msg: '',
            };
            const isWaitingOnAdmin = b.status === 'quote-requested' || (b.requestType === 'quote' && b.quotedPrice == null);
            return (
              <div key={b.ticketId} className="border border-white/10 p-5 bg-white/[0.02]">
                <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-white font-bold">
                        {b.serialNo != null ? `REP#${b.serialNo}` : `#${b.ticketId.slice(0, 8)}`}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                        isWaitingOnAdmin ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {isWaitingOnAdmin ? 'Needs Quote' : 'Sent, awaiting customer'}
                      </span>
                      <span className="text-white/40 text-xs">{fmtWhen(b.createdAt)}</span>
                    </div>
                    <p className="text-white mt-1.5">{b.customerName} · {b.customerPhone}</p>
                    <p className="text-white/50 text-xs">{b.customerEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider">Appointment</p>
                    <p className="text-white text-sm">{b.bookedDate}</p>
                    <p className="text-white/60 text-xs">{b.timeSlot}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Device</p>
                    <p className="text-white text-sm">
                      <span className="capitalize">{b.deviceType}</span>
                      {b.deviceModel && b.deviceModel !== b.deviceType ? ` · ${b.deviceModel}` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Services</p>
                    <p className="text-white text-sm">
                      {b.services.length > 0 ? b.services.join(', ') : '-'}
                    </p>
                  </div>
                </div>

                {b.issueDescription && (
                  <div className="mb-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Issue</p>
                    <p className="text-white/70 text-sm whitespace-pre-line">{b.issueDescription}</p>
                  </div>
                )}

                {b.issueImages && b.issueImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Customer photos</p>
                    <div className="flex flex-wrap gap-2">
                      {b.issueImages.map(url => (
                        <a key={url} href={url} target="_blank" rel="noreferrer">
                          <img src={url} alt="" className="w-20 h-20 object-cover border border-white/10 hover:border-white/40" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {b.status === 'quote-sent' && b.quotedPrice != null && (
                  <div className="mb-4 border-l-2 border-blue-400/40 pl-3 text-sm">
                    <p className="text-white/40 text-xs">Last quote sent</p>
                    <p className="text-white font-semibold">
                      {(b as any).quotedPriceMax != null && (b as any).quotedPriceMax > b.quotedPrice
                        ? `${fmtRs(b.quotedPrice)} to ${fmtRs((b as any).quotedPriceMax)}`
                        : fmtRs(b.quotedPrice)}
                    </p>
                    {b.quoteMessage && <p className="text-white/60 text-xs mt-1 whitespace-pre-line">{b.quoteMessage}</p>}
                  </div>
                )}

                <div className="pt-4 border-t border-white/10 space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">
                    Send a fixed price or a range. Customer is notified by SMS, email and web notification.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Price (Rs.) or min of range"
                      value={d.price}
                      onChange={(e) => setDraft(b.ticketId, { price: e.target.value })}
                      className="px-3 py-2.5 bg-black border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-white/50"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Max (optional) for a range"
                      value={d.priceMax}
                      onChange={(e) => setDraft(b.ticketId, { priceMax: e.target.value })}
                      className="px-3 py-2.5 bg-black border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-white/50"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Optional note for the customer..."
                      value={d.msg}
                      onChange={(e) => setDraft(b.ticketId, { msg: e.target.value })}
                      className="flex-1 px-3 py-2.5 bg-black border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-white/50"
                    />
                    <button
                      type="button"
                      onClick={() => sendQuote(b)}
                      disabled={d.sending}
                      className="px-5 py-2.5 bg-primary text-dark font-semibold hover:bg-primary/90 disabled:opacity-50"
                    >
                      {d.sending ? 'Sending...' : b.status === 'quote-sent' ? 'Re-send quote' : 'Send quote'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuoteRequestsPanel;
