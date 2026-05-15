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

// DELETE /api/repair-categories/:id?cascade=services
//
// Default: refuses if services are still tagged to this category so they don't
// silently end up in "unassigned". Pass ?cascade=services to delete those
// services along with the category in one shot.
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const cascade = req.query.cascade === 'services';

    // Load the category so we know which services to look for.
    const { data: cat, error: catErr } = await supabase
      .from('RepairCategory')
      .select('id, slug, deviceType, name')
      .eq('id', id)
      .maybeSingle();
    if (catErr) throw catErr;
    if (!cat) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    const c: any = cat;

    // Find services tagged to this category.
    const { data: services, error: svcErr } = await supabase
      .from('Product')
      .select('id, name')
      .eq('isService', true)
      .eq('serviceType', c.slug)
      .eq('deviceType', c.deviceType);
    if (svcErr) throw svcErr;
    const tagged = services ?? [];

    if (tagged.length > 0 && !cascade) {
      // Tell the client how many would be orphaned so it can prompt the admin.
      res.status(409).json({
        error: 'Category has services attached',
        serviceCount: tagged.length,
        services: tagged.map((s: any) => ({ id: s.id, name: s.name })),
      });
      return;
    }

    // Cascade: delete those services first.
    if (cascade && tagged.length > 0) {
      const ids = tagged.map((s: any) => s.id);
      const { error: delSvcErr } = await supabase.from('Product').delete().in('id', ids);
      if (delSvcErr) throw delSvcErr;
    }

    const { error: delCatErr } = await supabase.from('RepairCategory').delete().eq('id', id);
    if (delCatErr) throw delCatErr;
    res.json({ success: true, deletedServices: cascade ? tagged.length : 0 });
  } catch (error) {
    console.error('deleteCategory error', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
