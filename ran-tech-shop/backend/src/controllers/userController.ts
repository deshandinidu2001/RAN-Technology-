import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Pull users + the order rows we'll count client-side. The JS client doesn't
    // expose Prisma's `_count` shorthand, but a relational select gives us the
    // order IDs cheaply enough.
    const { data, error } = await supabase
      .from('User')
      .select('id, email, name, createdAt, orders:Order(id)')
      .order('createdAt', { ascending: false });

    if (error) throw error;

    const users = (data ?? []).map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      createdAt: u.createdAt,
      _count: { orders: Array.isArray(u.orders) ? u.orders.length : 0 },
    }));

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
