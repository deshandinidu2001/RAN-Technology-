"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const server_1 = require("../server");
const jwt_1 = require("../utils/jwt");
/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        // Validate input
        if (!email || !password || !name) {
            res.status(400).json({ error: 'Email, password, and name are required' });
            return;
        }
        // Check if user already exists
        const existingUser = await server_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(400).json({ error: 'User with this email already exists' });
            return;
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create user
        const user = await server_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });
        // Generate token
        const token = (0, jwt_1.generateToken)({ userId: user.id, email: user.email });
        res.status(201).json({
            message: 'User registered successfully',
            user,
            token,
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};
exports.register = register;
/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        // Find user
        const user = await server_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        // Generate token
        const token = (0, jwt_1.generateToken)({ userId: user.id, email: user.email });
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
            },
            token,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
};
exports.login = login;
/**
 * Get current user profile
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const user = await server_1.prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                orders: {
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Failed to get user profile' });
    }
};
exports.getMe = getMe;
/**
 * Update user profile
 * PUT /api/auth/me
 */
const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const { name, email } = req.body;
        // Check if email is already taken by another user
        if (email) {
            const existingUser = await server_1.prisma.user.findFirst({
                where: {
                    email,
                    NOT: { id: req.user.userId },
                },
            });
            if (existingUser) {
                res.status(400).json({ error: 'Email is already taken' });
                return;
            }
        }
        const user = await server_1.prisma.user.update({
            where: { id: req.user.userId },
            data: {
                ...(name && { name }),
                ...(email && { email }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });
        res.json({
            message: 'Profile updated successfully',
            user,
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
exports.updateProfile = updateProfile;
/**
 * Change password
 * PUT /api/auth/password
 */
const changePassword = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({ error: 'Current password and new password are required' });
            return;
        }
        // Get user with password
        const user = await server_1.prisma.user.findUnique({
            where: { id: req.user.userId },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Verify current password
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValidPassword) {
            res.status(401).json({ error: 'Current password is incorrect' });
            return;
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // Update password
        await server_1.prisma.user.update({
            where: { id: req.user.userId },
            data: { password: hashedPassword },
        });
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=authController.js.map