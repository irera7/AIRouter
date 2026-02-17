/**
 * Intent Registry
 * Maps user intents to available model options across providers
 * Enables true intelligent routing based on user goals
 */

export interface ModelOption {
  provider: string
  model: string
  pricing: {
    input: number   // USD per 1M tokens
    output: number  // USD per 1M tokens
  }
  performance: {
    avgLatency: number  // milliseconds (typical)
    quality: number     // 1-10 subjective rating
  }
  capabilities: string[]
  contextWindow: number  // tokens
  description?: string
}

/**
 * Intent Registry
 * Maps user intents to available model options
 */
export const INTENT_REGISTRY: Record<string, ModelOption[]> = {
  /**
   * CHAT INTENTS
   */

  // Premium Chat - Best quality, any cost
  'chat-premium': [
    {
      provider: 'openai',
      model: 'gpt-5',
      pricing: { input: 1.25, output: 10 },
      performance: { avgLatency: 1200, quality: 10 },
      capabilities: ['chat', 'reasoning', 'creative', 'analytical'],
      contextWindow: 128000,
      description: 'Most advanced GPT model with deep reasoning'
    },
    {
      provider: 'openai',
      model: 'gpt-5-pro',
      pricing: { input: 15, output: 120 },
      performance: { avgLatency: 2000, quality: 10 },
      capabilities: ['chat', 'reasoning', 'complex-analysis'],
      contextWindow: 128000,
      description: 'Ultimate reasoning for extremely complex tasks'
    },
    {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      pricing: { input: 3, output: 15 },
      performance: { avgLatency: 1000, quality: 9.5 },
      capabilities: ['chat', 'reasoning', 'analytical', 'long-context'],
      contextWindow: 200000,
      description: 'Enhanced Claude with excellent reasoning and 200K context'
    },
    {
      provider: 'openai',
      model: 'o1-preview',
      pricing: { input: 15, output: 60 },
      performance: { avgLatency: 2000, quality: 9.8 },
      capabilities: ['chat', 'reasoning', 'complex-analysis'],
      contextWindow: 128000,
      description: 'Advanced reasoning model for complex tasks'
    },
    {
      provider: 'mistral',
      model: 'mistral-large-latest',
      pricing: { input: 3, output: 9 },
      performance: { avgLatency: 800, quality: 9 },
      capabilities: ['chat', 'multilingual', 'reasoning'],
      contextWindow: 32000,
      description: 'Mistral\'s flagship model with strong multilingual support'
    }
  ],

  // Standard Chat - Balanced quality and cost
  'chat-standard': [
    {
      provider: 'openai',
      model: 'gpt-4o',
      pricing: { input: 2.5, output: 10 },
      performance: { avgLatency: 900, quality: 9 },
      capabilities: ['chat', 'vision', 'audio', 'multimodal'],
      contextWindow: 128000,
      description: 'Multimodal GPT-4 with vision and audio'
    },
    {
      provider: 'gemini',
      model: 'gemini-1.5-pro-latest',
      pricing: { input: 1.25, output: 5 },
      performance: { avgLatency: 850, quality: 8.8 },
      capabilities: ['chat', 'reasoning', 'multimodal', 'long-context'],
      contextWindow: 2000000,
      description: 'Google\'s advanced model with 2M context window'
    },
    {
      provider: 'openai',
      model: 'gpt-5-mini',
      pricing: { input: 0.15, output: 0.6 },
      performance: { avgLatency: 700, quality: 8.3 },
      capabilities: ['chat', 'reasoning', 'fast'],
      contextWindow: 128000,
      description: 'Excellent balance of quality and speed'
    },
    {
      provider: 'anthropic',
      model: 'claude-3-sonnet-20240229',
      pricing: { input: 3, output: 15 },
      performance: { avgLatency: 850, quality: 8.5 },
      capabilities: ['chat', 'analytical', 'long-context'],
      contextWindow: 200000,
      description: 'Balanced Claude with good analytical abilities'
    },
    {
      provider: 'mistral',
      model: 'mistral-medium-latest',
      pricing: { input: 2.7, output: 8.1 },
      performance: { avgLatency: 700, quality: 8 },
      capabilities: ['chat', 'multilingual'],
      contextWindow: 32000,
      description: 'Mid-tier Mistral with solid performance'
    }
  ],

  // Fast Chat - Speed is priority
  'chat-fast': [
    {
      provider: 'gemini',
      model: 'gemini-1.5-flash-latest',
      pricing: { input: 0.075, output: 0.3 },
      performance: { avgLatency: 350, quality: 7.5 },
      capabilities: ['chat', 'fast', 'multimodal'],
      contextWindow: 1000000,
      description: 'Fast Gemini with 1M context window'
    },
    {
      provider: 'mistral',
      model: 'mistral-small-latest',
      pricing: { input: 0.2, output: 0.6 },
      performance: { avgLatency: 400, quality: 7 },
      capabilities: ['chat', 'fast', 'multilingual'],
      contextWindow: 32000,
      description: 'Fast and affordable with good quality'
    },
    {
      provider: 'mistral',
      model: 'mistral-tiny',
      pricing: { input: 0.1, output: 0.3 },
      performance: { avgLatency: 300, quality: 6 },
      capabilities: ['chat', 'fast'],
      contextWindow: 32000,
      description: 'Fastest response time, lowest cost'
    },
    {
      provider: 'openai',
      model: 'gpt-5-mini',
      pricing: { input: 0.15, output: 0.6 },
      performance: { avgLatency: 600, quality: 8 },
      capabilities: ['chat', 'fast', 'multimodal'],
      contextWindow: 128000,
      description: 'Fast GPT-4 variant with multimodal support'
    },
    {
      provider: 'anthropic',
      model: 'claude-3-haiku-20240307',
      pricing: { input: 0.25, output: 1.25 },
      performance: { avgLatency: 500, quality: 7.5 },
      capabilities: ['chat', 'fast', 'long-context'],
      contextWindow: 200000,
      description: 'Fast Claude with 200K context window'
    },
    {
      provider: 'openai',
      model: 'gpt-5-nano',
      pricing: { input: 0.5, output: 1.5 },
      performance: { avgLatency: 700, quality: 7 },
      capabilities: ['chat'],
      contextWindow: 16000,
      description: 'Classic fast model, widely used'
    }
  ],

  // Budget Chat - Lowest cost
  'chat-budget': [
    {
      provider: 'gemini',
      model: 'gemini-1.5-flash-8b',
      pricing: { input: 0.0375, output: 0.15 },
      performance: { avgLatency: 300, quality: 6.5 },
      capabilities: ['chat', 'fast', 'budget'],
      contextWindow: 1000000,
      description: 'Ultra-cheap Gemini with 1M context'
    },
    {
      provider: 'openai',
      model: 'gpt-5-nano',
      pricing: { input: 0.5, output: 1.5 },
      performance: { avgLatency: 700, quality: 7 },
      capabilities: ['chat'],
      contextWindow: 16000,
      description: 'Reliable budget option'
    },
    {
      provider: 'openai',
      model: 'gpt-5-mini',
      pricing: { input: 0.15, output: 0.6 },
      performance: { avgLatency: 500, quality: 8 },
      capabilities: ['chat', 'fast', 'vision'],
      contextWindow: 128000,
      description: 'Affordable GPT-4o variant'
    },
    {
      provider: 'mistral',
      model: 'mistral-small-latest',
      pricing: { input: 0.2, output: 0.6 },
      performance: { avgLatency: 400, quality: 7 },
      capabilities: ['chat', 'multilingual', 'budget'],
      contextWindow: 32000,
      description: 'Good quality at low cost'
    },
    {
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      pricing: { input: 0.075, output: 0.3 },
      performance: { avgLatency: 400, quality: 7.5 },
      capabilities: ['chat', 'fast', 'multimodal'],
      contextWindow: 1000000,
      description: 'Fast and cheap with huge context'
    }
  ],

  /**
   * SPECIALIZED INTENTS
   */

  // Code Generation
  'code-generation': [
    {
      provider: 'openai',
      model: 'gpt-5-codex',
      pricing: { input: 1.5, output: 12 },
      performance: { avgLatency: 1100, quality: 10 },
      capabilities: ['code', 'reasoning', 'debugging'],
      contextWindow: 128000,
      description: 'Specialized code model with RL training'
    },
    {
      provider: 'mistral',
      model: 'codestral-latest',
      pricing: { input: 0.25, output: 0.25 },
      performance: { avgLatency: 800, quality: 9 },
      capabilities: ['code', 'fast'],
      contextWindow: 32000,
      description: 'Excellent code generation at low cost'
    },
    {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      pricing: { input: 3, output: 15 },
      performance: { avgLatency: 1000, quality: 9.5 },
      capabilities: ['code', 'reasoning', 'review'],
      contextWindow: 200000,
      description: 'Strong coding with excellent reasoning'
    },
    {
      provider: 'openai',
      model: 'gpt-5',
      pricing: { input: 1.25, output: 10 },
      performance: { avgLatency: 1200, quality: 9.5 },
      capabilities: ['code', 'reasoning'],
      contextWindow: 128000,
      description: 'General GPT-5 with strong coding'
    },
    {
      provider: 'mistral',
      model: 'codestral-mamba-latest',
      pricing: { input: 0.25, output: 0.25 },
      performance: { avgLatency: 700, quality: 8.5 },
      capabilities: ['code', 'fast', 'efficient'],
      contextWindow: 32000,
      description: 'Mamba architecture optimized for code'
    }
  ],

  // Code Review
  'code-review': [
    {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      pricing: { input: 3, output: 15 },
      performance: { avgLatency: 1000, quality: 9.5 },
      capabilities: ['code', 'review', 'analytical', 'long-context'],
      contextWindow: 200000,
      description: 'Best for thorough code review with long context'
    },
    {
      provider: 'openai',
      model: 'gpt-5',
      pricing: { input: 1.25, output: 10 },
      performance: { avgLatency: 1200, quality: 9 },
      capabilities: ['code', 'review', 'reasoning'],
      contextWindow: 128000,
      description: 'Deep reasoning for code analysis'
    },
    {
      provider: 'openai',
      model: 'gpt-5',
      pricing: { input: 2.5, output: 10 },
      performance: { avgLatency: 900, quality: 8.5 },
      capabilities: ['code', 'review'],
      contextWindow: 128000,
      description: 'Fast and capable code review'
    }
  ],

  // Vision Analysis
  'vision-analysis': [
    {
      provider: 'gemini',
      model: 'gemini-1.5-pro-latest',
      pricing: { input: 1.25, output: 5 },
      performance: { avgLatency: 900, quality: 8.8 },
      capabilities: ['vision', 'chat', 'multimodal', 'long-context'],
      contextWindow: 2000000,
      description: 'Excellent vision with massive context window'
    },
    {
      provider: 'openai',
      model: 'gpt-4o',
      pricing: { input: 2.5, output: 10 },
      performance: { avgLatency: 1200, quality: 9 },
      capabilities: ['vision', 'chat', 'multimodal'],
      contextWindow: 128000,
      description: 'Advanced vision understanding with GPT-4'
    },
    {
      provider: 'mistral',
      model: 'pixtral-large-latest',
      pricing: { input: 0.25, output: 0.25 },
      performance: { avgLatency: 900, quality: 8 },
      capabilities: ['vision', 'fast'],
      contextWindow: 32000,
      description: 'Cost-effective vision analysis'
    },
    {
      provider: 'mistral',
      model: 'pixtral-12b-2409',
      pricing: { input: 0.25, output: 0.25 },
      performance: { avgLatency: 700, quality: 7 },
      capabilities: ['vision', 'fast', 'budget'],
      contextWindow: 32000,
      description: 'Fast and cheap vision model'
    },
    {
      provider: 'openai',
      model: 'gpt-4-vision-preview',
      pricing: { input: 10, output: 30 },
      performance: { avgLatency: 1500, quality: 8.5 },
      capabilities: ['vision', 'chat'],
      contextWindow: 128000,
      description: 'Original GPT-4 vision model'
    }
  ],

  // Long Context - For large documents
  'long-context': [
    {
      provider: 'gemini',
      model: 'gemini-1.5-pro-latest',
      pricing: { input: 1.25, output: 5 },
      performance: { avgLatency: 1500, quality: 9 },
      capabilities: ['chat', 'long-context', 'reasoning'],
      contextWindow: 2000000,
      description: '2M context window - largest available!'
    },
    {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      pricing: { input: 3, output: 15 },
      performance: { avgLatency: 1500, quality: 9.5 },
      capabilities: ['chat', 'long-context', 'analytical'],
      contextWindow: 200000,
      description: '200K context window - best for long documents'
    },
    {
      provider: 'anthropic',
      model: 'claude-3-sonnet-20240229',
      pricing: { input: 3, output: 15 },
      performance: { avgLatency: 1300, quality: 8.5 },
      capabilities: ['chat', 'long-context'],
      contextWindow: 200000,
      description: '200K context, good for analysis'
    },
    {
      provider: 'anthropic',
      model: 'claude-3-haiku-20240307',
      pricing: { input: 0.25, output: 1.25 },
      performance: { avgLatency: 800, quality: 7.5 },
      capabilities: ['chat', 'long-context', 'fast'],
      contextWindow: 200000,
      description: 'Fast processing of long documents'
    },
    {
      provider: 'openai',
      model: 'gpt-4-32k',
      pricing: { input: 60, output: 120 },
      performance: { avgLatency: 2000, quality: 9 },
      capabilities: ['chat', 'long-context'],
      contextWindow: 32000,
      description: '32K context window (expensive)'
    },
    {
      provider: 'openai',
      model: 'gpt-5',
      pricing: { input: 2.5, output: 10 },
      performance: { avgLatency: 900, quality: 9 },
      capabilities: ['chat', 'long-context'],
      contextWindow: 128000,
      description: '128K context at good price'
    }
  ],

  // Creative Writing
  'creative-writing': [
    {
      provider: 'openai',
      model: 'gpt-5',
      pricing: { input: 1.25, output: 10 },
      performance: { avgLatency: 1200, quality: 10 },
      capabilities: ['creative', 'chat', 'reasoning'],
      contextWindow: 128000,
      description: 'Most creative and expressive model'
    },
    {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      pricing: { input: 3, output: 15 },
      performance: { avgLatency: 1000, quality: 9.5 },
      capabilities: ['creative', 'chat', 'narrative'],
      contextWindow: 200000,
      description: 'Excellent for narrative and storytelling'
    },
    {
      provider: 'anthropic',
      model: 'claude-3-opus-20240229',
      pricing: { input: 15, output: 75 },
      performance: { avgLatency: 1500, quality: 9.5 },
      capabilities: ['creative', 'chat', 'nuanced'],
      contextWindow: 200000,
      description: 'Most nuanced and creative Claude'
    },
    {
      provider: 'openai',
      model: 'gpt-5',
      pricing: { input: 2.5, output: 10 },
      performance: { avgLatency: 900, quality: 8.5 },
      capabilities: ['creative', 'chat'],
      contextWindow: 128000,
      description: 'Good creative abilities, faster'
    }
  ],

  // Translation
  'translation': [
    {
      provider: 'mistral',
      model: 'mistral-large-latest',
      pricing: { input: 3, output: 9 },
      performance: { avgLatency: 800, quality: 9 },
      capabilities: ['multilingual', 'translation'],
      contextWindow: 32000,
      description: 'Best multilingual support'
    },
    {
      provider: 'mistral',
      model: 'mistral-small-latest',
      pricing: { input: 0.2, output: 0.6 },
      performance: { avgLatency: 400, quality: 7.5 },
      capabilities: ['multilingual', 'translation', 'fast'],
      contextWindow: 32000,
      description: 'Fast and affordable translation'
    },
    {
      provider: 'openai',
      model: 'gpt-5',
      pricing: { input: 1.25, output: 10 },
      performance: { avgLatency: 1200, quality: 9 },
      capabilities: ['multilingual', 'translation'],
      contextWindow: 128000,
      description: 'High quality translation'
    },
    {
      provider: 'openai',
      model: 'gpt-5',
      pricing: { input: 2.5, output: 10 },
      performance: { avgLatency: 900, quality: 8.5 },
      capabilities: ['multilingual', 'translation'],
      contextWindow: 128000,
      description: 'Good translation, faster'
    }
  ],

  // Summarization
  'summarization': [
    {
      provider: 'anthropic',
      model: 'claude-3-haiku-20240307',
      pricing: { input: 0.25, output: 1.25 },
      performance: { avgLatency: 500, quality: 7.5 },
      capabilities: ['summarization', 'fast', 'long-context'],
      contextWindow: 200000,
      description: 'Fast summarization with long context'
    },
    {
      provider: 'openai',
      model: 'gpt-5-mini',
      pricing: { input: 0.25, output: 2 },
      performance: { avgLatency: 700, quality: 8.5 },
      capabilities: ['summarization', 'fast'],
      contextWindow: 128000,
      description: 'Good quality summaries, affordable'
    },
    {
      provider: 'openai',
      model: 'gpt-5-nano',
      pricing: { input: 0.05, output: 0.4 },
      performance: { avgLatency: 500, quality: 7 },
      capabilities: ['summarization', 'fast', 'budget'],
      contextWindow: 128000,
      description: 'Ultra-cheap summarization'
    },
    {
      provider: 'mistral',
      model: 'mistral-small-latest',
      pricing: { input: 0.2, output: 0.6 },
      performance: { avgLatency: 400, quality: 7 },
      capabilities: ['summarization', 'fast'],
      contextWindow: 32000,
      description: 'Fast and cheap summaries'
    }
  ],

  // Data Analysis
  'data-analysis': [
    {
      provider: 'openai',
      model: 'o1-preview',
      pricing: { input: 15, output: 120 },
      performance: { avgLatency: 2000, quality: 10 },
      capabilities: ['analytical', 'reasoning', 'complex'],
      contextWindow: 128000,
      description: 'Best for complex data analysis'
    },
    {
      provider: 'openai',
      model: 'gpt-5',
      pricing: { input: 1.25, output: 10 },
      performance: { avgLatency: 1200, quality: 9.5 },
      capabilities: ['analytical', 'reasoning'],
      contextWindow: 128000,
      description: 'Strong analytical reasoning'
    },
    {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      pricing: { input: 3, output: 15 },
      performance: { avgLatency: 1000, quality: 9.5 },
      capabilities: ['analytical', 'reasoning', 'long-context'],
      contextWindow: 200000,
      description: 'Excellent for thorough analysis'
    },
    {
      provider: 'anthropic',
      model: 'claude-3-opus-20240229',
      pricing: { input: 15, output: 75 },
      performance: { avgLatency: 1500, quality: 9.5 },
      capabilities: ['analytical', 'reasoning', 'nuanced'],
      contextWindow: 200000,
      description: 'Most nuanced analytical model'
    }
  ]
}

