/**
 * Direct API key test - without using the provider classes
 */

// Test Anthropic API
async function testAnthropicDirect() {
  console.log('\n🔍 Testing Anthropic API Key (Direct)...');
  
  const apiKey = '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';
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Say test' }],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Anthropic API key is WORKING!');
      console.log(`   Model: ${data.model}`);
      console.log(`   Response: ${data.content[0]?.text}`);
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ Anthropic API key FAILED');
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Error: ${errorText.substring(0, 300)}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Anthropic request FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Test Mistral API
async function testMistralDirect() {
  console.log('\n🔍 Testing Mistral API Key (Direct)...');
  
  const apiKey = 'xcVU5xqJH4UlvN6o7O1vjUrZyywmboR4';
  
  try {
    const response = await fetch('https://api.mistral.ai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Mistral API key is WORKING!');
      console.log(`   Available models: ${data.data?.length || 0}`);
      if (data.data && data.data.length > 0) {
        console.log(`   Sample models: ${data.data.slice(0, 3).map(m => m.id).join(', ')}`);
      }
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ Mistral API key FAILED');
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Error: ${errorText.substring(0, 300)}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Mistral request FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Test OpenAI API
async function testOpenAIDirect() {
  console.log('\n🔍 Testing OpenAI API Key (Direct)...');
  
  const apiKey = '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';
  
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ OpenAI API key is WORKING!');
      console.log(`   Available models: ${data.data?.length || 0}`);
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ OpenAI API key FAILED');
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Error: ${errorText.substring(0, 300)}`);
      return false;
    }
  } catch (error) {
    console.log('❌ OpenAI request FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 Direct API Keys Test (No Provider Classes)');
  console.log('='.repeat(60));
  
  const results = {
    openai: await testOpenAIDirect(),
    anthropic: await testAnthropicDirect(),
    mistral: await testMistralDirect(),
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results Summary:');
  console.log(`   OpenAI:    ${results.openai ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`   Anthropic: ${results.anthropic ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`   Mistral:   ${results.mistral ? '✅ WORKING' : '❌ FAILED'}`);
  console.log('='.repeat(60));
}

main();

