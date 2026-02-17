/**
 * Email Service
 * Handles sending emails using SendGrid or Nodemailer
 */

import sgMail from '@sendgrid/mail'
import nodemailer from 'nodemailer'
import { logger } from './logger.js'

// Initialize SendGrid if API key is provided
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@airouter.dev'
const USE_SENDGRID = !!SENDGRID_API_KEY

if (USE_SENDGRID && SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
  logger.info('Email service initialized with SendGrid')
} else {
  logger.warn('SendGrid not configured, using Nodemailer with test account')
}

// Fallback to Nodemailer test account
let nodemailerTransporter: nodemailer.Transporter | null = null

async function getNodemailerTransporter() {
  if (nodemailerTransporter) {
    return nodemailerTransporter
  }

  // Create test account
  const testAccount = await nodemailer.createTestAccount()
  
  nodemailerTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  })

  logger.info({ user: testAccount.user }, 'Nodemailer test account created')
  return nodemailerTransporter
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  text: string
  html?: string
  from?: string
}

export class EmailService {
  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      if (USE_SENDGRID && SENDGRID_API_KEY) {
        await this.sendWithSendGrid(options)
      } else {
        await this.sendWithNodemailer(options)
      }

      logger.info({ to: options.to, subject: options.subject }, 'Email sent successfully')
    } catch (error) {
      logger.error({ error, to: options.to, subject: options.subject }, 'Failed to send email')
      throw error
    }
  }

  /**
   * Send email using SendGrid
   */
  private async sendWithSendGrid(options: EmailOptions): Promise<void> {
    const msg = {
      to: options.to,
      from: options.from || FROM_EMAIL,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    }

    await sgMail.send(msg)
  }

  /**
   * Send email using Nodemailer
   */
  private async sendWithNodemailer(options: EmailOptions): Promise<void> {
    const transporter = await getNodemailerTransporter()

    const info = await transporter.sendMail({
      from: options.from || FROM_EMAIL,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    })

    // Preview URL for test emails
    logger.info({ previewUrl: nodemailer.getTestMessageUrl(info) }, 'Test email preview')
  }

  /**
   * Send alert notification
   */
  async sendAlertNotification(
    to: string,
    alertType: string,
    threshold: number,
    currentValue: number,
    details: Record<string, any>
  ): Promise<void> {
    const subject = `⚠️ Alert: ${alertType} threshold exceeded`
    
    const text = `
Alert Notification from AIRouter

Alert Type: ${alertType}
Threshold: ${threshold}
Current Value: ${currentValue}
Status: ${currentValue >= threshold ? 'EXCEEDED' : 'WARNING'}

Details:
${JSON.stringify(details, null, 2)}

Please review your usage and take necessary action.

---
This is an automated message from AIRouter
    `.trim()

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #e74c3c;">⚠️ Alert Notification</h2>
            
            <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #e74c3c; margin: 20px 0;">
              <p><strong>Alert Type:</strong> ${alertType}</p>
              <p><strong>Threshold:</strong> ${threshold}</p>
              <p><strong>Current Value:</strong> ${currentValue}</p>
              <p><strong>Status:</strong> <span style="color: ${currentValue >= threshold ? '#e74c3c' : '#f39c12'}; font-weight: bold;">
                ${currentValue >= threshold ? 'EXCEEDED' : 'WARNING'}
              </span></p>
            </div>

            <h3>Details:</h3>
            <pre style="background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto;">
${JSON.stringify(details, null, 2)}
            </pre>

            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              This is an automated message from AIRouter.<br>
              Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `

    await this.sendEmail({
      to,
      subject,
      text,
      html,
    })
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = 'Welcome to AIRouter!'
    
    const text = `
Hello ${name},

Welcome to AIRouter - Your AI API Marketplace and Router Platform!

We're excited to have you on board. Here's what you can do:

1. Create API Keys for your applications
2. Access multiple LLM providers through a unified API
3. Track your usage and costs in real-time
4. Set up alerts for cost and usage thresholds
5. Manage your team and organizations

Get started: http://localhost:3001/dashboard

If you have any questions, feel free to reach out to our support team.

Best regards,
The AIRouter Team
    `.trim()

    await this.sendEmail({
      to,
      subject,
      text,
    })
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetUrl = `http://localhost:3001/reset-password?token=${resetToken}`
    const subject = 'Password Reset Request'
    
    const text = `
You requested a password reset for your AIRouter account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
The AIRouter Team
    `.trim()

    await this.sendEmail({
      to,
      subject,
      text,
    })
  }

  /**
   * Send payment receipt
   */
  async sendPaymentReceipt(
    to: string,
    amount: number,
    currency: string,
    transactionId: string
  ): Promise<void> {
    const subject = `Payment Receipt - $${amount}`
    
    const text = `
Payment Received

Thank you for your payment!

Amount: $${amount} ${currency.toUpperCase()}
Transaction ID: ${transactionId}
Date: ${new Date().toLocaleDateString()}

Your credits have been added to your account.

Best regards,
The AIRouter Team
    `.trim()

    await this.sendEmail({
      to,
      subject,
      text,
    })
  }
}

export const emailService = new EmailService()

