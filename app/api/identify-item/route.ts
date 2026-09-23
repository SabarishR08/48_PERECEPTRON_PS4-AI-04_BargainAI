import { NextRequest, NextResponse } from 'next/server';
import { identifyItemFromImage } from '@/lib/gemini';

export const maxDuration = 30; // Max allowed execution time for Vercel functions

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { photo, mimeType } = body;

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo is required (base64 string or data URL)' },
        { status: 400 }
      );
    }

    const result = await identifyItemFromImage(photo, mimeType || 'image/jpeg');

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('API /identify-item error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze item image' },
      { status: 500 }
    );
  }
}
