import { OrderStatus } from "@prisma/client";
import z from "zod";

const itemSchema = z.object({
    name: z.string(),
    quantity: z.int().positive().min(1),
    price: z.number().min(0),
});

export const createOrderSchema = z.object({
    externalOrderId: z.string().min(1),
    customerEmail: z.email(),
    customerPhone: z.string().optional(),
    deliveryAddress: z.string().min(5),
    // array of items
    itemSummary: z.array(itemSchema).or(z.record(z.string(), z.any())),
    isSubscriptionActive: z.boolean().default(true),
})

export const updateStatusSchema = z.object({
    status: z.enum(OrderStatus),
    additionalNote: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;