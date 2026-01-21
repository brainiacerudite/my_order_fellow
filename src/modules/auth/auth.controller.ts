import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler";
import { ApiResponse } from "../../shared/types";
import { authService } from "./auth.service";

const registerCompany = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.registerCompany(req.body);

    const response: ApiResponse = {
        success: true,
        message: result.message,
        data: result.company,
    };

    res.status(201).json(response);
});

const loginCompany = asyncHandler(async (req: Request, res: Response) => {

    console.log(req.body)

    // Login logic here
    const response: ApiResponse = {
        success: true,
        message: 'Company logged in successfully',
        data: {}, // Placeholder
    };

    res.status(200).json(response);
});

export const authController = {
    registerCompany,
    loginCompany,
};