import 'dotenv/config';

async function bypassTest() {
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`;
  
  const payload = {
    contents: [{ parts: [{ text: 'List 1 course for Python.' }] }]
  };

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await resp.json() as any;
    if (data.candidates) {
      console.log('✅ BYPASS SUCCESS!');
      console.log('Result:', data.candidates[0].content.parts[0].text);
    } else {
      console.log('❌ Bypass Failed:', JSON.stringify(data));
    }
  } catch (err) {
    console.log('Fetch failed');
  }
}

bypassTest();
