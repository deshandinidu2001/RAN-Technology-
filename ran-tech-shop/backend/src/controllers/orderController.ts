import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

interface OrderItemInput {
  productId: string;
  quantity: number;
  price: number;
}

/**
 * Create a new order
 * POST /api/orders
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { items, shippingName, shippingEmail, shippingAddress, shippingCity, shippingZip } =
      req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Order must contain at least one item' });
      return;
    }

    // Fetch all referenced products in one round-trip.
    const productIds: string[] = items.map((i: any) => i.productId);
    const { data: products, error: productsError } = await supabase
      .from('Product')
      .select('id, name, price, stock')
      .in('id', productIds);

    if (productsError) throw productsError;

    const productMap = new Map((products ?? []).map((p) => [p.id, p]));

    let total = 0;
    const validatedItems: OrderItemInput[] = [];
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        res.status(400).json({ error: `Product not found: ${item.productId}` });
        return;
      }
      if (product.stock < item.quantity) {
        res.status(400).json({ error: `Insufficient stock for ${product.name}` });
        return;
      }
      validatedItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
      total += product.price * item.quantity;
    }

    // Insert order.
    const { data: order, error: orderError } = await supabase
      .from('Order')
      .insert({
        userId: req.user.userId,
        total,
        status: 'pending',
        shippingName,
        shippingEmail,
        shippingAddress,
        shippingCity,
        shippingZip,
      })
      .select('*')
      .single();

    if (orderError || !order) throw orderError ?? new Error('Failed to create order');

    // Insert order items.
    const { error: itemsError } = await supabase.from('OrderItem').insert(
      validatedItems.map((i) => ({
        orderId: order.id,
        productId: i.productId,
        quantity: i.quantity,
        price: i.price,
      }))
    );

    if (itemsError) {
      // Best-effort rollback: delete the order. OrderItem inserts that succeeded
      // (if any) cascade-delete via FK.
      await supabase.from('Order').delete().eq('id', order.id);
      throw itemsError;
    }

    // Decrement stock atomically via RPC.
    for (const i of validatedItems) {
      const { error: stockError } = await supabase.rpc('decrement_product_stock', {
        p_id: i.productId,
        p_qty: i.quantity,
      });
      if (stockError) {
        console.error('Stock decrement failed:', stockError);
      }
    }

    // Return full order with items + products.
    const { data: fullOrder } = await supabase
      .from('Order')
      .select('*, items:OrderItem(*, product:Product(*))')
      .eq('id', order.id)
      .single();

    res.status(201).json({ message: 'Order created successfully', order: fullOrder });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

/**
 * Get orders for current user
 * GET /api/orders
 */
export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('Order')
      .select('*, items:OrderItem(*, product:Product(*))')
      .eq('userId', req.user.userId)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    res.json({ orders: data ?? [] });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

/**
 * Get order by ID
 * GET /api/orders/:id
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { data: order, error } = await supabase
      .from('Order')
      .select('*, items:OrderItem(*, product:Product(*))')
      .eq('id', id)
      .eq('userId', req.user.userId)
      .maybeSingle();

    if (error) throw error;
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

/**
 * Update order status (admin)
 * PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
      return;
    }

    const { data: existing } = await supabase
      .from('Order')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const { error: updateError } = await supabase
      .from('Order')
      .update({ status })
      .eq('id', id);
    if (updateError) throw updateError;

    const { data: order } = await supabase
      .from('Order')
      .select('*, items:OrderItem(*, product:Product(*))')
      .eq('id', id)
      .single();

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

/**
 * Cancel order
 * POST /api/orders/:id/cancel
 */
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const { data: order, error: fetchError } = await supabase
      .from('Order')
      .select('*, items:OrderItem(*)')
      .eq('id', id)
      .eq('userId', req.user.userId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.status !== 'pending') {
      res.status(400).json({ error: 'Only pending orders can be cancelled' });
      return;
    }

    const { error: updateError } = await supabase
      .from('Order')
      .update({ status: 'cancelled' })
      .eq('id', id);
    if (updateError) throw updateError;

    // Restore stock for each item via RPC.
    for (const item of (order as any).items ?? []) {
      await supabase.rpc('increment_product_stock', {
        p_id: item.productId,
        p_qty: item.quantity,
      });
    }

    const { data: cancelledOrder } = await supabase
      .from('Order')
      .select('*, items:OrderItem(*, product:Product(*))')
      .eq('id', id)
      .single();

    res.json({ message: 'Order cancelled successfully', order: cancelledOrder });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};

/**
 * Get all orders (admin)
 * GET /api/orders/all
 */
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
      .from('Order')
      .select('*, user:User(id, email, name), items:OrderItem(*, product:Product(*))', {
        count: 'exact',
      })
      .order('createdAt', { ascending: false })
      .range(from, to);

    if (status) query = query.eq('status', status as string);

    const { data, error, count } = await query;
    if (error) throw error;

    const total = count ?? 0;
    res.json({
      orders: data ?? [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Hard-delete an order (admin). OrderItem rows cascade via FK.
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('Order').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};