/**
 * Get model options for a specific intent
 */
export function getModelsForIntent(intent: string): ModelOption[] | null {
  return INTENT_REGISTRY[intent] || null
}

/**
 * Check if an intent is valid
 */
export function isValidIntent(intent: string): boolean {
  return intent in INTENT_REGISTRY
}

/**
 * Get all available intents
 */
export function getAllIntents(): string[] {
  return Object.keys(INTENT_REGISTRY)
}

/**
 * Get intents by category
 */
export function getIntentsByCategory(): Record<string, string[]> {
  return {
    'Chat': [
      'chat-premium',
      'chat-standard',
      'chat-fast',
      'chat-budget'
    ],
    'Specialized': [
      'code-generation',
      'code-review',
      'vision-analysis',
      'long-context',
      'creative-writing',
      'translation',
      'summarization',
      'data-analysis'
    ]
  }
}

/**
 * Search models by capability
 */
export function searchByCapability(capability: string): ModelOption[] {
  const results: ModelOption[] = []
  
  for (const intent in INTENT_REGISTRY) {
    const models = INTENT_REGISTRY[intent]
    for (const model of models) {
      if (model.capabilities.includes(capability)) {
        results.push(model)
      }
    }
  }
  
  // Remove duplicates based on provider + model
  const unique = results.filter((model, index, self) =>
    index === self.findIndex(m => 
      m.provider === model.provider && m.model === model.model
    )
  )
  
  return unique
}

