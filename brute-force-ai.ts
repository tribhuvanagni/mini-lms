import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function findWorkingModel() {
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;
  const genAI = new GoogleGenerativeAI(key);
  
  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-pro'];
  
  for (const modelName of models) {
    console.log(`Trying model: ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('List 1 course for Python.');
      const text = result.response.text();
      if (text) {
        console.log(`✅ SUCCESS with ${modelName}!`);
        console.log(`Result: ${text}`);
        return modelName;
      }
    } catch (err: any) {
      console.log(`❌ Failed ${modelName}: ${err.message.substring(0, 50)}...`);
    }
  }
  return null;
}

findWorkingModel().then(winner => {
  if (winner) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});
