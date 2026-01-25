import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler";
import { notificationService } from "./notification.service";

const getLogs = asyncHandler(async (req: Request, res: Response) => {
    const email = req.company!.email

    const notificationLogs = await notificationService.getLogsByEmail(email)

    res.status(200).json({
        success: true,
        data: {
            count: notificationLogs.length,
            notificationLogs: notificationLogs,
        },
    });
});

export const notificationController = {
    getLogs,
};