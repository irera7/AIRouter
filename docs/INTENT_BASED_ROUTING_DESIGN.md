# 🎯 BETTER DESIGN: Intent-Based Routing System

## 💡 **Your Insight is Correct!**

**Current Problem:**
```
User: "I want gpt-4o with cost strategy"
System: "gpt-4o only exists on OpenAI, cost strategy is useless"
Result: ❌ Routing strategy adds no value
```

**Better Approach:**
```
User: "I want premium chat with cost strategy"
System: "Premium chat available on OpenAI, Anthropic, Mistral"
        "Comparing costs... Mistral is cheapest"
Result: ✅ Routing strategy actually matters!
```

---

## 🎯 **New System: Request Type Based Routing**

### **Concept:**

Users should specify **WHAT they want to do**, not **WHICH MODEL**.

Then the system picks the best model based on strategy.

---

## 📋 **Request Types (Intents)**

### **1. Chat Request Types:**

```typescript
type ChatRequestType = 
  | 'chat-premium'      // Best quality, any cost
  | 'chat-standard'     // Balanced quality/cost
  | 'chat-fast'         // Speed is priority
  | 'chat-budget'       // Lowest cost
  | 'chat-creative'     // For creative writing
  | 'chat-analytical'   // For data analysis
```

### **2. Specialized Request Types:**

```typescript
type SpecializedRequestType =
  | 'code-generation'   // Writing code
  | 'code-review'       // Reviewing code
  | 'vision-analysis'   // Image understanding
  | 'long-context'      // Large documents
  | 'translation'       // Language translation
  | 'summarization'     // Text summarization
```

---

## 🔧 **Implementation Design**

### **Step 1: Define Intent Mappings**

```typescript
// backend/src/modules/routing/IntentRegistry.ts

interface ModelOption {
  provider: string
  model: string
  pricing: {
    input: number   // per 1M tokens
    output: number  // per 1M tokens
  }
  performance: {
    avgLatency: number  // milliseconds
    quality: number     // 1-10 score
  }
  capabilities: string[]
  contextWindow: number
}

export const INTENT_REGISTRY: Record<string, ModelOption[]> = {
  // Premium Chat - Best quality
  'chat-premium': [
    {
      provider: 'openai',
      model: 'gpt-5',
      pricing: { input: 1.25, output: 10 },
      performance: { avgLatency: 1200, quality: 10 },
      capabilities: ['chat', 'reasoning', 'creative'],
      contextWindow: 128000
    },
    {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      pricing: { input: 3, output: 15 },
      performance: { avgLatency: 1000, quality: 9.5 },
      capabilities: ['chat', 'reasoning', 'analytical'],
      contextWindow: 200000
    },
    {
      provider: 'mistral',
      model: 'mistral-large-latest',
      pricing: { input: 3, output: 9 },
      performance: { avgLatency: 800, quality: 9 },
      capabilities: ['chat', 'multilingual'],
      contextWindow: 32000
    }
  ],

  // Standard Chat - Balanced
  'chat-standard': [
    {
      provider: 'openai',
      model: 'gpt-4o',
      pricing: { input: 2.5, output: 10 },
      performance: { avgLatency: 900, quality: 9 },
      capabilities: ['chat', 'vision', 'audio'],
      contextWindow: 128000
    },
    {
      provider: 'anthropic',
      model: 'claude-3-sonnet-20240229',
      pricing: { input: 3, output: 15 },
      performance: { avgLatency: 850, quality: 8.5 },
      capabilities: ['chat', 'analytical'],
      contextWindow: 200000
    },
    {
      provider: 'mistral',
      model: 'mistral-medium-latest',
      pricing: { input: 2.7, output: 8.1 },
      performance: { avgLatency: 700, quality: 8 },
      capabilities: ['chat'],
      contextWindow: 32000
    }
  ],

  // Fast Chat - Speed priority
  'chat-fast': [
    {
      provider: 'openai',
      model: 'gpt-4o-mini',
      pricing: { input: 0.15, output: 0.6 },
      performance: { avgLatency: 600, quality: 8 },
      capabilities: ['chat', 'fast'],
      contextWindow: 128000
    },
    {
      provider: 'anthropic',
      model: 'claude-3-haiku-20240307',
      pricing: { input: 0.25, output: 1.25 },
      performance: { avgLatency: 500, quality: 7.5 },
      capabilities: ['chat', 'fast'],
      contextWindow: 200000
    },
    {
      provider: 'mistral',
      model: 'mistral-small-latest',
      pricing: { input: 0.2, output: 0.6 },
      performance: { avgLatency: 400, quality: 7 },
      capabilities: ['chat', 'fast'],
      contextWindow: 32000
    }
  ],

  // Budget Chat - Lowest cost
  'chat-budget': [
    {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      pricing: { input: 0.5, output: 1.5 },
      performance: { avgLatency: 700, quality: 7 },
      capabilities: ['chat'],
      contextWindow: 16000
    },
    {
      provider: 'mistral',
      model: 'mistral-tiny',
      pricing: { input: 0.1, output: 0.3 },
      performance: { avgLatency: 300, quality: 6 },
      capabilities: ['chat', 'fast'],
      contextWindow: 32000
    },
    {
      provider: 'openai',
      model: 'gpt-5-nano',
      pricing: { input: 0.05, output: 0.4 },
      performance: { avgLatency: 500, quality: 7.5 },
      capabilities: ['chat', 'fast'],
      contextWindow: 128000
    }
  ],

  // Code Generation
  'code-generation': [
    {
      provider: 'openai',
      model: 'gpt-5-codex',
      pricing: { input: 1.5, output: 12 },
      performance: { avgLatency: 1100, quality: 10 },
      capabilities: ['code', 'reasoning'],
      contextWindow: 128000
    },
    {
      provider: 'mistral',
      model: 'codestral-latest',
      pricing: { input: 0.25, output: 0.25 },
      performance: { avgLatency: 800, quality: 9 },
      capabilities: ['code'],
      contextWindow: 32000
    },
    {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      pricing: { input: 3, output: 15 },
      performance: { avgLatency: 1000, quality: 9.5 },
      capabilities: ['code', 'reasoning'],
      contextWindow: 200000
    }
  ],

  // Vision Analysis
  'vision-analysis': [
    {
      provider: 'openai',
      model: 'gpt-4o',
      pricing: { input: 2.5, output: 10 },
      performance: { avgLatency: 1200, quality: 9 },
      capabilities: ['vision', 'chat'],
      contextWindow: 128000
    },
    {
      provider: 'mistral',
      model: 'pixtral-large-latest',
      pricing: { input: 0.25, output: 0.25 },
      performance: { avgLatency: 900, quality: 8 },
      capabilities: ['vision'],
      contextWindow: 32000
    }
  ],

  // Long Context - For large documents
  'long-context': [
    {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      pricing: { input: 3, output: 15 },
      performance: { avgLatency: 1500, quality: 9.5 },
      capabilities: ['chat', 'long-context'],
      contextWindow: 200000  // 200K tokens!
    },
    {
      provider: 'openai',
      model: 'gpt-4-32k',
      pricing: { input: 60, output: 120 },
      performance: { avgLatency: 2000, quality: 9 },
      capabilities: ['chat', 'long-context'],
      contextWindow: 32000
    }
  ]
}
```

