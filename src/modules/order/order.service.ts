import { OrderStatus } from "@prisma/client";
import { prisma } from "../../shared/database/prisma";
import { createError } from "../../shared/middlewares/errorHandler";
import { CreateOrderInput, UpdateStatusInput } from "./order.validation";

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
}

export const orderService = new OrderService();