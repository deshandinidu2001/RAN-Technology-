import nodemailer, { Transporter } from 'nodemailer';

let cachedTransporter: Transporter | null = null;

const buildTransporter = (): Transporter | null => {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return cachedTransporter;
};

export interface QuoteLineItem {
  name: string;
  description?: string;
  quantity?: number;
  price: number;
  priceMax?: number | null;
}

export interface QuotePayload {
  to: string;
  customerName: string;
  type: 'repair' | 'build' | 'cart';
  items: QuoteLineItem[];
  subtotal: number;
  subtotalMax?: number | null;
  tax?: number;
  total: number;
  totalMax?: number | null;
  notes?: string;
  meta?: Record<string, string | undefined>;
}

const fmtRs = (n: number) => `Rs. ${Number(n || 0).toLocaleString('en-LK')}`;

const renderHtml = (q: QuotePayload): string => {
  const title = q.type === 'repair' ? 'Repair Service Quotation'
    : q.type === 'build' ? 'Custom PC Build Quotation'
    : 'Cart Price Quotation';

  const fmtAmount = (price: number, priceMax: number | null | undefined, qty: number) => {
    if (priceMax != null && priceMax > price) {
      return `${fmtRs(price * qty)} – ${fmtRs(priceMax * qty)}`;
    }
    return fmtRs(price * qty);
  };

  const rows = q.items.map(i => {
    const qty = i.quantity ?? 1;
    return `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#222;">
        <div style="font-weight:500;">${i.name}</div>
        ${i.description ? `<div style="font-size:12px;color:#888;">${i.description}</div>` : ''}
        ${i.priceMax != null && i.priceMax > i.price ? `<div style="font-size:11px;color:#666;margin-top:4px;text-transform:uppercase;letter-spacing:0.05em;">Estimated range</div>` : ''}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center;color:#444;">${qty}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;color:#222;font-family:monospace;">${fmtAmount(i.price, i.priceMax, qty)}</td>
    </tr>`;
  }).join('');

  const subtotalDisplay = q.subtotalMax != null && q.subtotalMax > q.subtotal
    ? `${fmtRs(q.subtotal)} – ${fmtRs(q.subtotalMax)}`
    : fmtRs(q.subtotal);
  const totalDisplay = q.totalMax != null && q.totalMax > q.total
    ? `${fmtRs(q.total)} – ${fmtRs(q.totalMax)}`
    : fmtRs(q.total);

  const isUrl = (s: string) => /^https?:\/\//i.test(s);
  const ctaEntries = q.meta
    ? Object.entries(q.meta).filter(([, v]) => typeof v === 'string' && isUrl(v as string))
    : [];
  const metaRows = q.meta
    ? Object.entries(q.meta)
        .filter(([, v]) => !!v && !(typeof v === 'string' && isUrl(v as string)))
        .map(([k, v]) =>
          `<tr><td style="padding:4px 0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">${k}</td><td style="padding:4px 0;color:#222;font-size:13px;text-align:right;">${v}</td></tr>`
        ).join('')
    : '';
  const ctaButtons = ctaEntries.map(([k, v]) =>
    `<a href="${v}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:12px 22px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;margin-top:18px;margin-right:8px;">${k}</a>`
  ).join('');

  return `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
    <div style="max-width:640px;margin:24px auto;background:#fff;border:1px solid #e5e5e5;">
      <div style="background:#000;color:#fff;padding:24px 28px;">
        <div style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#999;">RAN Tech Shop</div>
        <h1 style="margin:6px 0 0;font-weight:300;font-size:26px;">${title}</h1>
      </div>
      <div style="padding:24px 28px;">
        <p style="margin:0 0 4px;color:#222;">Hi ${q.customerName || 'there'},</p>
        <p style="margin:0 0 20px;color:#666;font-size:14px;">Thank you for your interest. Below is your requested price quotation.</p>

        ${metaRows ? `<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">${metaRows}</table>` : ''}

        <table style="width:100%;border-collapse:collapse;margin-top:8px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px 12px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em;border-bottom:2px solid #000;">Item</th>
              <th style="text-align:center;padding:8px 12px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em;border-bottom:2px solid #000;">Qty</th>
              <th style="text-align:right;padding:8px 12px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em;border-bottom:2px solid #000;">Amount</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <table style="width:100%;margin-top:16px;border-collapse:collapse;">
          <tr><td style="padding:4px 12px;color:#666;font-size:13px;text-align:right;">Subtotal</td><td style="padding:4px 12px;text-align:right;font-family:monospace;color:#222;width:180px;">${subtotalDisplay}</td></tr>
          ${q.tax ? `<tr><td style="padding:4px 12px;color:#666;font-size:13px;text-align:right;">Tax</td><td style="padding:4px 12px;text-align:right;font-family:monospace;color:#222;">${fmtRs(q.tax)}</td></tr>` : ''}
          <tr><td style="padding:10px 12px;border-top:2px solid #000;text-align:right;font-weight:600;color:#000;">${q.totalMax != null && q.totalMax > q.total ? 'Estimated total' : 'Total'}</td><td style="padding:10px 12px;border-top:2px solid #000;text-align:right;font-family:monospace;font-weight:700;font-size:16px;color:#000;">${totalDisplay}</td></tr>
        </table>

        ${q.notes ? `<div style="margin-top:24px;padding:14px;background:#fafafa;border-left:3px solid #000;color:#444;font-size:13px;"><strong style="display:block;margin-bottom:4px;">Notes</strong>${q.notes}</div>` : ''}

        ${ctaButtons ? `<div style="margin-top:8px;">${ctaButtons}</div>` : ''}

        <p style="margin-top:28px;color:#888;font-size:12px;line-height:1.6;">
          This quotation is valid for 14 days. Prices are indicative and subject to part availability.<br/>
          Reply to this email or contact us to confirm and book.
        </p>
      </div>
      <div style="padding:14px 28px;background:#fafafa;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;text-align:center;">
        RAN Tech Shop · Bibile, Sri Lanka
      </div>
    </div>
  </body></html>`;
};

export const sendQuoteEmail = async (q: QuotePayload): Promise<{ ok: boolean; error?: string; previewHtml?: string }> => {
  const transporter = buildTransporter();
  const html = renderHtml(q);

  if (!transporter) {
    console.warn('[email] SMTP not configured (SMTP_HOST/PORT/USER/PASS); quote not sent.');
    return { ok: false, error: 'Email service is not configured on the server.', previewHtml: html };
  }

  const from = process.env.SMTP_FROM || `RAN Tech Shop <${process.env.SMTP_USER}>`;
  const subject = q.type === 'repair' ? 'Your RAN Tech Shop Repair Quotation'
    : q.type === 'build' ? 'Your Custom PC Build Quotation'
    : 'Your RAN Tech Shop Cart Quotation';

  try {
    await transporter.sendMail({ from, to: q.to, subject, html });
    return { ok: true };
  } catch (err: any) {
    console.error('[email] sendQuoteEmail failed:', err?.message);
    return { ok: false, error: err?.message || 'Failed to send email' };
  }
};
