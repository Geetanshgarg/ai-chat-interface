import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Conversation } from '@/lib/models';

// Use Node.js runtime
export const runtime = 'nodejs';

// GET handler to fetch all conversations
export async function GET() {
  try {
    await dbConnect();
    const conversations = await Conversation.find().sort({ updatedAt: -1 });
    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST handler to create a new conversation
export async function POST(req) {
  try {
    const { title, model, messages } = await req.json();
    
    if (!model || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Model and messages are required" },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const conversation = new Conversation({
      title: title || `Conversation ${new Date().toLocaleString()}`,
      model,
      messages
    });
    
    await conversation.save();
    
    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