---

## 🔄 **Updated Routing Engine**

```typescript
// backend/src/modules/routing/IntentRouter.ts

export class IntentRouter {
  /**
   * Route by request intent instead of model name
   */
  async routeByIntent(
    intent: string,
    strategy: RoutingStrategy,
    context: any
  ): Promise<RoutingDecision> {
    
    // Get all models that can handle this intent
    const availableModels = INTENT_REGISTRY[intent]
    
    if (!availableModels || availableModels.length === 0) {
      throw new Error(`Unknown intent: ${intent}`)
    }

    let selectedModel: ModelOption
    let reason: string

    // Apply routing strategy
    switch (strategy) {
      case 'cost':
        selectedModel = this.selectByCost(availableModels, context)
        reason = `Lowest cost for ${intent}: $${selectedModel.pricing.input}/$${selectedModel.pricing.output} per 1M tokens`
        break

      case 'latency':
        selectedModel = this.selectByLatency(availableModels)
        reason = `Fastest for ${intent}: ${selectedModel.performance.avgLatency}ms avg latency`
        break

      case 'quality':
        selectedModel = this.selectByQuality(availableModels)
        reason = `Best quality for ${intent}: ${selectedModel.performance.quality}/10 rating`
        break

      case 'priority':
        selectedModel = this.selectByPriority(availableModels, context.preferredProvider)
        reason = `Preferred provider for ${intent}`
        break

      case 'fallback':
        selectedModel = await this.selectByFallback(availableModels)
        reason = `First healthy provider for ${intent}`
        break

      default:
        throw new Error(`Unknown strategy: ${strategy}`)
    }

    // Get provider instance
    const provider = this.providers.get(selectedModel.provider)
    if (!provider) {
      throw new Error(`Provider ${selectedModel.provider} not available`)
    }

    return {
      provider,
      model: selectedModel.model,  // Actual model to use
      strategy,
      reason,
      alternatives: availableModels
        .filter(m => m.provider !== selectedModel.provider)
        .map(m => ({ provider: m.provider, model: m.model }))
    }
  }

  /**
   * Select by cost - NOW ACTUALLY USEFUL!
   */
  private selectByCost(
    models: ModelOption[],
    context: { estimatedInputTokens: number, estimatedOutputTokens: number }
  ): ModelOption {
    const { estimatedInputTokens, estimatedOutputTokens } = context

    // Calculate actual costs for each option
    const costs = models.map(model => {
      const inputCost = (estimatedInputTokens / 1_000_000) * model.pricing.input
      const outputCost = (estimatedOutputTokens / 1_000_000) * model.pricing.output
      const totalCost = inputCost + outputCost

      return { model, totalCost }
    })

    // Sort by cost and return cheapest
    costs.sort((a, b) => a.totalCost - b.totalCost)
    return costs[0].model
  }

  /**
   * Select by latency - NOW ACTUALLY USEFUL!
   */
  private selectByLatency(models: ModelOption[]): ModelOption {
    // Sort by average latency
    const sorted = [...models].sort((a, b) => 
      a.performance.avgLatency - b.performance.avgLatency
    )
    return sorted[0]
  }

  /**
   * Select by quality - NEW STRATEGY!
   */
  private selectByQuality(models: ModelOption[]): ModelOption {
    // Sort by quality rating
    const sorted = [...models].sort((a, b) => 
      b.performance.quality - a.performance.quality
    )
    return sorted[0]
  }

  /**
   * Select by priority - NOW ACTUALLY USEFUL!
   */
  private selectByPriority(
    models: ModelOption[],
    preferredProvider?: string
  ): ModelOption {
    if (preferredProvider) {
      const preferred = models.find(m => m.provider === preferredProvider)
      if (preferred) return preferred
    }
    return models[0]  // First available
  }

  /**
   * Select by fallback - NOW ACTUALLY USEFUL!
   */
  private async selectByFallback(models: ModelOption[]): Promise<ModelOption> {
    // Try each provider in order, checking health
    for (const model of models) {
      const provider = this.providers.get(model.provider)
      if (provider) {
        const health = await provider.healthCheck()
        if (health.isHealthy) {
          return model
        }
      }
    }
    // All failed, return first as fallback
    return models[0]
  }
}
```

