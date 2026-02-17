/**
 * Routing Policy Service
 * Manages custom routing policies for organizations
 */

import { logger } from '../../utils/logger.js';
import { RoutingPolicy, PolicyCondition, PolicyAction } from './types.js';

export class RoutingPolicyService {
  private policies: Map<string, RoutingPolicy[]> = new Map();

  /**
   * Add a routing policy
   */
  addPolicy(policy: RoutingPolicy): void {
    const id = policy.id || this.generatePolicyId();
    const policyWithId = { ...policy, id, createdAt: new Date() };

    if (!this.policies.has(policy.orgId)) {
      this.policies.set(policy.orgId, []);
    }

    const orgPolicies = this.policies.get(policy.orgId)!;
    orgPolicies.push(policyWithId);
    
    // Sort by priority (higher priority first)
    orgPolicies.sort((a, b) => b.priority - a.priority);

    logger.info({ policyId: id, orgId: policy.orgId }, 'Routing policy added');
  }

  /**
   * Get policies for an organization
   */
  getPolicies(orgId: string): RoutingPolicy[] {
    return this.policies.get(orgId) || [];
  }

  /**
   * Get policy by ID
   */
  getPolicy(policyId: string): RoutingPolicy | null {
    for (const policies of this.policies.values()) {
      const policy = policies.find((p) => p.id === policyId);
      if (policy) return policy;
    }
    return null;
  }

  /**
   * Update a policy
   */
  updatePolicy(policyId: string, updates: Partial<RoutingPolicy>): void {
    for (const [orgId, policies] of this.policies.entries()) {
      const index = policies.findIndex((p) => p.id === policyId);
      if (index !== -1) {
        policies[index] = { ...policies[index], ...updates };
        // Re-sort if priority changed
        if (updates.priority !== undefined) {
          policies.sort((a, b) => b.priority - a.priority);
        }
        logger.info({ policyId, updates }, 'Routing policy updated');
        return;
      }
    }
    throw new Error('Policy not found');
  }

  /**
   * Delete a policy
   */
  deletePolicy(policyId: string): void {
    for (const [orgId, policies] of this.policies.entries()) {
      const index = policies.findIndex((p) => p.id === policyId);
      if (index !== -1) {
        policies.splice(index, 1);
        logger.info({ policyId, orgId }, 'Routing policy deleted');
        return;
      }
    }
    throw new Error('Policy not found');
  }

  /**
   * Evaluate policies for a request
   */
  evaluatePolicies(
    orgId: string,
    context: {
      model?: string;
      cost?: number;
      time?: Date;
      userId?: string;
      [key: string]: any;
    }
  ): PolicyAction[] {
    const policies = this.getPolicies(orgId).filter((p) => p.enabled);

    for (const policy of policies) {
      if (this.matchesConditions(policy.conditions, context)) {
        logger.info(
          { policyId: policy.id, policyName: policy.name },
          'Policy matched'
        );
        return policy.actions;
      }
    }

    return [];
  }

  /**
   * Check if all conditions match
   */
  private matchesConditions(
    conditions: PolicyCondition[],
    context: Record<string, any>
  ): boolean {
    return conditions.every((condition) => this.matchesCondition(condition, context));
  }

  /**
   * Check if a single condition matches
   */
  private matchesCondition(
    condition: PolicyCondition,
    context: Record<string, any>
  ): boolean {
    const value = context[condition.type];

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;

      case 'contains':
        return (
          typeof value === 'string' &&
          value.includes(condition.value)
        );

      case 'greater_than':
        return Number(value) > Number(condition.value);

      case 'less_than':
        return Number(value) < Number(condition.value);

      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);

      default:
        return false;
    }
  }

  /**
   * Generate policy ID
   */
  private generatePolicyId(): string {
    return `policy_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Get all policies (for admin)
   */
  getAllPolicies(): RoutingPolicy[] {
    const allPolicies: RoutingPolicy[] = [];
    for (const policies of this.policies.values()) {
      allPolicies.push(...policies);
    }
    return allPolicies;
  }
}

// Singleton instance
export const routingPolicyService = new RoutingPolicyService();

