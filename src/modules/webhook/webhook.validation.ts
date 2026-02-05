import { OrderStatus } from "@prisma/client";
import z from "zod";

export const orderCreatedPayload = z.object({
    event_type: z.literal("order.created"),
    data: z.object({
        external_order_id: z.string(),
        customer_email: z.email(),
        customer_phone: z.string().optional(),
        delivery_address: z.string(),
        item_summary: z.any(),
        initial_status: z.enum(OrderStatus).default(OrderStatus.PENDING),
    })
})

export const orderUpdatedPayload = z.object({
    event_type: z.literal("order.updated"),
    data: z.object({
        external_order_id: z.string(),
        new_status: z.enum(OrderStatus),
        additional_note: z.string().optional(),
        timestamp: z.iso.datetime().optional(),
    })
})

// union schema to handle both
export const webhookSchema = z.discriminatedUnion("event_type", [
    orderCreatedPayload,
    orderUpdatedPayload,
]);