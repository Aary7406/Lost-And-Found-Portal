import { NextResponse } from 'next/server';

// GET /api/ping - Simple health check endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString(),
    server: 'Lost and Found API',
    version: '1.0.0'
  });
}
