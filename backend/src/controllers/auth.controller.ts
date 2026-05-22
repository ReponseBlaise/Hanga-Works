import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { sendResetPasswordEmail } from '../utils/email';
import { NotificationService } from '../services/notification.service';

const JWT_SECRET = process.env.JWT_SECRET || 'hanga_works_jwt_secret_super_secure_key_2026';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'hanga_works_jwt_refresh_secret_super_secure_key_2026';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body || {};
      // 1. Validation
      if (!name || !email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Name, email, and password are required',
        });
      }

      // Check if role is valid
      const validRoles = ['LEARNER', 'EMPLOYER', 'INSTITUTION', 'MENTOR', 'ADMIN'];
      if (role && !validRoles.includes(role.toUpperCase())) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid role. Must be LEARNER, EMPLOYER, INSTITUTION, MENTOR, or ADMIN',
        });
      }

      // 2. Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email is already registered',
        });
      }

      // 3. Hash Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 4. Create User
      const userRole = (role ? role.toUpperCase() : 'LEARNER') as 'LEARNER' | 'EMPLOYER' | 'INSTITUTION' | 'MENTOR' | 'ADMIN';
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: userRole,
        },
      });

      // 5. Generate Access & Refresh Tokens
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      // Set httpOnly cookie for refresh token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // 6. Send Registration Notification (Email & In-App)
      // We don't await this so it doesn't block the API response
      NotificationService.sendRegistrationConfirmation({
        id: user.id,
        email: user.email,
        name: user.name
      }).catch(err => console.error('Failed to send registration notification:', err));

      // Return success
      return res.status(201).json({
        status: 'success',
        data: {
          token: accessToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error: any) {
      console.error('Registration Error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to register user',
        error: error.message,
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email and password are required',
        });
      }

      // 1. Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials',
        });
      }

      // 2. Match password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials',
        });
      }

      // 3. Generate Access & Refresh Tokens
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      // Set httpOnly cookie for refresh token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.json({
        status: 'success',
        data: {
          token: accessToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error: any) {
      console.error('Login Error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to log in',
        error: error.message,
      });
    }
  }

  static async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token required',
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { id: number };

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid refresh token: user not found',
        });
      }

      // Generate new Access Token
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      return res.json({
        status: 'success',
        data: {
          token: accessToken,
          user,
        },
      });
    } catch (error: any) {
      console.error('Refresh Token Error:', error);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired refresh token',
      });
    }
  }

  static async logout(_req: Request, res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.json({
      status: 'success',
      message: 'Logged out successfully',
    });
  }

  @Roles('LEARNER', 'EMPLOYER', 'INSTITUTION', 'MENTOR', 'ADMIN')
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      return res.json({
        status: 'success',
        data: { user },
      });
    } catch (error: any) {
      console.error('Get Profile Error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve profile',
        error: error.message,
      });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body || {};
      if (!email) {
        return res.status(400).json({
          status: 'error',
          message: 'Email is required',
        });
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.json({
          status: 'success',
          message: 'If the email exists, a password reset link has been sent.',
        });
      }

      // Generate a token signed with the user's password hash so it is one-time use
      const secret = JWT_SECRET + user.password;
      const resetToken = jwt.sign(
        { id: user.id, email: user.email },
        secret,
        { expiresIn: '15m' }
      );

      // Send reset password email (actual delivery if credentials exist, mock fallback if not)
      const resetUrl = `http://localhost:${process.env.PORT || 5001}/api/v1/auth/reset-password?token=${resetToken}`;
      await sendResetPasswordEmail(email, resetUrl);

      return res.json({
        status: 'success',
        message: 'If the email exists, a password reset link has been sent.',
      });
    } catch (error: any) {
      console.error('Forgot Password Error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'An error occurred processing your request',
        error: error.message,
      });
    }
  }

  static async resetPasswordPage(req: Request, res: Response) {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).send('Invalid or missing token.');
    }

    // Serve a simple HTML form for the user to enter their new password
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reset Password</title>
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
          .card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
          h2 { color: #0f172a; margin-top: 0; }
          label { display: block; margin-bottom: 8px; color: #475569; font-size: 14px; }
          input { width: 100%; padding: 10px; margin-bottom: 20px; border: 1px solid #cbd5e1; border-radius: 5px; box-sizing: border-box; }
          button { width: 100%; background: #2563eb; color: white; padding: 12px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
          button:hover { background: #1d4ed8; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Create New Password</h2>
          <form id="resetForm">
            <label>New Password</label>
            <input type="password" id="newPassword" required minlength="6" placeholder="Enter new password (min 6 chars)" />
            <button type="submit">Reset Password</button>
          </form>
          <p id="message" style="margin-top: 15px; font-size: 14px; display: none;"></p>
        </div>
        
        <script>
          document.getElementById('resetForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('newPassword').value;
            const messageEl = document.getElementById('message');
            
            try {
              const response = await fetch('/api/v1/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: '${token}', newPassword })
              });
              
              const data = await response.json();
              messageEl.style.display = 'block';
              
              if (response.ok) {
                messageEl.style.color = 'green';
                messageEl.innerText = 'Password reset successfully! You can now log in.';
              } else {
                messageEl.style.color = 'red';
                messageEl.innerText = data.message || 'An error occurred';
              }
            } catch (error) {
               messageEl.style.color = 'red';
               messageEl.innerText = 'Network error occurred';
            }
          });
        </script>
      </body>
      </html>
    `;

    res.send(html);
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body || {};
      if (!token || !newPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'Token and newPassword are required',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          status: 'error',
          message: 'Password must be at least 6 characters long',
        });
      }

      // 1. Decode token to find user ID first (before verifying signature, since secret needs the user's hash)
      const decoded = jwt.decode(token) as { id: number } | null;
      if (!decoded || !decoded.id) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid or expired token structure',
        });
      }

      // 2. Fetch user to get their password hash
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      // 3. Verify the token using JWT_SECRET + user.password
      try {
        jwt.verify(token, JWT_SECRET + user.password);
      } catch (err) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid or expired reset token',
        });
      }

      // 4. Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // 5. Update user password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return res.json({
        status: 'success',
        message: 'Password has been reset successfully',
      });
    } catch (error: any) {
      console.error('Reset Password Error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'An error occurred resetting your password',
        error: error.message,
      });
    }
  }
}
