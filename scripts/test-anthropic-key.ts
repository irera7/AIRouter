/**
 * Test Anthropic API Key directly
 */

import { config } from 'dotenv';

config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

async function testAnthropicAPI() {
  console.log('🔍 Testing Anthropic API Key...\n');
  console.log('API Key:', ANTHROPIC_API_KEY?.substring(0, 10) + '...' + ANTHROPIC_API_KEY?.substring(ANTHROPIC_API_KEY.length - 4));
  console.log('');

  try {
    // Test: Create a message
    console.log('Test: Creating a message...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: 'Say hello in one word'
        }]
      })
    });
    
    console.log('Status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error:', errorText);
      return;
    }
    
    const result = await response.json();
    console.log('✅ Success!');
    console.log('Response:', result.content?.[0]?.text);
    console.log('');
    console.log('🎉 Anthropic API Key is VALID and working!');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
  }
}

testAnthropicAPI();