---

## 📝 **New API Design**

### **Request Format:**

```typescript
// OLD WAY (model-based - limited value):
{
  "model": "gpt-4o",
  "routingStrategy": "cost",  // ❌ Useless - only OpenAI has gpt-4o
  "messages": [...]
}

// NEW WAY (intent-based - real value):
{
  "intent": "chat-premium",
  "routingStrategy": "cost",  // ✅ Useful - compares GPT-5, Claude, Mistral
  "messages": [...]
}
```

### **Example Requests:**

```json
// Budget-conscious user
{
  "intent": "chat-budget",
  "routingStrategy": "cost",
  "messages": [{"role": "user", "content": "Hello"}]
}
// Result: mistral-tiny ($0.1/$0.3) - cheapest option

// Speed-focused user
{
  "intent": "chat-fast",
  "routingStrategy": "latency",
  "messages": [{"role": "user", "content": "Quick question"}]
}
// Result: mistral-small-latest (400ms) - fastest option

// Quality-focused user
{
  "intent": "chat-premium",
  "routingStrategy": "quality",
  "messages": [{"role": "user", "content": "Complex analysis needed"}]
}
// Result: gpt-5 (10/10 quality) - best option

// Code generation with cost priority
{
  "intent": "code-generation",
  "routingStrategy": "cost",
  "messages": [{"role": "user", "content": "Write a function..."}]
}
// Result: codestral-latest ($0.25) vs gpt-5-codex ($1.5)

// Vision task with speed priority
{
  "intent": "vision-analysis",
  "routingStrategy": "latency",
  "messages": [{"role": "user", "content": "Describe this image"}],
  "images": ["..."]
}
// Result: pixtral-large (900ms) vs gpt-4o (1200ms)
```

---

## 🎮 **Updated Playground UI**

### **New Configuration Section:**

