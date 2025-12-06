/**
 * Authentication & Authorization Helpers
 * - bcrypt password hashing (10 salt rounds)
 * - JWT token verification via cookies
 * - Standard response helpers
 */

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // 7 days

/**
 * Create standardized error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {NextResponse}
 */
export function createErrorResponse(message, status = 500) {
  return NextResponse.json(
    {
      success: false,
      error: message
    },
    { status }
  );
}

/**
 * Create standardized success response
 * @param {object} data - Response data
 * @param {number} status - HTTP status code
 * @returns {NextResponse}
 */
export function createSuccessResponse(data, status = 200) {
  return NextResponse.json(
    {
      success: true,
      ...data
    },
    { status }
  );
}

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password (60 chars)
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10); // 10 rounds = 2^10 iterations
  return await bcrypt.hash(password, salt);
}

/**
 * Verify password against bcrypt hash
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - bcrypt hash (60 chars)
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Create JWT token for authenticated user
 * @param {object} user - User object (id, username, email, role, first_name, last_name)
 * @returns {string} JWT token
 */
export function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify JWT token from request cookies
 * @param {Request} request - Next.js request object
 * @returns {object|null} Decoded user object or null if invalid
 */
export function verifyToken(request) {
  try {
    // Get token from cookies
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return { success: false, error: 'No authentication token' };
    }

    // Parse cookies manually
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...v] = c.split('=');
        return [key, v.join('=')];
      })
    );

    const token = cookies.token;
    if (!token) {
      return { success: false, error: 'No authentication token' };
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    return { success: true, user: decoded };
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return { success: false, error: 'Invalid or expired token' };
  }
}

/**
 * Set authentication cookie in response
 * @param {NextResponse} response - Next.js response object
 * @param {string} token - JWT token
 * @returns {NextResponse} Response with cookie set
 */
export function setAuthCookie(response, token) {
  response.cookies.set('token', token, {
    httpOnly: true,      // Prevent XSS
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'lax',     // CSRF protection
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/'            // Available site-wide
  });
  return response;
}

/**
 * Clear authentication cookie
 * @param {NextResponse} response - Next.js response object
 * @returns {NextResponse} Response with cookie cleared
 */
export function clearAuthCookie(response) {
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });
  return response;
}
