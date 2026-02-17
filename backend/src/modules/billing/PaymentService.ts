/**
 * Payment Service
 * Handles payment processing with Stripe
 */

import Stripe from 'stripe'
import { logger } from '../../utils/logger.js'

// Only initialize Stripe if API key is provided
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
let stripe: Stripe | null = null

if (STRIPE_SECRET_KEY) {
  stripe = new Stripe(STRIPE_SECRET_KEY, {
    // @ts-expect-error - API version may differ between Stripe SDK versions
    apiVersion: '2024-11-20.acacia',
  })
  logger.info('Stripe initialized')
} else {
  logger.warn('Stripe not configured - payment features will be disabled')
}

export class PaymentService {
  /**
   * Create a payment intent
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: Record<string, string> = {}
  ): Promise<Stripe.PaymentIntent> {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      })

      logger.info({ paymentIntentId: paymentIntent.id, amount }, 'Payment intent created')
      return paymentIntent
    } catch (error) {
      logger.error({ error }, 'Failed to create payment intent')
      throw error
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    if (!stripe) {
      throw new Error('Stripe is not configured')
    }

    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId)
      logger.info({ paymentIntentId }, 'Payment intent confirmed')
      return paymentIntent
    } catch (error) {
      logger.error({ error, paymentIntentId }, 'Failed to confirm payment intent')
      throw error
    }
  }

  /**
   * Get payment intent status
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    if (!stripe) {
      throw new Error('Stripe is not configured')
    }

    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId)
    } catch (error) {
      logger.error({ error, paymentIntentId }, 'Failed to retrieve payment intent')
      throw error
    }
  }

  /**
   * Create a customer
   */
  async createCustomer(
    email: string,
    name: string,
    metadata: Record<string, string> = {}
  ): Promise<Stripe.Customer> {
    if (!stripe) {
      throw new Error('Stripe is not configured')
    }

    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata,
      })

      logger.info({ customerId: customer.id, email }, 'Customer created')
      return customer
    } catch (error) {
      logger.error({ error, email }, 'Failed to create customer')
      throw error
    }
  }

  /**
   * Create a setup intent for saving payment methods
   */
  async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    if (!stripe) {
      throw new Error('Stripe is not configured')
    }

    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
      })

      logger.info({ setupIntentId: setupIntent.id, customerId }, 'Setup intent created')
      return setupIntent
    } catch (error) {
      logger.error({ error, customerId }, 'Failed to create setup intent')
      throw error
    }
  }

  /**
   * List customer payment methods
   */
  async listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    if (!stripe) {
      throw new Error('Stripe is not configured')
    }

    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      })

      return paymentMethods.data
    } catch (error) {
      logger.error({ error, customerId }, 'Failed to list payment methods')
      throw error
    }
  }

  /**
   * Construct webhook event from request
   */
  constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    if (!stripe) {
      throw new Error('Stripe is not configured')
    }

    try {
      return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    } catch (error) {
      logger.error({ error }, 'Failed to construct webhook event')
      throw error
    }
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(event: Stripe.Event): Promise<void> {
    logger.info({ eventType: event.type, eventId: event.id }, 'Processing webhook event')

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'customer.created':
        logger.info({ customer: event.data.object }, 'Customer created')
        break

      case 'payment_method.attached':
        logger.info({ paymentMethod: event.data.object }, 'Payment method attached')
        break

      default:
        logger.info({ eventType: event.type }, 'Unhandled event type')
    }
  }

  /**
   * Handle successful payment intent
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    logger.info(
      {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        metadata: paymentIntent.metadata,
      },
      'Payment succeeded'
    )

    // This will be called by the webhook handler
    // The actual credit addition should be done there
  }

  /**
   * Handle failed payment intent
   */
  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    logger.error(
      {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        metadata: paymentIntent.metadata,
      },
      'Payment failed'
    )
  }

  /**
   * Create a refund
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: Stripe.RefundCreateParams.Reason
  ): Promise<Stripe.Refund> {
    if (!stripe) {
      throw new Error('Stripe is not configured')
    }

    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason,
      })

      logger.info({ refundId: refund.id, paymentIntentId, amount }, 'Refund created')
      return refund
    } catch (error) {
      logger.error({ error, paymentIntentId }, 'Failed to create refund')
      throw error
    }
  }
}

export const paymentService = new PaymentService()

