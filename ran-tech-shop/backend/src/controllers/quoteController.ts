import { Request, Response } from 'express';
import { sendQuoteEmail, QuoteLineItem, QuotePayload } from '../utils/email';

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export const sendQuote = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      to,
      customerName,
      type,
      items,
      subtotal,
      tax,
      total,
      notes,
      meta,
    } = req.body as Partial<QuotePayload>;

    if (!to || !isValidEmail(to)) {
      res.status(400).json({ error: 'A valid recipient email is required.' });
      return;
    }
    if (!type || !['repair', 'build', 'cart'].includes(type)) {
      res.status(400).json({ error: 'Quote type must be one of: repair, build, cart.' });
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'At least one item is required.' });
      return;
    }

    const cleanItems: QuoteLineItem[] = items.map((i: any) => ({
      name: String(i.name ?? 'Item'),
      description: i.description ? String(i.description) : undefined,
      quantity: i.quantity ? Number(i.quantity) : 1,
      price: Number(i.price) || 0,
    }));

    const computedSubtotal = typeof subtotal === 'number'
      ? subtotal
      : cleanItems.reduce((s, i) => s + i.price * (i.quantity ?? 1), 0);
    const computedTotal = typeof total === 'number' ? total : computedSubtotal + (tax || 0);

    const result = await sendQuoteEmail({
      to,
      customerName: customerName || 'Customer',
      type,
      items: cleanItems,
      subtotal: computedSubtotal,
      tax,
      total: computedTotal,
      notes,
      meta,
    });

    if (!result.ok) {
      res.status(503).json({ error: result.error || 'Failed to send quote email.' });
      return;
    }
    res.json({ success: true, message: `Quotation sent to ${to}` });
  } catch (err: any) {
    console.error('Error sending quote:', err);
    res.status(500).json({ error: 'Failed to send quote.' });
  }
};
