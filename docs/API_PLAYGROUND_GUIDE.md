# 🎮 API Playground - User Guide

## Overview

The **API Playground** is a visual testing interface that allows you to test your unified AI API with all available providers and models directly from your browser.

## Features

### ✨ Main Features

1. **Visual Testing Interface**
   - No code required - test APIs through a user-friendly UI
   - Real-time response display
   - Conversation history tracking
   - Copy responses and cURL commands

2. **Provider Selection**
   - **Manual Selection**: Choose specific provider and model
   - **Smart Routing**: Let AIRouter choose the best provider based on:
     - Cost optimization
     - Latency optimization
     - Priority-based routing
     - Fallback chain

3. **Advanced Settings**
   - **Temperature**: Control randomness (0-2)
   - **Max Tokens**: Set response length limit (1-4000)
   - **System Message**: Define AI behavior and personality

4. **Real-Time Metrics**
   - Response latency in milliseconds
   - Token usage (prompt, completion, total)
   - Estimated cost per request
   - Provider pricing information

## How to Use

### Step 1: Access the Playground

Navigate to **Dashboard → API Playground** in the sidebar menu.

### Step 2: Configure Your Request

#### Routing Strategy
Choose how AIRouter selects providers:

- **Manual Selection**: Select a specific provider (OpenAI, Mistral, Anthropic, Mock)
- **Cost Optimized**: Automatically select the cheapest option
- **Latency Optimized**: Select the fastest provider
- **Priority Based**: Use configured priority rankings
- **Fallback Chain**: Try multiple providers if one fails

#### Select Provider & Model (Manual Mode)
- Choose from available providers: OpenAI, Mistral AI, Anthropic, Mock
- Select the specific model (e.g., `gpt-3.5-turbo`, `mistral-small`, `claude-3-haiku`)

#### Advanced Settings (Optional)
Click "Show Advanced Settings" to adjust:

**Temperature** (0-2):
- Lower (0-0.5): More focused and deterministic
- Medium (0.7-1.0): Balanced creativity
- Higher (1.0-2.0): More random and creative

**Max Tokens** (1-4000):
- Controls the maximum length of the response
- Higher values allow longer responses but cost more

### Step 3: Compose Your Message

#### System Message (Optional)
Define the AI's behavior, personality, or role:
```
You are a helpful coding assistant specialized in Python.
```

#### Your Message
Type your question or prompt:
```
Explain what a recursive function is with an example.
```

### Step 4: Send Request

Click **Send Request** or press:
- **Mac**: `Cmd + Enter`
- **Windows/Linux**: `Ctrl + Enter`

### Step 5: View Response

The playground displays:
- **AI Response**: The generated text
- **Metrics**:
  - ⏱️ Latency (response time in ms)
  - ⚡ Token usage (prompt + completion = total)
  - 💵 Cost (estimated based on provider pricing)

### Step 6: Continue Conversation

The playground maintains conversation history:
- Previous messages are shown above
- Click "Clear" to start a new conversation
- Conversation context is included in subsequent requests

### Step 7: Export cURL Command

Copy the equivalent cURL command to use in your applications:
- Click **Copy** button in the "cURL Command" section
- Use it in your terminal, scripts, or documentation

## Available Providers

### 🤖 OpenAI
**Models:**
- `gpt-4` - Most capable model
- `gpt-4-turbo` - Faster GPT-4 variant
- `gpt-3.5-turbo` - Fast and cost-effective

**Pricing:** $30 input / $60 output per 1M tokens

**Status:** ✅ Active

### 🚀 Mistral AI
**Models:**
- `mistral-tiny` - Smallest, fastest
- `mistral-small` - Good balance
- `mistral-medium` - More capable
- `mistral-large` - Most advanced
- `mixtral-8x7b` - Mixture of experts
- `mixtral-8x22b` - Larger mixture model

**Pricing:** $6 input / $18 output per 1M tokens

**Status:** ✅ Active

### 🧠 Anthropic
**Models:**
- `claude-3-opus` - Most capable
- `claude-3-sonnet` - Balanced
- `claude-3-haiku` - Fast and efficient

