import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

// Use Node.js runtime
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Try connecting to the database
    await dbConnect();
    
    return NextResponse.json(
      { 
        status: 'success', 
        message: 'MongoDB connection successful!', 
        timestamp: new Date().toISOString() 
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("MongoDB connection test failed:", error);
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to connect to MongoDB', 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
