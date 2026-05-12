import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../lib/supabase';
import { generateToken } from '../utils/jwt';
import { randomBytes } from 'crypto';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('User')
      .insert({ email, password: hashedPassword, name })
      .select('id, email, name, createdAt')
      .single();

    if (error || !user) {
      console.error('Register insert error:', error);
      res.status(500).json({ error: 'Failed to register user' });
      return;
    }

    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const { data: user } = await supabase
      .from('User')
      .select('id, email, name, password, createdAt')
      .eq('email', email)
      .maybeSingle();

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken({ userId: user.id, email: user.email });

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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

/**
 * Get current user profile (with orders + items + products)
 * GET /api/auth/me
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data: user, error } = await supabase
      .from('User')
      .select(
        `id, email, name, createdAt,
         orders:Order(*, items:OrderItem(*, product:Product(*)))`
      )
      .eq('id', req.user.userId)
      .maybeSingle();

    if (error) {
      console.error('Get me query error:', error);
      res.status(500).json({ error: 'Failed to get user profile' });
      return;
    }

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Sort orders newest-first to preserve previous behaviour.
    const ordered = {
      ...user,
      orders: Array.isArray((user as any).orders)
        ? [...(user as any).orders].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        : [],
    };

    res.json({ user: ordered });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

/**
 * Update user profile
 * PUT /api/auth/me
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { name, email } = req.body;

    if (email) {
      const { data: existingUser } = await supabase
        .from('User')
        .select('id')
        .eq('email', email)
        .neq('id', req.user.userId)
        .maybeSingle();

      if (existingUser) {
        res.status(400).json({ error: 'Email is already taken' });
        return;
      }
    }

    const updates: Record<string, unknown> = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    const { data: user, error } = await supabase
      .from('User')
      .update(updates)
      .eq('id', req.user.userId)
      .select('id, email, name, createdAt')
      .single();

    if (error || !user) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
      return;
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

/**
 * Change password
 * PUT /api/auth/password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
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

    const { data: user } = await supabase
      .from('User')
      .select('id, password')
      .eq('id', req.user.userId)
      .maybeSingle();

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error } = await supabase
      .from('User')
      .update({ password: hashedPassword })
      .eq('id', req.user.userId);

    if (error) {
      console.error('Change password update error:', error);
      res.status(500).json({ error: 'Failed to change password' });
      return;
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

/** Find or create a user from social login; returns { user, token } */
async function findOrCreateSocialUser(email: string, name: string): Promise<{ user: any; token: string }> {
  let { data: user } = await supabase
    .from('User')
    .select('id, email, name, createdAt')
    .eq('email', email)
    .maybeSingle();

  if (!user) {
    const randomPassword = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
    const { data: newUser, error } = await supabase
      .from('User')
      .insert({ email, name: name || email.split('@')[0], password: randomPassword })
      .select('id, email, name, createdAt')
      .single();

    if (error || !newUser) throw new Error('Failed to create user');
    user = newUser;
  }

  return { user, token: generateToken({ userId: user.id, email: user.email }) };
}

/**
 * Google OAuth sign-in
 * POST /api/auth/google
 * Body: { accessToken: string }
 */
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      res.status(400).json({ error: 'Access token is required' });
      return;
    }

    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!googleRes.ok) {
      res.status(401).json({ error: 'Invalid Google token' });
      return;
    }

    const profile = await googleRes.json() as { email?: string; name?: string };
    const { email, name } = profile;

    if (!email) {
      res.status(400).json({ error: 'Google account must have an email address' });
      return;
    }

    const { user, token } = await findOrCreateSocialUser(email, name || '');
    res.json({ message: 'Login successful', user, token });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
};

/**
 * Facebook OAuth sign-in
 * POST /api/auth/facebook
 * Body: { accessToken: string }
 */
export const facebookAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      res.status(400).json({ error: 'Access token is required' });
      return;
    }

    const fbRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`
    );

    if (!fbRes.ok) {
      res.status(401).json({ error: 'Invalid Facebook token' });
      return;
    }

    const profile = await fbRes.json() as { id?: string; email?: string; name?: string; error?: any };

    if (profile.error || !profile.email) {
      res.status(400).json({ error: 'Facebook account must have a public email address' });
      return;
    }

    const { user, token } = await findOrCreateSocialUser(profile.email, profile.name || '');
    res.json({ message: 'Login successful', user, token });
  } catch (error) {
    console.error('Facebook auth error:', error);
    res.status(500).json({ error: 'Facebook authentication failed' });
  }
};