**Pricing:** $15 input / $75 output per 1M tokens

**Status:** ⚠️ API key needs configuration

### 🎭 Mock Provider (Testing)
**Models:**
- `mock-gpt-4` - Simulates GPT-4
- `mock-claude-3` - Simulates Claude

**Pricing:** FREE

**Status:** ✅ Active (for testing only)

## Routing Strategies Explained

### 1. Manual Selection
You choose the exact provider and model. Use this when:
- Testing specific provider capabilities
- Debugging provider issues
- Comparing provider outputs

### 2. Cost Optimized
AIRouter automatically selects the cheapest provider that supports your model:
- Best for: High-volume applications, cost-sensitive workloads
- Considers: Token pricing, model availability

### 3. Latency Optimized
Selects the fastest responding provider:
- Best for: Real-time applications, user-facing chatbots
- Considers: Historical response times, current load

### 4. Priority Based
Uses configured priority rankings:
- Best for: Custom business logic, compliance requirements
- Considers: Provider priority settings in database

### 5. Fallback Chain
Tries multiple providers in sequence if one fails:
- Best for: High availability, mission-critical applications
- Considers: Provider health, failure rates

## Tips & Best Practices

### 💡 Testing Tips

1. **Start with Mock Provider**
   - Test your setup without consuming real credits
   - Verify your API key is working

2. **Use Conversation History**
   - Build complex multi-turn conversations
   - Test context understanding

3. **Compare Providers**
   - Test same prompt with different providers
   - Compare response quality, speed, and cost

4. **Adjust Temperature**
   - Lower for factual/coding tasks
   - Higher for creative writing

### ⚡ Performance Tips

1. **Optimize Token Usage**
   - Keep prompts concise
   - Use appropriate max_tokens limits
   - Clear conversation history when starting new topics

2. **Choose Right Provider**
   - OpenAI: Best for general tasks
   - Mistral: Cost-effective alternative
   - Claude: Strong reasoning capabilities

3. **Use Cost Routing**
   - Let AIRouter choose cheapest option
   - Monitor spending in Analytics

### 🔒 Security Notes

1. **API Key Storage**
   - Your API key is stored in browser localStorage
   - Never share screenshots with API keys visible
   - Rotate keys regularly in API Keys section

2. **Sensitive Data**
   - Don't test with real user data
   - Use placeholder/anonymized information
   - Review your organization's data policies

## Troubleshooting

### ❌ "Invalid or expired API key"
**Solution:**
1. Go to **API Keys** section
2. Create a new API key
3. The playground will automatically use it

### ❌ "Provider not available"
**Solution:**
1. Check provider status in Configuration panel
2. Verify provider API keys in `.env` file
3. Check backend logs for initialization errors

### ❌ "Rate limit exceeded"
**Solution:**
1. Wait for rate limit reset (shown in error message)
2. Check your rate limits in Settings
3. Upgrade your plan for higher limits

### ❌ "Insufficient credits"
**Solution:**
1. Check credit balance in Billing section
2. Add credits to your organization
3. Contact admin if you're not the owner

## Keyboard Shortcuts

- `Cmd/Ctrl + Enter`: Send request
- `Esc`: Clear current message (when focused)

## Example Use Cases

### 1. Code Generation
```
System: You are an expert Python programmer.
User: Write a function to calculate fibonacci numbers.
```

### 2. Content Writing
```
System: You are a creative copywriter.
User: Write a catchy tagline for an AI routing platform.
```

### 3. Data Analysis
```
System: You are a data analyst.
User: Explain the significance of p-value < 0.05 in simple terms.
```

### 4. Translation
```
System: You are a professional translator.
User: Translate "Hello, how are you?" to Spanish, French, and German.
```

## Next Steps

- ✅ Test your API with different providers
- ✅ Experiment with routing strategies
- ✅ Copy cURL commands for your applications
- ✅ Monitor usage in Analytics dashboard
- ✅ Integrate the API into your applications

---

## Need Help?

- 📚 Check the [API Documentation](/docs)
- 🔧 View [Interactive API Reference](http://localhost:3000/docs)
- 💬 Contact support through Settings

---

**Happy Testing! 🚀**

