import { Request, Response } from 'express';
/**
 * Register a new user
 * POST /api/auth/register
 */
export declare const register: (req: Request, res: Response) => Promise<void>;
/**
 * Login user
 * POST /api/auth/login
 */
export declare const login: (req: Request, res: Response) => Promise<void>;
/**
 * Get current user profile
 * GET /api/auth/me
 */
export declare const getMe: (req: Request, res: Response) => Promise<void>;
/**
 * Update user profile
 * PUT /api/auth/me
 */
export declare const updateProfile: (req: Request, res: Response) => Promise<void>;
/**
 * Change password
 * PUT /api/auth/password
 */
export declare const changePassword: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map