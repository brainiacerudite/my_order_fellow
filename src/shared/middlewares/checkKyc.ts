import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';
import { prisma } from '../database/prisma';
import { KycStatus } from '@prisma/client';

export const checkKycApproved = async (req: Request, _res: Response, next: NextFunction) => {
    const companyId = req.company!.id

    if (!companyId) return next(createError("Authentication failed", 401))

    const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
            kycDocuments: true
        }
    })
    if (!company) return next(createError("Company not found", 404))

    // check KYC and email verification
    const hasApprovedKYC = company.kycDocuments.some(doc => doc.status === KycStatus.APPROVED)
    if (!hasApprovedKYC || !company.isEmailVerified) {
        return next(createError("Company KYC not approved or email not verified", 403))
    }

    next()
}