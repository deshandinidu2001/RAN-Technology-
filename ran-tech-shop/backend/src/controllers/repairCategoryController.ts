import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// GET /api/repair-categories?deviceType=mobile
export const listCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceType } = req.query;
    let q = supabase.from('RepairCategory').select('*').order('order', { ascending: true });
    if (deviceType && typeof deviceType === 'string') q = q.eq('deviceType', deviceType);
    const { data, error } = await q;
    if (error) throw error;
    res.json({ categories: data ?? [] });
  } catch (error) {
    console.error('listCategories error', error);
    res.status(500).json({ error: 'Failed to list categories' });
  }
};

// POST /api/repair-categories  { name, deviceType, slug?, order? }
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, deviceType, slug, order } = req.body;
    if (!name || !deviceType) {
      res.status(400).json({ error: 'name and deviceType are required' });
      return;
    }
    if (!['desktop', 'laptop', 'mobile'].includes(deviceType)) {
      res.status(400).json({ error: 'deviceType must be desktop, laptop or mobile' });
      return;
    }
    const finalSlug = (slug && String(slug).trim()) || slugify(String(name));
    const { data, error } = await supabase
      .from('RepairCategory')
      .insert({ name, deviceType, slug: finalSlug, order: order ?? 0 })
      .select('*')
      .single();
    if (error) throw error;
    res.status(201).json({ category: data });
  } catch (error: any) {
    console.error('createCategory error', error);
    res.status(500).json({ error: error?.message || 'Failed to create category' });
  }
};

// PATCH /api/repair-categories/:id
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, order, deviceType } = req.body;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = String(slug).trim() || slugify(String(name || ''));
    if (order !== undefined) updates.order = Number(order) || 0;
    if (deviceType !== undefined) updates.deviceType = deviceType;
    const { data, error } = await supabase
      .from('RepairCategory')
      .update(updates)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    res.json({ category: data });
  } catch (error) {
    console.error('updateCategory error', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// DELETE /api/repair-categories/:id
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('RepairCategory').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('deleteCategory error', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
