# AIRouter User Manual
## Complete Guide for End Users

**Version:** 1.0.0  
**Last Updated:** January 2025

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [API Key Management](#api-key-management)
4. [Making Your First API Request](#making-your-first-api-request)
5. [Using the API Playground](#using-the-api-playground)
6. [Understanding Analytics](#understanding-analytics)
7. [Managing Billing & Credits](#managing-billing--credits)
8. [Routing Strategies](#routing-strategies)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)
11. [FAQ](#faq)

---

## Getting Started

### Creating an Account

1. **Navigate to the Registration Page**
   - Open your browser and go to: `http://localhost:3001/register`
   - Or click "Sign up" from the login page

2. **Fill in Your Information**
   - **Full Name**: Enter your full name (e.g., "John Doe")
   - **Email**: Enter a valid email address (e.g., "john@example.com")
   - **Password**: Create a secure password (minimum 6 characters)

3. **Submit Registration**
   - Click the "Sign Up" button
   - You'll see a success message confirming your account creation
   - You'll be redirected to the login page

4. **Verify Your Account**
   - Check your email for a verification link (if email verification is enabled)
   - Your organization is automatically created with your account

### Logging In

1. **Access the Login Page**
   - Go to: `http://localhost:3001/login`
   - Or click "Sign In" from the registration page

2. **Enter Your Credentials**
   - **Email**: Enter the email you used during registration
   - **Password**: Enter your password

3. **Sign In**
   - Click the "Sign In" button
   - You'll be automatically redirected to the dashboard

**Default Demo Account:**
- Email: `demo@airouter.dev`
- Password: `demo123`

### First Login Experience

When you first log in, you'll see:
- **Welcome Message**: Brief introduction to AIRouter
- **Quick Start Guide**: Step-by-step instructions
- **Dashboard Overview**: Your main control panel

---

## Dashboard Overview

The dashboard is your central hub for managing your AI API usage. Here's what you'll find:

### Navigation Menu

Located on the left side of the screen:

- **🏠 Dashboard**: Overview of your usage and statistics
- **🔑 API Keys**: Manage your API keys
- **📊 Analytics**: View detailed usage analytics
- **💰 Billing**: Manage credits and billing
- **🧪 Playground**: Interactive API testing tool
- **⚙️ Settings**: Account and organization settings

### Dashboard Home Page

The main dashboard shows:

1. **Usage Summary Cards**
   - Total Requests: Number of API calls made
   - Total Cost: Amount spent (in cents)
   - Credit Balance: Remaining credits
   - Active API Keys: Number of active keys

2. **Recent Activity**
   - Latest API requests
   - Recent transactions
   - System notifications

3. **Quick Actions**
   - Create new API key
   - View analytics
   - Add credits
   - Test API in playground

4. **Usage Chart**
   - Visual representation of your usage over time
   - Cost breakdown by provider
   - Request volume trends

---

## API Key Management

### What is an API Key?

An API key is a unique identifier that authenticates your requests to the AIRouter API. Think of it as a password for programmatic access.

### Creating Your First API Key

1. **Navigate to API Keys**
   - Click "🔑 API Keys" in the left navigation menu
   - Or go to: `http://localhost:3001/dashboard/keys`

2. **Create New Key**
   - Click the "Create API Key" button
   - Fill in the form:
     - **Name**: Give your key a descriptive name (e.g., "Production Key", "Development Key")
     - **Permissions**: Select permissions (Read, Write, Admin)
     - **Expiration** (Optional): Set an expiration date

3. **Save Your Key**
   - Click "Create"
   - **⚠️ IMPORTANT**: Copy your API key immediately
   - The key will only be shown once for security reasons
   - Format: `sk-air-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

4. **Store Securely**
   - Save the key in a password manager
   - Or in your application's environment variables
   - Never commit API keys to version control

### Managing API Keys

#### Viewing Your Keys

- All your API keys are listed on the API Keys page
- You'll see:
  - Key name
  - Permissions
  - Status (Active/Inactive)
  - Last used date
  - Created date
  - Expiration date (if set)

#### Revoking a Key

1. Find the key you want to revoke
2. Click the "Revoke" or "Delete" button
3. Confirm the action
4. The key will be immediately deactivated

**Note**: Revoked keys cannot be reactivated. You'll need to create a new key.

#### Key Best Practices

- ✅ **Use separate keys** for different environments (development, staging, production)
- ✅ **Set expiration dates** for temporary keys
- ✅ **Rotate keys regularly** for security
- ✅ **Use minimal permissions** (only grant what's needed)
- ❌ **Never share keys** publicly or in code repositories
- ❌ **Don't use the same key** for multiple applications

---

## Making Your First API Request

### Prerequisites

- An active API key (see [API Key Management](#api-key-management))
- A tool to make HTTP requests (curl, Postman, or your application code)

### Basic Request Structure

All API requests follow this pattern:

```bash
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

### Step-by-Step: Your First Request

#### Step 1: Prepare Your Request

**Required Fields:**
- `model`: The model you want to use (e.g., "gpt-3.5-turbo")
- `messages`: Array of conversation messages

**Example:**
```json
{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "user",
      "content": "What is the capital of France?"
    }
  ]
}
```

#### Step 2: Add Authentication

Include your API key in the Authorization header:

```http
Authorization: Bearer sk-air-xxxxxxxxxxxxxxxx
```

#### Step 3: Send the Request

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-air-xxxxxxxxxxxxxxxx" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "What is the capital of France?"}
    ]
  }'
```

**Using JavaScript (Node.js):**
```javascript
const response = await fetch('http://localhost:3000/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk-air-xxxxxxxxxxxxxxxx'
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: 'What is the capital of France?' }
    ]
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

**Using Python:**
```python
import requests

response = requests.post(
    'http://localhost:3000/api/v1/chat/completions',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-air-xxxxxxxxxxxxxxxx'
    },
    json={
        'model': 'gpt-3.5-turbo',
        'messages': [
            {'role': 'user', 'content': 'What is the capital of France?'}
        ]
    }
)

data = response.json()
print(data['choices'][0]['message']['content'])
```

#### Step 4: Understand the Response

A successful response looks like:

```json
{
  "id": "chatcmpl-xxx",
  "model": "gpt-3.5-turbo",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The capital of France is Paris."
      },
      "finishReason": "stop"
    }
  ],
  "usage": {
    "promptTokens": 12,
    "completionTokens": 8,
    "totalTokens": 20
  },
  "provider": "openai",
  "cost": 15,
  "cached": false
}
```

**Key Fields:**
- `choices[0].message.content`: The AI's response
- `usage`: Token usage information
- `cost`: Cost in cents
- `provider`: Which provider was used
- `cached`: Whether the response was served from cache

### Advanced Request Options

#### System Messages

Add a system message to set the AI's behavior:

```json
{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant that speaks like a pirate."
    },
    {
      "role": "user",
      "content": "Tell me about the weather"
    }
  ]
}
```

#### Temperature Control

Control randomness (0.0 = deterministic, 2.0 = very creative):

```json
{
  "model": "gpt-3.5-turbo",
  "messages": [...],
  "temperature": 0.7
}
```

#### Max Tokens

Limit response length:

```json
{
  "model": "gpt-3.5-turbo",
  "messages": [...],
  "maxTokens": 100
}
```

#### Routing Strategy

Choose how requests are routed:

```json
{
  "model": "gpt-3.5-turbo",
  "messages": [...],
  "routingStrategy": "cost"  // Options: "cost", "latency", "priority", "fallback"
}
```

---

## Using the API Playground

The API Playground is an interactive tool for testing API requests without writing code.

### Accessing the Playground

1. Click "🧪 Playground" in the left navigation menu
2. Or go to: `http://localhost:3001/dashboard/playground`

### Playground Interface

The playground has several sections:

1. **Model Selection**
   - Dropdown to select from available models
   - Shows provider for each model
   - Displays model capabilities

2. **Message Editor**
   - Add system messages
   - Add user messages
   - Edit message content
   - Remove messages

3. **Parameters Panel**
   - **Temperature**: Slider (0.0 - 2.0)
   - **Max Tokens**: Input field
   - **Top P**: Slider (0.0 - 1.0)
   - **Frequency Penalty**: Slider (-2.0 - 2.0)
   - **Presence Penalty**: Slider (-2.0 - 2.0)

4. **Routing Options**
   - **Strategy**: Dropdown (Cost, Latency, Priority, Fallback)
   - **Preferred Provider**: Dropdown (if using priority strategy)
   - **Enable Cache**: Toggle switch

5. **Response Display**
   - Shows formatted JSON response
   - Displays cost and token usage
   - Shows which provider was used

### Making a Test Request

1. **Select a Model**
   - Choose from the model dropdown (e.g., "gpt-3.5-turbo")

2. **Add Messages**
   - Click "Add System Message" (optional)
   - Click "Add User Message"
   - Type your question or prompt

3. **Adjust Parameters** (Optional)
   - Set temperature, max tokens, etc.

4. **Choose Routing Strategy** (Optional)
   - Select from dropdown (default: "cost")

5. **Send Request**
   - Click the "Send Request" button
   - Wait for the response

6. **View Results**
   - Response appears in the response panel
   - Check cost and token usage
   - See which provider handled the request

### Playground Features

- **Real-time Testing**: Test requests instantly
- **Cost Estimation**: See estimated cost before sending
- **Response Formatting**: Pretty-printed JSON
- **Copy Response**: Copy response to clipboard
- **Request History**: View previous requests (if enabled)

---

## Understanding Analytics

Analytics help you understand your API usage, costs, and performance.

### Accessing Analytics

1. Click "📊 Analytics" in the left navigation menu
2. Or go to: `http://localhost:3001/dashboard/analytics`

### Analytics Dashboard

#### Summary Cards

- **Total Requests**: All-time request count
- **Total Cost**: Total amount spent (in cents)
- **Average Latency**: Average response time
- **Cache Hit Rate**: Percentage of cached responses

#### Charts and Graphs

1. **Usage Over Time**
   - Line chart showing requests per day/hour
   - Cost over time
   - Token usage trends

2. **Provider Breakdown**
   - Pie chart showing distribution by provider
   - Bar chart comparing provider costs
   - Success rates by provider

3. **Model Usage**
   - Most used models
   - Cost per model
   - Performance by model

4. **Cost Analysis**
   - Daily/weekly/monthly costs
   - Cost trends
   - Cost per provider

#### Time Range Selection

- **Last 24 Hours**: Recent activity
- **Last 7 Days**: Weekly view
- **Last 30 Days**: Monthly view
- **Custom Range**: Select specific dates

#### Exporting Data

1. Click "Export" button
2. Choose format (CSV or JSON)
3. Select time range
4. Download the file

### Understanding Metrics

#### Request Metrics

- **Total Requests**: Number of API calls
- **Successful Requests**: Requests that completed successfully
- **Failed Requests**: Requests that errored
- **Success Rate**: Percentage of successful requests

#### Cost Metrics

- **Total Cost**: Sum of all costs (in cents)
- **Average Cost per Request**: Total cost / requests
- **Cost by Provider**: Breakdown by provider
- **Cost by Model**: Breakdown by model

#### Performance Metrics

- **Average Latency**: Mean response time
- **P50 Latency**: Median response time
- **P95 Latency**: 95th percentile latency
- **P99 Latency**: 99th percentile latency

#### Cache Metrics

- **Cache Hits**: Requests served from cache
- **Cache Misses**: Requests that hit providers
- **Cache Hit Rate**: Percentage of cached requests
- **Cost Savings**: Money saved from caching

---

## Managing Billing & Credits

### Understanding Credits

AIRouter uses a credit-based billing system:
- Credits are prepaid
- Each request deducts credits based on cost
- Credits are measured in cents (1 credit = 1 cent)

### Viewing Your Balance

1. Click "💰 Billing" in the left navigation menu
2. Or go to: `http://localhost:3001/dashboard/billing`

You'll see:
- **Current Balance**: Available credits
- **Formatted Balance**: Human-readable amount (e.g., "$50.00")
- **Plan**: Your current subscription plan

### Adding Credits

1. **Navigate to Billing Page**
   - Click "💰 Billing" in the navigation

2. **Add Credits**
   - Click "Add Credits" button
   - Enter amount (in dollars)
   - Choose payment method (if Stripe is configured)
   - Complete payment

3. **Verify Balance**
   - Your balance updates immediately
   - Transaction appears in history

### Understanding Costs

#### Cost Calculation

Costs are calculated based on:
- **Input Tokens**: Tokens in your request
- **Output Tokens**: Tokens in the response
- **Provider Pricing**: Per-provider token prices

**Formula:**
```
Cost = (Input Tokens × Input Price) + (Output Tokens × Output Price)
```

#### Example Costs

| Model | Input (per 1M) | Output (per 1M) | Example Request Cost |
|-------|----------------|------------------|---------------------|
| GPT-3.5 Turbo | $0.50 | $1.50 | ~$0.00002 |
| GPT-4 | $30.00 | $60.00 | ~$0.0012 |
| Claude 3.5 Sonnet | $3.00 | $15.00 | ~$0.0006 |

### Low Balance Alerts

When your balance is low:
- You'll see a warning in the dashboard
- Email notifications (if configured)
- Requests may be blocked if balance reaches zero

### Usage History

View your transaction history:
- **Credit Additions**: When credits were added
- **Credit Deductions**: Per-request costs
- **Date Range**: Filter by date
- **Export**: Download transaction history

---

## Routing Strategies

AIRouter offers 5 routing strategies to optimize your requests.

### 1. Cost-Optimized Routing

**Best for:** Batch processing, background tasks, cost-sensitive applications

**How it works:**
- Calculates cost for each available provider
- Routes to the cheapest provider
- Considers both input and output token pricing

**Example:**
```json
{
  "model": "gpt-3.5-turbo",
  "messages": [...],
  "routingStrategy": "cost"
}
```

**Benefits:**
- Lowest cost per request
- Automatic cost optimization
- Can save 20-30% on API costs

### 2. Latency-Optimized Routing

**Best for:** Real-time applications, chat interfaces, user-facing features

**How it works:**
- Tracks historical latency per provider
- Routes to the fastest provider
- Updates metrics in real-time

**Example:**
```json
{
  "model": "gpt-4",
  "messages": [...],
  "routingStrategy": "latency"
}
```

**Benefits:**
- Fastest response times
- Better user experience
- Automatic performance optimization

### 3. Priority-Based Routing

**Best for:** Specific provider requirements, compliance needs

**How it works:**
- Uses your preferred provider first
- Falls back to alternatives if preferred provider fails
- Respects provider priority order

**Example:**
```json
{
  "model": "gpt-4",
  "messages": [...],
  "routingStrategy": "priority",
  "preferredProvider": "openai"
}
```

**Benefits:**
- Control over provider selection
- Automatic failover
- Compliance-friendly

### 4. Fallback Routing

**Best for:** Mission-critical systems, high availability requirements

**How it works:**
- Tries providers in sequence
- Automatically retries on failure
- Uses circuit breaker pattern

**Example:**
```json
{
  "model": "gpt-3.5-turbo",
  "messages": [...],
  "routingStrategy": "fallback"
}
```

**Benefits:**
- Maximum reliability
- Automatic failover
- 99.9% uptime guarantee

### 5. Intent-Based Routing

**Best for:** Applications with diverse use cases

**How it works:**
- Analyzes request intent (reasoning, coding, creative)
- Routes to best model for task type
- Uses machine learning for selection

**Example:**
```json
{
  "model": "auto",
  "messages": [...],
  "routingStrategy": "intent"
}
```

**Benefits:**
- Optimal model selection
- Task-specific optimization
- Intelligent routing

### Choosing the Right Strategy

| Use Case | Recommended Strategy |
|----------|---------------------|
| Batch processing | Cost |
| Real-time chat | Latency |
| Compliance requirements | Priority |
| Mission-critical systems | Fallback |
| Diverse applications | Intent |

---

## Best Practices

### API Key Security

1. **Never Commit Keys to Git**
   ```bash
   # Good: Use environment variables
   export AIRouter_API_KEY="sk-air-xxx"
   
   # Bad: Hardcode in source
   const apiKey = "sk-air-xxx"
   ```

2. **Use Environment Variables**
   ```javascript
   // Good
   const apiKey = process.env.AIRouter_API_KEY;
   
   // Bad
   const apiKey = "sk-air-xxx";
   ```

3. **Rotate Keys Regularly**
   - Create new keys every 90 days
   - Revoke old keys after migration
   - Use different keys for different environments

### Cost Optimization

1. **Use Caching**
   ```json
   {
     "enableCache": true  // Default
   }
   ```
   - Cached responses are free
   - Can save 30% on costs

2. **Choose Appropriate Models**
   - Use GPT-3.5 for simple tasks
   - Use GPT-4 only when needed
   - Consider cheaper alternatives

3. **Optimize Prompts**
   - Shorter prompts = lower costs
   - Be specific to reduce token usage
   - Use system messages efficiently

4. **Monitor Usage**
   - Check analytics regularly
   - Set up alerts for high usage
   - Review cost breakdowns

### Performance Optimization

1. **Use Latency Routing for User-Facing Features**
   ```json
   {
     "routingStrategy": "latency"
   }
   ```

2. **Enable Caching for Repeated Requests**
   ```json
   {
     "enableCache": true
   }
   ```

3. **Set Appropriate Timeouts**
   - Don't wait too long for responses
   - Implement retry logic
   - Handle errors gracefully

### Error Handling

1. **Check Response Status**
   ```javascript
   if (response.status === 402) {
     // Insufficient credits
     console.error('Add more credits');
   }
   ```

2. **Handle Rate Limits**
   ```javascript
   if (response.status === 429) {
     // Rate limit exceeded
     const retryAfter = response.headers.get('Retry-After');
     await sleep(retryAfter * 1000);
   }
   ```

3. **Implement Retries**
   ```javascript
   async function makeRequestWithRetry(request, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fetch(request);
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await sleep(1000 * (i + 1)); // Exponential backoff
       }
     }
   }
   ```

### Code Examples

#### JavaScript/Node.js

```javascript
const AIRouter = require('airouter-sdk'); // When SDK is available

const client = new AIRouter({
  apiKey: process.env.AIRouter_API_KEY
});

async function chat(message) {
  const response = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: message }
    ],
    routingStrategy: 'cost',
    temperature: 0.7
  });
  
  return response.choices[0].message.content;
}
```

#### Python

```python
import os
import requests

def chat(message):
    response = requests.post(
        'http://localhost:3000/api/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {os.getenv("AIRouter_API_KEY")}',
            'Content-Type': 'application/json'
        },
        json={
            'model': 'gpt-3.5-turbo',
            'messages': [
                {'role': 'user', 'content': message}
            ],
            'routingStrategy': 'cost',
            'temperature': 0.7
        }
    )
    
    return response.json()['choices'][0]['message']['content']
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Invalid API Key"

**Symptoms:**
- 401 Unauthorized error
- "Invalid or expired API key" message

**Solutions:**
1. Check that you're using the correct API key
2. Verify the key is active in the dashboard
3. Ensure the key hasn't expired
4. Check for extra spaces in the key
5. Create a new key if needed

#### Issue: "Insufficient Credits"

**Symptoms:**
- 402 Payment Required error
- "Insufficient credits" message

**Solutions:**
1. Check your credit balance in the dashboard
2. Add credits if balance is low
3. Review your usage to understand costs
4. Consider using cheaper models
5. Enable caching to reduce costs

#### Issue: "Rate Limit Exceeded"

**Symptoms:**
- 429 Too Many Requests error
- Rate limit headers in response

**Solutions:**
1. Check your rate limit in response headers
2. Wait for the rate limit window to reset
3. Implement exponential backoff
4. Reduce request frequency
5. Consider upgrading your plan

#### Issue: "No Providers Available"

**Symptoms:**
- 503 Service Unavailable error
- "No providers available" message

**Solutions:**
1. Check provider status in health endpoint
2. Try a different model
3. Use fallback routing strategy
4. Wait a few minutes and retry
5. Contact support if issue persists

#### Issue: "Slow Response Times"

**Symptoms:**
- Requests taking longer than expected
- High latency in analytics

**Solutions:**
1. Use latency-optimized routing
2. Enable caching for repeated requests
3. Check provider status
4. Try a different provider
5. Reduce max tokens if not needed

#### Issue: "Unexpected Costs"

**Symptoms:**
- Higher costs than expected
- Rapid credit depletion

**Solutions:**
1. Review analytics for cost breakdown
2. Check which models you're using
3. Enable caching
4. Optimize prompts to reduce tokens
5. Use cost-optimized routing

### Getting Help

1. **Check Documentation**
   - Review this user manual
   - Check API reference documentation
   - Read best practices guide

2. **Use the Playground**
   - Test requests in the playground
   - Verify your API key works
   - Check request/response format

3. **Check Analytics**
   - Review usage patterns
   - Check for errors
   - Monitor costs

4. **Contact Support**
   - Email: support@airouter.dev (example)
   - Include error messages
   - Provide request examples
   - Share relevant logs

---

## FAQ

### General Questions

**Q: What is AIRouter?**  
A: AIRouter is an AI API marketplace that provides unified access to multiple LLM providers through a single API interface.

**Q: Which providers are supported?**  
A: Currently supported: OpenAI, Anthropic, Mistral AI, and Google Gemini. More providers coming soon.

**Q: How many models are available?**  
A: Over 60 models across all providers, from GPT-3.5 to GPT-5, Claude 2.0 to Claude 3.5, and more.

**Q: Is AIRouter free?**  
A: AIRouter offers a free tier with limited requests. Paid plans available for higher usage.

### API Questions

**Q: Is the API compatible with OpenAI?**  
A: Yes! AIRouter's API is OpenAI-compatible, so you can use it as a drop-in replacement.

**Q: Can I use existing OpenAI SDKs?**  
A: Yes, just change the base URL to point to AIRouter.

**Q: How do I handle streaming responses?**  
A: Set `"stream": true` in your request. Responses will be sent as Server-Sent Events (SSE).

**Q: What's the rate limit?**  
A: Rate limits vary by plan. Check response headers for your current limits.

### Billing Questions

**Q: How does billing work?**  
A: AIRouter uses a prepaid credit system. Each request deducts credits based on cost.

**Q: How are costs calculated?**  
A: Costs are based on input/output tokens and provider pricing. See analytics for detailed breakdowns.

**Q: Can I get a refund?**  
A: Contact support for refund requests. Unused credits may be refundable.

**Q: Do cached responses cost money?**  
A: No! Cached responses are free and don't consume credits.

### Technical Questions

**Q: How does routing work?**  
A: AIRouter intelligently routes requests based on your chosen strategy (cost, latency, priority, fallback, or intent).

**Q: What happens if a provider is down?**  
A: AIRouter automatically fails over to alternative providers using circuit breaker patterns.

**Q: How is caching implemented?**  
A: Responses are cached in Redis based on request parameters. Cache TTL is configurable.

**Q: Can I use custom models?**  
A: Custom model hosting is planned for future releases.

### Security Questions

**Q: How secure are API keys?**  
A: API keys are hashed before storage and transmitted over HTTPS only.

**Q: Can I revoke a compromised key?**  
A: Yes, you can revoke keys instantly from the dashboard.

**Q: Is my data encrypted?**  
A: Yes, all data is encrypted in transit (HTTPS) and at rest.

**Q: Who can see my requests?**  
A: Only you and authorized members of your organization can view your requests and analytics.

---

## Additional Resources

### Documentation

- **API Reference**: Complete API documentation
- **Architecture Guide**: System architecture details
- **Best Practices**: Optimization tips
- **Routing Guide**: Detailed routing strategies

### Tools

- **API Playground**: Interactive testing tool
- **Analytics Dashboard**: Usage and cost analytics
- **Health Check**: System status monitoring

### Support

- **Email**: support@airouter.dev (example)
- **Documentation**: `/docs` folder
- **GitHub Issues**: For bug reports
- **Community**: (if available)

---

## Quick Reference

### API Base URL
- Development: `http://localhost:3000`
- Production: `https://api.airouter.dev` (example)

### Authentication Header
```http
Authorization: Bearer sk-air-xxxxxxxxxxxxxxxx
```

### Common Endpoints
- Chat: `POST /api/v1/chat/completions`
- Models: `GET /api/v1/chat/models`
- Analytics: `GET /api/v1/analytics/summary`
- Health: `GET /health`

### Default Credentials
- Email: `demo@airouter.dev`
- Password: `demo123`

---

**Document Version:** 1.0.0  
**Last Updated:** January 2025  
**For technical documentation, see:** `PROJECT_PRESENTATION.md`

