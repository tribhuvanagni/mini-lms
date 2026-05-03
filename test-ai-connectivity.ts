import 'dotenv/config'; // Load .env file
(global as any).__DEV__ = true;

async function runTest() {
  const { getRecommendations, getSimilarCourses } = await import('./src/services/aiRecommendations');
  
  // Verify key exists
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!key) {
    console.error('ERROR: EXPO_PUBLIC_GEMINI_API_KEY is not defined in .env');
    process.exit(1);
  }
  console.log('API Key found (length):', key.length);

  const mockInterests = ['Programming', 'Python'];
  const mockCourses = [
    { id: '1', title: 'The Complete Python Bootcamp', category: 'Programming' },
    { id: '2', title: 'React Native for Beginners', category: 'Mobile' },
    { id: '3', title: 'Data Science with Python', category: 'Data' },
    { id: '4', title: 'UI/UX Design Masterclass', category: 'Design' }
  ];

  console.log('--- STARTING AI LIVE TEST ---');
  
  try {
    console.log('\nTesting Home Recommendations...');
    const homeRecs = await getRecommendations(mockInterests, mockCourses as any);
    console.log('HOME RESULT:', homeRecs);

    console.log('\nTesting Similar Courses (Details Page)...');
    const simRecs = await getSimilarCourses('1', 'The Complete Python Bootcamp', 'Programming');
    console.log('DETAILS RESULT:', JSON.stringify(simRecs, null, 2));

    console.log('\n--- TEST SUCCESSFUL ---');
  } catch (err) {
    console.error('\n--- TEST FAILED ---');
    console.error(err);
    process.exit(1);
  }
}

runTest();
