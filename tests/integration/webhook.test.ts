import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/shared/database/prisma';
import crypto from 'crypto';
import { OrderStatus } from '@prisma/client';

jest.mock('../../src/modules/notification/notification.service', () => ({
    notificationService: {
        sendAndLog: jest.fn().mockResolvedValue(true),
    }
}));

describe('Webhook Integration Tests', () => {
    let companyId: string
    let webhookSecret: string
    const TEST_EMAIL = 'test-webhook@example.com'

    /** Helper function to clear test data */
    const clearTestData = async () => {
        const company = await prisma.company.findUnique({ where: { email: TEST_EMAIL } });
        if (!company) return;

        // find all orders for this company
        const orders = await prisma.order.findMany({
            where: { companyId: company.id },
            select: { id: true }
        });
        const orderIds = orders.map(o => o.id);

        if (orderIds.length > 0) {
            // delete tracking histories and notification logs linked to these orders
            await prisma.orderTrackingHistory.deleteMany({
                where: { orderId: { in: orderIds } }
            });
            await prisma.notificationLog.deleteMany({
                where: { orderId: { in: orderIds } }
            });
        }

        // delete orders
        await prisma.order.deleteMany({ where: { companyId: company.id } });

        // delete company kyc document if any
        await prisma.kycDocument.deleteMany({ where: { companyId: company.id } });

        // delete company
        await prisma.company.delete({ where: { id: company.id } });
    }

    // create test data
    beforeAll(async () => {
        // clean up first
        await clearTestData();

        webhookSecret = 'test-webhook-secret'

        const company = await prisma.company.create({
            data: {
                businessName: 'Test Webhook Company',
                email: TEST_EMAIL,
                password: 'securepassword',
                isEmailVerified: true,
                webhookSecret: webhookSecret
            }
        });
        companyId = company.id
    });

    // clean up test data
    afterAll(async () => {
        await clearTestData();
        await prisma.$disconnect();
    });

    /** TEST CASES */
    it('should return 401 if Headers are missing', async () => {
        const res = await request(app).post('/api/v1/webhooks/incoming').send({})

        expect(res.status).toBe(401)
    })

    it('should return 403 if Webhook Signature is invalid', async () => {
        const res = await request(app).post('/api/v1/webhooks/incoming').set('x-company-id', companyId).set('x-webhook-signature', 'invalid-signature').send({
            event_type: "order.created",
            data: {}
        })

        expect(res.status).toBe(403)
    })

    it('should return 200 for valid order.created webhook and create order', async () => {
        const payload = {
            event_type: "order.created",
            data: {
                external_order_id: `TEST-ORD-${Date.now()}`,
                customer_email: "test-customer@example.com",
                customer_phone: "1234567890",
                delivery_address: "123 Test St, Test City",
                item_summary: [{ name: "Test Item 1", quantity: 2 }],
                isSubscriptionActive: true
            }
        };

        // Generate valid signature
        const signature = crypto.createHmac('sha256', webhookSecret).update(JSON.stringify(payload)).digest('hex');

        const res = await request(app).post('/api/v1/webhooks/incoming').set('x-company-id', companyId).set('x-webhook-signature', signature).send(payload);

        expect(res.status).toBe(200);

        // Verify order created in DB
        const orderInDb = await prisma.order.findUnique({
            where: {
                companyId_externalOrderId: {
                    companyId: companyId,
                    externalOrderId: payload.data.external_order_id
                }
            }
        });
        expect(orderInDb).not.toBeNull();
        expect(orderInDb?.customerEmail).toBe(payload.data.customer_email);
    });

    it('should return 200 for valid order.updated webhook and update order status', async () => {
        // First create an order to update
        const order = await prisma.order.create({
            data: {
                companyId: companyId,
                externalOrderId: `UPD-ORD-${Date.now()}`,
                customerEmail: "test-customer@example.com",
                customerPhone: "1234567890",
                deliveryAddress: "123 Test St, Test City",
                itemSummary: [{ name: "Test Item 1", quantity: 2 }],
                isSubscriptionActive: true
            }
        });

        const payload = {
            event_type: "order.updated",
            data: {
                external_order_id: order.externalOrderId,
                new_status: OrderStatus.DELIVERED,
                additional_note: "Order has been delivered successfully"
            }
        };

        // Generate valid signature
        const signature = crypto.createHmac('sha256', webhookSecret).update(JSON.stringify(payload)).digest('hex');

        const res = await request(app).post('/api/v1/webhooks/incoming').set('x-company-id', companyId).set('x-webhook-signature', signature).send(payload);

        expect(res.status).toBe(200);

        // Verify order status updated in DB
        const updatedOrder = await prisma.order.findUnique({ where: { id: order.id }, include: { trackingHistory: true } });

        // check if main status changed
        expect(updatedOrder).not.toBeNull();
        expect(updatedOrder?.currentStatus).toBe(payload.data.new_status);

        // check if tracking history recorded
        expect(updatedOrder?.trackingHistory.length).toBeGreaterThanOrEqual(1);

        // ensure the latest tracking history matches
        const latestHistory = updatedOrder?.trackingHistory[updatedOrder.trackingHistory.length - 1];
        expect(latestHistory?.status).toBe(payload.data.new_status);
        expect(latestHistory?.additionalNote).toBe(payload.data.additional_note);
    });
});
