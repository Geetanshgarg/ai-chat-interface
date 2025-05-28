import { NextResponse } from 'next/server';

// Use Node.js runtime
export const runtime = 'nodejs';

// Define a max image size (5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// Allowed image MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

export async function POST(req) {
  try {
    const formData = await req.formData();
    const image = formData.get('image');
    
    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Validate file size
    if (image.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: `Image size exceeds maximum allowed size of ${MAX_IMAGE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }
    
    // Determine the MIME type based on file extension
    const filename = image.name.toLowerCase();
    let mimeType = image.type || 'image/jpeg'; // Use the detected MIME type or default to jpeg
    
    // Validate allowed extensions and MIME types
    if (filename.endsWith('.png')) {
      mimeType = 'image/png';
    } else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      mimeType = 'image/jpeg';
    } else if (filename.endsWith('.gif')) {
      mimeType = 'image/gif';
    } else if (filename.endsWith('.webp')) {
      mimeType = 'image/webp';
    } else {
      return NextResponse.json(
        { error: "Unsupported image format. Please use JPG, PNG, GIF, or WEBP." },
        { status: 400 }
      );
    }
    
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: "Unsupported image format. Please use JPG, PNG, GIF, or WEBP." },
        { status: 400 }
      );
    }

    // Convert image to base64
    try {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = buffer.toString('base64');
      
      // Construct the base64 string with MIME type prefix
      const base64String = `data:${mimeType};base64,${base64Image}`;
      
      return NextResponse.json({ 
        success: true, 
        imageData: base64String 
      }, { status: 200 });
    } catch (conversionError) {
      console.error("Error converting image to base64:", conversionError);
      return NextResponse.json(
        { error: "Failed to convert image to base64 format" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
