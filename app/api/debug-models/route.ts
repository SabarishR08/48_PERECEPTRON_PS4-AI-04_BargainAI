import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not set' });
  }

  const keyPreview = `${apiKey.slice(0, 4)}...${apiKey.slice(-4)} (length: ${apiKey.length})`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const status = res.status;
    const body = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        keyPreview,
        status,
        error: body
      });
    }

    const availableModels = (body.models || []).map((m: any) => ({
      name: m.name.replace(/^models\//, ''),
      displayName: m.displayName,
      supportedMethods: m.supportedGenerationMethods
    }));

    return NextResponse.json({
      keyPreview,
      status,
      count: availableModels.length,
      generateContentModels: availableModels
        .filter((m: any) => m.supportedMethods?.includes('generateContent'))
        .map((m: any) => m.name)
    });
  } catch (err: any) {
    return NextResponse.json({
      keyPreview,
      fetchError: err?.message || String(err)
    });
  }
}
