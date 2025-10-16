import { NextResponse } from 'next/server';
import { getUserByUsername, verifyPassword, generateToken } from '../../../../../../lib/auth.js';
import clientPromise from '../../../../../../lib/mongodb.js';

export async function POST(request) {
  try {
    const { username, password, rememberMe } = await request.json();
    
    console.log('🔐 Director login attempt:', username);
    
    // Input validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    // Get user from database
    const user = await getUserByUsername(username);
    
    if (!user) {
      console.log('❌ User not found:', username);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if user is active
    if (!user.isActive) {
      console.log('❌ Account deactivated:', username);
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', username);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Update last login
    try {
      const client = await clientPromise;
      const db = client.db('lost-and-found');
      await db.collection('directors').updateOne(
        { _id: user._id },
        { $set: { lastLogin: new Date() } }
      );
    } catch (error) {
      console.error('Error updating last login:', error);
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    console.log('✅ Director login successful:', username);
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
        securityLevel: user.securityLevel
      }
    });
    
    // Set HTTP-only cookie
    const maxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    
    response.cookies.set('director-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge,
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    console.error('❌ Director login error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}