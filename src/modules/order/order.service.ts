import { OrderStatus } from "@prisma/client";
import { prisma } from "../../shared/database/prisma";
import { createError } from "../../shared/middlewares/errorHandler";
import { CreateOrderInput, UpdateStatusInput } from "./order.validation";
import { notificationService } from "../notification/notification.service";
import config from "../../config";

export class OrderService {
    async createOrder(companyId: string, data: CreateOrderInput) {
        // check for existing order with the externalOrderId
        const existingOrder = await prisma.order.findUnique({
            where: {
                companyId_externalOrderId: {
                    companyId: companyId,
                    externalOrderId: data.externalOrderId,
                }
            }
        });

        if (existingOrder) {
            throw createError(`Order with ${data.externalOrderId} already exists for the company`, 409);
        }

        // create the order & tracking history
        const result = await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    companyId: companyId,
                    externalOrderId: data.externalOrderId,
                    customerEmail: data.customerEmail,
                    customerPhone: data.customerPhone ?? null,
                    deliveryAddress: data.deliveryAddress,
                    itemSummary: data.itemSummary ?? {},
                    isSubscriptionActive: data.isSubscriptionActive,
                }
            });

            await tx.orderTrackingHistory.create({
                data: {
                    orderId: order.id,
                    status: OrderStatus.PENDING,
                    additionalNote: 'Order created via API',
                }
            });

            return order;
        })

        return {
            success: true,
            message: 'Order created successfully',
            data: {
                orderId: result.id,
            },
        }
    }

    async updateStatus(orderId: string, companyId: string, data: UpdateStatusInput) {
        // check if order exists and belongs to the company
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order || order.companyId !== companyId) {
            throw createError('Order not found', 404);
        }

        // compare current status with new status
        if (order.currentStatus === data.status) {
            return { message: `Order is already in ${data.status} status` };
        }

        // update status in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: { currentStatus: data.status },
            });

            await tx.orderTrackingHistory.create({
                data: {
                    orderId: orderId,
                    status: data.status,
                    additionalNote: data.additionalNote ?? null,
                }
            });

            return updatedOrder;
        });

        // Send notification to customer about status update
        await notificationService.sendAndLog({
            recipientEmail: order.customerEmail,
            subject: `Update on Order #${order.externalOrderId}: ${data.status}`,
            triggerEvent: `ORDER_${data.status}`,
            template: 'order/status-update',
            data: {
                externalOrderId: order.externalOrderId,
                status: data.status,
                note: data.additionalNote ?? '',
                trackingUrl: `${config.server.frontendUrl}/track/${order.id}`,
            },
            orderId: order.id,
        })

        return {
            success: true,
            message: 'Order status updated successfully',
            data: {
                status: result.currentStatus,
            },
        }
    }

    async getOrderDetails(orderId: string, companyId: string) {
        // get order details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                trackingHistory: {
                    orderBy: { createdAt: 'desc' },
                }
            }
        })

        if (!order || order.companyId !== companyId) {
            throw createError('Order not found', 404);
        }

        return order
    }

    async trackOrder(externalOrderIdOrId: string) {
        // find order by id or externalOrderId
        const order = await prisma.order.findFirst({
            where: {
                OR: [
                    { id: externalOrderIdOrId },
                    { externalOrderId: externalOrderIdOrId },
                ]
            },
            select: {
                id: true,
                externalOrderId: true,
                currentStatus: true,
                deliveryAddress: true,
                itemSummary: true,
                createdAt: true,
                updatedAt: true,
                company: {
                    select: {
                        businessName: true,
                    }
                },
                trackingHistory: {
                    select: {
                        status: true,
                        additionalNote: true,
                        createdAt: true,
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                }
            }
        });

        if (!order) {
            throw createError('Order not found', 404);
        }

        return order;
    }
}

export const orderService = new OrderService();