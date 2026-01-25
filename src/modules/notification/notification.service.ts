import { NotificationStatus } from "@prisma/client"
import { sendEmail } from "../../shared/utils/email"
import { prisma } from "../../shared/database/prisma"

interface SendNotificationInput {
    recipientEmail: string
    subject: string
    message: string
    triggerEvent: string
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
            // attempt to send
            await sendEmail({
                to: input.recipientEmail,
                subject: input.subject,
                html: input.message,
                category: input.triggerEvent,
            })
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