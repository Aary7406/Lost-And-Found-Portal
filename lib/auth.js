import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import clientPromise from './mongodb.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Hash password
export async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    { 
      userId: user._id, 
      username: user.username, 
      role: user.role,
      createdAt: user.createdAt 
    },
    JWT_SECRET,
    { 
      expiresIn: '7d',
      issuer: 'lost-and-found-system',
      audience: 'director-portal'
    }
  );
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Get user by username
export async function getUserByUsername(username) {
  try {
    const client = await clientPromise;
    const db = client.db('lost-and-found');
    const user = await db.collection('directors').findOne({ username });
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Create director user (for seeding)
export async function createDirector(userData) {
  try {
    const client = await clientPromise;
    const db = client.db('lost-and-found');
    
    // Check if user already exists
    const existingUser = await db.collection('directors').findOne({ 
      username: userData.username 
    });
    
    if (existingUser) {
      throw new Error('Director already exists');
    }
    
    // Hash password
    const hashedPassword = await hashPassword(userData.password);
    
    const director = {
      username: userData.username,
      password: hashedPassword,
      email: userData.email || '',
      role: 'director',
      permissions: ['read', 'write', 'delete', 'manage_users', 'system_admin'],
      createdAt: new Date(),
      lastLogin: null,
      isActive: true,
      securityLevel: 'executive'
    };
    
    const result = await db.collection('directors').insertOne(director);
    return { ...director, _id: result.insertedId };
    
  } catch (error) {
    console.error('Error creating director:', error);
    throw error;
  }
}