```typescript
// Instead of model selection:

<Select value={requestIntent} onValueChange={setRequestIntent}>
  <SelectTrigger>
    <SelectValue placeholder="What do you want to do?" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Chat</SelectLabel>
      <SelectItem value="chat-premium">Premium Chat (Best Quality)</SelectItem>
      <SelectItem value="chat-standard">Standard Chat (Balanced)</SelectItem>
      <SelectItem value="chat-fast">Fast Chat (Speed Priority)</SelectItem>
      <SelectItem value="chat-budget">Budget Chat (Lowest Cost)</SelectItem>
    </SelectGroup>
    
    <SelectGroup>
      <SelectLabel>Specialized</SelectLabel>
      <SelectItem value="code-generation">Code Generation</SelectItem>
      <SelectItem value="code-review">Code Review</SelectItem>
      <SelectItem value="vision-analysis">Vision Analysis</SelectItem>
      <SelectItem value="long-context">Long Documents</SelectItem>
      <SelectItem value="translation">Translation</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>

// Then show available options:
<div className="grid grid-cols-3 gap-2">
  {intentOptions.map(option => (
    <Card key={option.model}>
      <CardHeader>
        <Badge>{option.provider}</Badge>
        <p className="text-xs">{option.model}</p>
      </CardHeader>
      <CardContent>
        <div className="text-xs">
          <p>Cost: ${option.pricing.input}/${option.pricing.output}</p>
          <p>Speed: {option.performance.avgLatency}ms</p>
          <p>Quality: {option.performance.quality}/10</p>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

---

## 📊 **Comparison: Old vs New**

### **Scenario: User wants cheap chat**

**OLD System:**
```
User: "I want gpt-3.5-turbo with cost strategy"
System: "gpt-3.5-turbo only on OpenAI, cost = $0.5/$1.5"
Result: Uses OpenAI (no comparison, strategy useless)
```

**NEW System:**
```
User: "I want chat-budget with cost strategy"
System: Compares options:
  - gpt-3.5-turbo (OpenAI): $0.5/$1.5
  - mistral-tiny (Mistral): $0.1/$0.3 ← CHEAPEST!
  - gpt-5-nano (OpenAI): $0.05/$0.4 ← EVEN CHEAPER!
Result: Uses gpt-5-nano (truly optimized for cost!)
```

### **Scenario: User wants fast code generation**

**OLD System:**
```
User: "I want codestral-latest with latency strategy"
System: "codestral-latest only on Mistral, latency = 800ms"
Result: Uses Mistral (no comparison, strategy useless)
```

**NEW System:**
```
User: "I want code-generation with latency strategy"
System: Compares options:
  - gpt-5-codex (OpenAI): 1100ms
  - codestral-latest (Mistral): 800ms ← FASTEST!
  - claude-3-5-sonnet (Anthropic): 1000ms
Result: Uses codestral-latest (truly optimized for speed!)
```

---

## ✅ **Benefits of Intent-Based Routing**

### **1. Routing Strategies Actually Work** ⚡
- Cost strategy compares real costs across providers
- Latency strategy compares real speeds across providers
- Quality strategy picks genuinely better models
- Priority and fallback remain useful

### **2. Better User Experience** 🎯
- Users think about "what they want" not "which model"
- System handles provider complexity
- Automatic optimization based on goals

### **3. Future-Proof** 🔮
- Easy to add new models
- Easy to update performance metrics
- Easy to add new intents
- Providers can come and go

### **4. True Cost Optimization** 💰
```
Intent: "chat-budget"
Cost strategy finds: gpt-5-nano ($0.05)
vs manually choosing: gpt-3.5-turbo ($0.5)
Savings: 90% cheaper!
```

### **5. Real Performance Gains** 🚀
```
Intent: "chat-fast"
Latency strategy finds: mistral-tiny (300ms)
vs manually choosing: gpt-4 (1500ms)
Improvement: 5x faster!
```

---

## 🎯 **Implementation Priority**

### **Phase 1: Core Intents (High Priority)**
```
- chat-premium
- chat-standard
- chat-fast
- chat-budget
- code-generation
```

### **Phase 2: Specialized Intents (Medium Priority)**
```
- vision-analysis
- long-context
- translation
- summarization
- creative-writing
```

### **Phase 3: Advanced Features (Low Priority)**
```
- Custom intents (user-defined)
- Dynamic quality ratings
- Real-time cost updates
- A/B testing
```

---

## 🚀 **Migration Strategy**

### **Support Both Systems:**

```typescript
// Accept both formats
interface ChatRequest {
  // NEW: Intent-based (preferred)
  intent?: string
  routingStrategy?: 'cost' | 'latency' | 'quality' | 'priority' | 'fallback'
  
  // OLD: Model-based (legacy)
  model?: string
  provider?: string
}

// Handle both
if (request.intent) {
  // Use intent-based routing (new way)
  return intentRouter.route(request.intent, request.routingStrategy)
} else if (request.model) {
  // Use model-based routing (old way)
  return modelRouter.route(request.model, request.provider)
}
```

---

## 🎉 **Conclusion**

### **You're Absolutely Right!**

**Routing strategies should work on REQUEST TYPE (intent), not model name.**

**Why this is better:**
1. ✅ Routing strategies actually have value (compare real options)
2. ✅ Users think in terms of goals, not models
3. ✅ System can optimize based on strategy
4. ✅ True cost/latency/quality optimization
5. ✅ Future-proof and scalable

**Implementation:**
- Define intent registry with multiple model options
- Route based on intent + strategy
- Provide real comparisons
- Let strategies do their job

**This transforms routing from "mostly useless" to "extremely valuable"!** 🚀

Should we implement this intent-based routing system?

