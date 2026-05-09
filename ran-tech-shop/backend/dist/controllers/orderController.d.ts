import { Request, Response } from 'express';
/**
 * Create a new order
 * POST /api/orders
 */
export declare const createOrder: (req: Request, res: Response) => Promise<void>;
/**
 * Get orders for current user
 * GET /api/orders
 */
export declare const getUserOrders: (req: Request, res: Response) => Promise<void>;
/**
 * Get order by ID
 * GET /api/orders/:id
 */
export declare const getOrderById: (req: Request, res: Response) => Promise<void>;
/**
 * Update order status (admin)
 * PUT /api/orders/:id/status
 */
export declare const updateOrderStatus: (req: Request, res: Response) => Promise<void>;
/**
 * Cancel order
 * POST /api/orders/:id/cancel
 */
export declare const cancelOrder: (req: Request, res: Response) => Promise<void>;
/**
 * Get all orders (admin)
 * GET /api/orders/all
 */
export declare const getAllOrders: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=orderController.d.ts.map