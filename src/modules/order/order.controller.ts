import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler";
import { orderService } from "./order.service";

const createOrder = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.company!.id;

    const result = await orderService.createOrder(companyId, req.body);

    res.status(201).json(result);
});

const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const companyId = req.company!.id;

    const result = await orderService.updateStatus(id as string, companyId, req.body);

    res.status(200).json(result);
});

const getOrderDetails = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const companyId = req.company!.id;

    const result = await orderService.getOrderDetails(id as string, companyId);

    res.status(200).json({
        success: true,
        data: result,
    });
})

const getTrackingDetails = asyncHandler(async (req: Request, res: Response) => {
    const { trackingId } = req.params;

    const result = await orderService.trackOrder(trackingId as string);

    res.status(200).json({
        success: true,
        data: result,
    });
});

export const orderController = {
    createOrder,
    updateOrderStatus,
    getOrderDetails,
    getTrackingDetails,
};