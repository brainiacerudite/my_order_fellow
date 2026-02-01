import { NotificationStatus } from "@prisma/client"
import { sendEmail } from "../../shared/utils/email"
import { prisma } from "../../shared/database/prisma"
import { EmailTemplate, renderTemplate } from "../../shared/utils/template"

interface SendNotificationInput {
    recipientEmail: string
    subject: string
    triggerEvent: string
    template: EmailTemplate,
    data: Record<string, any>,
    orderId?: string
}

export class NotificationService {
    async getLogsByEmail(email: string) {
        return prisma.notificationLog.findMany({
            where: { recipientEmail: email },
            orderBy: { createdAt: "desc" },
            take: 20
        })
    }

    async sendAndLog(input: SendNotificationInput) {
        let status: NotificationStatus = NotificationStatus.SENT
        let providerId = null

        try {
            // render the html
            const htmlContent = await renderTemplate(input.template, input.data)

            // attempt to send
            await sendEmail({
                to: input.recipientEmail,
                subject: input.subject,
                html: htmlContent,
                category: input.triggerEvent,
            })

            providerId = `smtp-${Date.now()}`

        } catch (error) {
            status = NotificationStatus.FAILED
            console.error("Failed to send notification:", error)
        }

        // log the notification attempt
        const notificationLog = await prisma.notificationLog.create({
            data: {
                recipientEmail: input.recipientEmail,
                triggerEvent: input.triggerEvent,
                status: status,
                providerResponseId: providerId,
                orderId: input.orderId ?? null,
            },
        })

        return notificationLog
    }
}

export const notificationService = new NotificationService()