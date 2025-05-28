import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Conversation } from '@/lib/models';

// Use Node.js runtime
export const runtime = 'nodejs';

// GET handler to fetch a specific conversation
export async function GET(req, { params }) {
  try {
    const { conversationId } = await params;
    
    await dbConnect();
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ conversation }, { status: 200 });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

// PATCH handler to update a conversation with new messages
export async function PATCH(req, { params }) {
  try {
    const { conversationId } = await params;
    const { messages, title } = await req.json();
    
    await dbConnect();
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }
    
    if (messages) {
      conversation.messages = messages;
    }
    
    if (title) {
      conversation.title = title;
    }
    
    conversation.updatedAt = new Date();
    await conversation.save();
    
    return NextResponse.json({ conversation }, { status: 200 });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a conversation
export async function DELETE(req, { params }) {
  try {
    const { conversationId } = await params;
    
    await dbConnect();
    const conversation = await Conversation.findByIdAndDelete(conversationId);
    
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: "Conversation deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
