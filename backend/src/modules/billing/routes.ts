/**
 * Billing API Routes
 * Endpoints for billing operations, balance management, and transaction history
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { BillingService } from './BillingService.js'
import { paymentService } from './PaymentService.js'
import { logger } from '../../utils/logger.js'
import { emailService } from '../../utils/email.js'
import { z } from 'zod'
import { db } from '../../db/index.js'
import { users } from '../../db/schema/index.js'
import { eq } from 'drizzle-orm'

// Type for authenticated user
interface AuthUser {
  userId: string;
  orgId: string;
  role?: string;
}

const billingService = new BillingService()

// Validation schemas
const addCreditSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  paymentDetails: z.record(z.any()).optional(),
})

const eventsQuerySchema = z.object({
  type: z.enum(['credit', 'debit', 'refund']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
})

export async function billingRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/v1/billing/balance
   * Get current balance
   */
  fastify.get(
    '/api/v1/billing/balance',
    {
      preHandler: [fastify.authenticateEither],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Support both JWT and API Key authentication
        const user = request.user as AuthUser | undefined;
        const apiKeyAuth = request.apiKeyAuth as AuthUser | undefined;
        const orgId = user?.orgId || apiKeyAuth?.orgId;

        const balance = await billingService.getBalance(orgId!)

        return reply.send({
          success: true,
          data: balance,
        })
      } catch (error) {
        logger.error({ error }, 'Error fetching balance')
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  )

  /**
   * GET /api/v1/billing/events
   * Get billing events/transaction history
   */
  fastify.get(
    '/api/v1/billing/events',
    {
      preHandler: [fastify.authenticateEither],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Support both JWT and API Key authentication
        const user = request.user as AuthUser | undefined;
        const apiKeyAuth = request.apiKeyAuth as AuthUser | undefined;
        const orgId = user?.orgId || apiKeyAuth?.orgId;
        const query = request.query as any

        // Validate query params
        const validatedQuery = eventsQuerySchema.parse(query)

        // Convert date strings to Date objects
        const queryOptions = {
          ...validatedQuery,
          startDate: validatedQuery.startDate
            ? new Date(validatedQuery.startDate)
            : undefined,
          endDate: validatedQuery.endDate
            ? new Date(validatedQuery.endDate)
            : undefined,
        }

        const events = await billingService.getEvents(
          orgId!,
          queryOptions
        )

        return reply.send({
          success: true,
          data: events,
        })
      } catch (error) {
        logger.error({ error }, 'Error fetching billing events')
        
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Validation error',
            details: error.errors,
          })
        }

        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  )

  /**
   * POST /api/v1/billing/payment-intent
   * Create a Stripe payment intent
   */
  fastify.post(
    '/api/v1/billing/payment-intent',
    {
      preHandler: [fastify.authenticateEither],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Support both JWT and API Key authentication
        const user = request.user as AuthUser | undefined;
        const apiKeyAuth = request.apiKeyAuth as AuthUser | undefined;
        const userId = user?.userId || apiKeyAuth?.userId;
        const orgId = user?.orgId || apiKeyAuth?.orgId;
        const body = request.body as any

        const { amount } = body

        if (!amount || amount <= 0) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid amount',
          })
        }

        const paymentIntent = await paymentService.createPaymentIntent(
          amount,
          'usd',
          {
            userId: userId || '',
            orgId: orgId || '',
          }
        )

        return reply.send({
          success: true,
          data: {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
          },
        })
      } catch (error) {
        logger.error({ error }, 'Error creating payment intent')
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  )

  /**
   * POST /api/v1/billing/webhook
   * Stripe webhook handler
   */
  fastify.post(
    '/api/v1/billing/webhook',
    {
      config: {
        rawBody: true, // Need raw body for Stripe signature verification
      } as any,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const signature = request.headers['stripe-signature'] as string
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

        if (!signature || !webhookSecret) {
          return reply.code(400).send({
            success: false,
            error: 'Missing signature or webhook secret',
          })
        }

        const event = paymentService.constructWebhookEvent(
          request.body as any,
          signature,
          webhookSecret
        )

        // Process the event
        await paymentService.processWebhookEvent(event)

        // If payment succeeded, add credit to account
        if (event.type === 'payment_intent.succeeded') {
          const paymentIntent = event.data.object as any
          const { userId, orgId } = paymentIntent.metadata

          if (userId && orgId) {
            await billingService.addCredit(userId, orgId, {
              amount: paymentIntent.amount / 100,
              paymentMethod: 'stripe',
              paymentDetails: {
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status,
              },
            })

            logger.info(
              { userId, orgId, amount: paymentIntent.amount / 100 },
              'Credit added after successful payment'
            )

            // Send receipt email
            try {
              const [user] = await db
                .select({ email: users.email })
                .from(users)
                .where(eq(users.id, userId))
                .limit(1)

              if (user && user.email) {
                await emailService.sendPaymentReceipt(
                  user.email,
                  paymentIntent.amount / 100,
                  paymentIntent.currency,
                  paymentIntent.id
                )
              }
            } catch (emailError) {
              logger.error({ error: emailError }, 'Failed to send payment receipt')
            }
          }
        }

        return reply.send({ success: true, received: true })
      } catch (error) {
        logger.error({ error }, 'Webhook processing failed')
        return reply.code(400).send({
          success: false,
          error: 'Webhook error',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  )

  /**
   * POST /api/v1/billing/credit
   * Add credit to account (legacy/mock endpoint)
   */
  fastify.post(
    '/api/v1/billing/credit',
    {
      preHandler: [fastify.authenticateEither],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Support both JWT and API Key authentication
        const user = request.user as AuthUser | undefined;
        const apiKeyAuth = request.apiKeyAuth as AuthUser | undefined;
        const userId = user?.userId || apiKeyAuth?.userId;
        const orgId = user?.orgId || apiKeyAuth?.orgId;
        const body = request.body

        // Validate request body
        const validatedBody = addCreditSchema.parse(body)

        logger.info(
          {
            userId,
            orgId,
            amount: validatedBody.amount,
            paymentMethod: validatedBody.paymentMethod,
          },
          'Processing credit addition (legacy/mock)'
        )

        const event = await billingService.addCredit(
          userId!,
          orgId!,
          validatedBody
        )

        return reply.send({
          success: true,
          data: event,
          message: `Successfully added ${validatedBody.amount} credits to your account`,
        })
      } catch (error) {
        logger.error({ error }, 'Error adding credit')

        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Validation error',
            details: error.errors,
          })
        }

        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  )

  /**
   * GET /api/v1/billing/stats
   * Get billing statistics
   */
  fastify.get(
    '/api/v1/billing/stats',
    {
      preHandler: [fastify.authenticateEither],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Support both JWT and API Key authentication
        const user = request.user as AuthUser | undefined;
        const apiKeyAuth = request.apiKeyAuth as AuthUser | undefined;
        const orgId = user?.orgId || apiKeyAuth?.orgId;

        const stats = await billingService.getStats(orgId!)

        return reply.send({
          success: true,
          data: stats,
        })
      } catch (error) {
        logger.error({ error }, 'Error fetching billing stats')
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  )
}

