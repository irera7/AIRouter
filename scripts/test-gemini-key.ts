/**
 * Test Gemini API Key directly
 */

import { config } from 'dotenv';

config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testGeminiAPI() {
  console.log('🔍 Testing Gemini API Key...\n');
  console.log('API Key:', GEMINI_API_KEY?.substring(0, 10) + '...' + GEMINI_API_KEY?.substring(GEMINI_API_KEY.length - 4));
  console.log('');

  try {
    // Test 1: List models
    console.log('Test 1: Listing available models...');
    const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
    
    console.log('Status:', listResponse.status, listResponse.statusText);
    
    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      console.log('❌ Error:', errorText);
      return;
    }
    
    const models = await listResponse.json();
    console.log('✅ Success! Found', models.models?.length || 0, 'models');
    console.log('Models:', models.models?.slice(0, 3).map((m: any) => m.name).join(', '), '...');
    console.log('');
    
    // Test 2: Generate content
    console.log('Test 2: Generating content...');
    const generateResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Say hello in one word'
            }]
          }]
        })
      }
    );
    
    console.log('Status:', generateResponse.status, generateResponse.statusText);
    
    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.log('❌ Error:', errorText);
      return;
    }
    
    const result = await generateResponse.json();
    console.log('✅ Success!');
    console.log('Response:', result.candidates?.[0]?.content?.parts?.[0]?.text);
    console.log('');
    console.log('🎉 Gemini API Key is VALID and working!');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
  }
}

testGeminiAPI();

