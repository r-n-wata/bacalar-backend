import nodemailer from 'nodemailer'
import type { Logger } from '../config/logger'
import type { EventSubmissionRecord } from '../types/eventSubmissions'
import type { RestaurantSubmissionRecord } from '../types/restaurantSubmissions'
import type { TourSubmissionRecord } from '../types/tourSubmissions'

export type SubmissionAdminNotifier = {
  notifyEventSubmission(submission: EventSubmissionRecord): Promise<void>
  notifyRestaurantSubmission(
    submission: RestaurantSubmissionRecord,
  ): Promise<void>
  notifyTourSubmission(submission: TourSubmissionRecord): Promise<void>
}

type EmailNotificationConfig = {
  adminEmail?: string
  fromEmail?: string
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpPassword?: string
}

function formatMediaSummary(
  submission: { images: Array<{ source: 'UPLOADED' | 'EXTERNAL_URL'; url: string }> },
) {
  if (submission.images.length === 0) {
    return 'No media attached'
  }

  return submission.images
    .map((image, index) => {
      const source = image.source === 'UPLOADED' ? 'uploaded' : 'external'
      return `${index + 1}. [${source}] ${image.url}`
    })
    .join('\n')
}

export function createSubmissionAdminNotifier(
  logger: Logger,
  config: EmailNotificationConfig,
): SubmissionAdminNotifier {
  const {
    adminEmail,
    fromEmail,
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPassword,
  } = config

  if (
    !adminEmail ||
    !fromEmail ||
    !smtpHost ||
    !smtpPort ||
    !smtpUser ||
    !smtpPassword
  ) {
    return {
      async notifyEventSubmission(submission) {
        logger.info('submission-email-skipped', {
          submissionId: submission.id,
          adminEmailConfigured: Boolean(adminEmail),
          mailTransportConfigured: Boolean(
            fromEmail && smtpHost && smtpPort && smtpUser && smtpPassword,
          ),
        })
      },
      async notifyRestaurantSubmission(submission) {
        logger.info('submission-email-skipped', {
          submissionId: submission.id,
          adminEmailConfigured: Boolean(adminEmail),
          mailTransportConfigured: Boolean(
            fromEmail && smtpHost && smtpPort && smtpUser && smtpPassword,
          ),
        })
      },
      async notifyTourSubmission(submission) {
        logger.info('submission-email-skipped', {
          submissionId: submission.id,
          adminEmailConfigured: Boolean(adminEmail),
          mailTransportConfigured: Boolean(
            fromEmail && smtpHost && smtpPort && smtpUser && smtpPassword,
          ),
        })
      },
    }
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  })

  return {
    async notifyEventSubmission(submission) {
      await transporter.sendMail({
        to: adminEmail,
        from: fromEmail,
        subject: `New Bacalar event submission: ${submission.title}`,
        text: [
          'A new event submission is pending review.',
          '',
          `Submission ID: ${submission.id}`,
          `Status: ${submission.status}`,
          `Title: ${submission.title}`,
          `Starts at: ${submission.startsAt}`,
          `Location: ${submission.location}`,
          `Category: ${submission.category}`,
          `Contact name: ${submission.contactName}`,
          `Contact method: ${submission.contactMethod}`,
          `Instagram: ${submission.instagram ?? 'N/A'}`,
          `WhatsApp: ${submission.whatsapp ?? 'N/A'}`,
          `Submitted locale: ${submission.submittedLocale}`,
          '',
          'Description:',
          submission.description,
          '',
          'Media:',
          formatMediaSummary(submission),
        ].join('\n'),
      })
    },
    async notifyRestaurantSubmission(submission) {
      await transporter.sendMail({
        to: adminEmail,
        from: fromEmail,
        subject: `New Bacalar restaurant submission: ${submission.name}`,
        text: [
          'A new restaurant submission is pending review.',
          '',
          `Submission ID: ${submission.id}`,
          `Status: ${submission.status}`,
          `Name: ${submission.name}`,
          `Cuisine: ${submission.cuisine}`,
          `Moment: ${submission.moment}`,
          `Price band: ${submission.priceBand}`,
          `Contact name: ${submission.contactName}`,
          `Contact method: ${submission.contactMethod}`,
          `Instagram: ${submission.instagram ?? 'N/A'}`,
          `WhatsApp: ${submission.whatsapp ?? 'N/A'}`,
          `Submitted locale: ${submission.submittedLocale}`,
          '',
          'Description:',
          submission.description,
          '',
          'Media:',
          formatMediaSummary(submission),
        ].join('\n'),
      })
    },
    async notifyTourSubmission(submission) {
      await transporter.sendMail({
        to: adminEmail,
        from: fromEmail,
        subject: `New Bacalar tour submission: ${submission.name}`,
        text: [
          'A new tour submission is pending review.',
          '',
          `Submission ID: ${submission.id}`,
          `Status: ${submission.status}`,
          `Name: ${submission.name}`,
          `Category: ${submission.category}`,
          `Duration hours: ${submission.durationHours}`,
          `Price from: ${submission.priceFrom}`,
          `Contact name: ${submission.contactName}`,
          `Contact method: ${submission.contactMethod}`,
          `Instagram: ${submission.instagram ?? 'N/A'}`,
          `WhatsApp: ${submission.whatsapp ?? 'N/A'}`,
          `Submitted locale: ${submission.submittedLocale}`,
          '',
          'Description:',
          submission.description,
          '',
          'Media:',
          formatMediaSummary(submission),
        ].join('\n'),
      })
    },
  }
}
