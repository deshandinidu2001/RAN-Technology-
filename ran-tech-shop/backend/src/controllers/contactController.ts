import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { sendReplyEmail } from '../utils/email';

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Public: customer submits a message from the /contact page.
// POST /api/contact   body: { name, email, subject?, message }
export const submitContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body || {};
    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    if (!email || !isValidEmail(String(email))) {
      res.status(400).json({ error: 'A valid email is required' });
      return;
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const { data, error } = await supabase
      .from('ContactMessage')
      .insert({
        name: String(name).slice(0, 120),
        email: String(email).slice(0, 200),
        subject: subject ? String(subject).slice(0, 200) : null,
        message: String(message).slice(0, 4000),
      })
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Thanks — we received your message.', record: data });
  } catch (err) {
    console.error('Error submitting contact message:', err);
    res.status(500).json({ error: 'Failed to submit message' });
  }
};

// Admin: list all messages (newest first).
// GET /api/contact/admin
export const listContactMessages = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('ContactMessage')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(500);
    if (error) throw error;
    res.json({ messages: data ?? [] });
  } catch (err) {
    console.error('Error listing contact messages:', err);
    res.status(500).json({ error: 'Failed to list messages' });
  }
};

// Admin: mark a message as read/unread.
// PATCH /api/contact/admin/:id   body: { read }
export const setMessageRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { read } = req.body || {};
    const { error } = await supabase
      .from('ContactMessage')
      .update({ read: !!read })
      .eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating message:', err);
    res.status(500).json({ error: 'Failed to update message' });
  }
};

// Admin: reply to a message — saves the reply and emails it to the customer.
// POST /api/contact/admin/:id/reply   body: { reply }
export const replyToContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reply } = req.body || {};
    if (!reply || typeof reply !== 'string' || !reply.trim()) {
      res.status(400).json({ error: 'Reply is required' });
      return;
    }

    const { data: msg, error: fetchErr } = await supabase
      .from('ContactMessage')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!msg) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    const m: any = msg;
    const replyText = String(reply).slice(0, 4000);

    // Send a clean reply email — not the quotation template.
    const emailRes = await sendReplyEmail({
      to: m.email,
      customerName: m.name || 'Customer',
      subject: m.subject || null,
      originalMessage: m.message || '',
      reply: replyText,
    });

    // Drop an in-app notification so the customer sees the reply on the site too.
    supabase.from('Notification').insert({
      email: m.email,
      title: m.subject ? `Reply: ${m.subject}` : 'Reply from RAN Tech Shop',
      body: replyText.length > 240 ? replyText.slice(0, 240) + '…' : replyText,
      link: `/profile`,
      type: 'message',
      refId: m.id,
    }).then(() => {}, () => {});

    await supabase
      .from('ContactMessage')
      .update({
        adminReply: replyText,
        repliedAt: new Date().toISOString(),
        read: true,
      })
      .eq('id', id);

    res.json({ success: true, emailSent: emailRes.ok, emailError: emailRes.error });
  } catch (err) {
    console.error('Error replying to message:', err);
    res.status(500).json({ error: 'Failed to send reply' });
  }
};

// Admin: delete a message.
// DELETE /api/contact/admin/:id
export const deleteContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('ContactMessage').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};
