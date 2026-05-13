import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

// List notifications for an email address (most recent first).
// GET /api/notifications?email=foo@bar.com
export const listNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = (req.query.email as string) || '';
    if (!email) {
      res.status(400).json({ error: 'email is required' });
      return;
    }
    const { data, error } = await supabase
      .from('Notification')
      .select('*')
      .eq('email', email)
      .order('createdAt', { ascending: false })
      .limit(50);
    if (error) throw error;
    const notifications = data ?? [];
    const unread = notifications.filter((n: any) => !n.read).length;
    res.json({ notifications, unread });
  } catch (error) {
    console.error('listNotifications error', error);
    res.status(500).json({ error: 'Failed to list notifications' });
  }
};

// PATCH /api/notifications/:id/read
export const markRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('Notification')
      .update({ read: true })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    res.json({ success: true, notification: data });
  } catch (error) {
    console.error('markRead error', error);
    res.status(500).json({ error: 'Failed to mark notification' });
  }
};

// POST /api/notifications/read-all  body: { email }
export const markAllRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.body?.email;
    if (!email) {
      res.status(400).json({ error: 'email is required' });
      return;
    }
    const { error } = await supabase
      .from('Notification')
      .update({ read: true })
      .eq('email', email)
      .eq('read', false);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('markAllRead error', error);
    res.status(500).json({ error: 'Failed to mark all' });
  }
};
