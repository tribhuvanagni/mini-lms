import 'dotenv/config';

async function checkModels() {
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  
  try {
    const resp = await fetch(url);
    const data = await resp.json() as any;
    if (data.models) {
      console.log('Available models:');
      data.models.forEach((m: any) => console.log(`- ${m.name}`));
    } else {
      console.log('No models found or error:', JSON.stringify(data));
    }
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

checkModels();
