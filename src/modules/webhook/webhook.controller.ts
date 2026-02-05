import { Request, Response } from 'express';
import { prisma } from '../../shared/database/prisma';
import { webhookSchema } from './webhook.validation';
import z from 'zod';
import { orderService } from '../order/order.service';
import logger from '../../shared/utils/logger';
import { verifyWebhookSignature } from '../../shared/utils/webhookSignature';
import { KycStatus } from '@prisma/client';

const handleIncomingWebhook = async (req: Request, res: Response) => {
    try {
        // webhook security
        const companyId = req.headers['x-company-id'] as string;
        const signature = req.headers['x-webhook-signature'] as string;

        if (!companyId || !signature) {
            return res.status(401).json({ message: 'Missing required headers' });
        }

        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: {
                id: true,
                webhookSecret: true,
                kycDocuments: {
                    select: {
                        status: true,
                    }
                },
                isEmailVerified: true,
            }
        })

        if (!company || !company.webhookSecret) {
            return res.status(401).json({ message: 'Invalid credentials or KYC pending' });
        }

        // check KYC and email verification
        const hasApprovedKYC = company.kycDocuments.some(doc => doc.status === KycStatus.APPROVED);
        if (!hasApprovedKYC || !company.isEmailVerified) {
            return res.status(403).json({ message: 'Company KYC not approved or email not verified' });
        }

        // verify signature
        const isValid = verifyWebhookSignature(req.rawBody!, signature, company.webhookSecret)
        if (!isValid) return res.status(403).json({ message: 'Invalid signature' });

        // validate payload structure
        const parsedPayload = webhookSchema.safeParse(req.body);
        if (!parsedPayload.success) {
            return res.status(400).json({ message: 'Invalid payload structure', errors: z.treeifyError(parsedPayload.error) });
        }

        const { event_type, data } = parsedPayload.data;

        // process events
        if (event_type === 'order.created') {
            // handle order created
            await orderService.createOrder(company.id, {
                externalOrderId: data.external_order_id,
                customerEmail: data.customer_email,
                customerPhone: data.customer_phone,
                deliveryAddress: data.delivery_address,
                itemSummary: data.item_summary,
                isSubscriptionActive: true
            })

        } else if (event_type === 'order.updated') {
            // handle order updated
            const order = await prisma.order.findUnique({
                where: {
                    companyId_externalOrderId: {
                        companyId: company.id,
                        externalOrderId: data.external_order_id,
                    }
                }
            })

            if (order) {
                await orderService.updateStatus(order.id, company.id, {
                    status: data.new_status,
                    additionalNote: data.additional_note
                });
            } else {
                logger.warn(`Order with external ID ${data.external_order_id} not found for company ${company.id}`);
            }
        }

        return res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
        logger.error('Error processing webhook:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const webhookController = {
    handleIncomingWebhook,
}