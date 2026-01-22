import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler";
import { ApiResponse } from "../../shared/types";
import { companyService } from "./company.service";

const getCompanyProfile = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.company!.id;

    const company = await companyService.getProfile(companyId);

    const response: ApiResponse = {
        success: true,
        data: company,
    };

    res.status(200).json(response);
});

const submitKyc = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.company!.id;

    const result = await companyService.submitKyc(companyId, req.body);

    const response: ApiResponse = {
        success: true,
        message: result.message,
        data: result.kycDocument,
    };

    res.status(201).json(response);
});

export const companyController = {
    getCompanyProfile,
    submitKyc,
};