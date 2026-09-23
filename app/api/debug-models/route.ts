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

    // Test actual generation on the top models
    const testResults: Record<string, any> = {};
    const testModels = ['gemini-2.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];

    for (const mod of testModels) {
      try {
        const testRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${mod}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello, reply with "OK".' }] }]
          })
        });
        const resBody = await testRes.json();
        testResults[mod] = {
          status: testRes.status,
          ok: testRes.ok,
          reply: resBody?.candidates?.[0]?.content?.parts?.[0]?.text || resBody?.error?.message || resBody
        };
      } catch (e: any) {
        testResults[mod] = { error: e?.message || String(e) };
      }
    }

    return NextResponse.json({
      keyPreview,
      status,
      count: availableModels.length,
      testResults
    });
  } catch (err: any) {
    return NextResponse.json({
      keyPreview,
      fetchError: err?.message || String(err)
    });
  }
}
