/**
 * Routing Types and Interfaces
 */

import { IProvider } from '../providers/types';

export type RoutingStrategy = 'cost' | 'latency' | 'priority' | 'fallback';

export interface RoutingConfig {
  strategy: RoutingStrategy;
  fallbackProviders?: string[]; // Provider names in fallback order
  preferredProvider?: string; // Preferred provider for priority strategy
  maxLatency?: number; // Maximum acceptable latency in ms
  maxCost?: number; // Maximum acceptable cost in cents
}

export interface RoutingDecision {
  provider: IProvider;
  strategy: RoutingStrategy;
  reason: string;
  alternatives: string[]; // Alternative providers that could handle the request
}

export interface ProviderSelection {
  provider: IProvider;
  score: number;
  reason: string;
}

