import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const listFilterCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { includeHidden } = req.query;
    let query = supabase
      .from('FilterCategory')
      .select('*')
      .order('order', { ascending: true })
      .order('name', { ascending: true });

    if (includeHidden !== 'true') {
      query = query.eq('visible', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ categories: data ?? [] });
  } catch (err) {
    console.error('listFilterCategories error:', err);
    res.status(500).json({ error: 'Failed to list filter categories' });
  }
};

export const createFilterCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, parentSlug, order, visible } = req.body || {};
    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'name is required' });
      return;
    }
    const finalSlug = (slug && typeof slug === 'string' ? slug : slugify(name)) || slugify(name);

    const { data, error } = await supabase
      .from('FilterCategory')
      .insert({
        name: String(name).trim(),
        slug: finalSlug,
        parentSlug: parentSlug ? String(parentSlug) : null,
        order: typeof order === 'number' ? order : 0,
        visible: visible === false ? false : true,
      })
      .select('*')
      .single();

    if (error) {
      // Postgres unique_violation
      if ((error as any).code === '23505') {
        res.status(409).json({ error: 'A category with that slug already exists' });
        return;
      }
      throw error;
    }
    res.status(201).json({ category: data });
  } catch (err) {
    console.error('createFilterCategory error:', err);
    res.status(500).json({ error: 'Failed to create filter category' });
  }
};

export const updateFilterCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, parentSlug, order, visible } = req.body || {};
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = String(name);
    if (slug !== undefined) updates.slug = String(slug);
    if (parentSlug !== undefined) updates.parentSlug = parentSlug ? String(parentSlug) : null;
    if (order !== undefined) updates.order = Number(order);
    if (visible !== undefined) updates.visible = !!visible;

    const { data, error } = await supabase
      .from('FilterCategory')
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
  } catch (err) {
    console.error('updateFilterCategory error:', err);
    res.status(500).json({ error: 'Failed to update filter category' });
  }
};

export const deleteFilterCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: existing } = await supabase
      .from('FilterCategory')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const { error } = await supabase.from('FilterCategory').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('deleteFilterCategory error:', err);
    res.status(500).json({ error: 'Failed to delete filter category' });
  }
};
