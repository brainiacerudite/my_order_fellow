import { prisma } from "../../shared/database/prisma";
import { createError } from "../../shared/middlewares/errorHandler";
import { SubmitKycInput } from "./company.validation";

export class CompanyService {
    async getProfile(companyId: string) {
        // get company details
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: {
                id: true,
                businessName: true,
                email: true,
                isEmailVerified: true,
                emailVerifiedAt: true,
                createdAt: true,
                updatedAt: true,
                // include
                kycDocuments: {
                    select: {
                        id: true,
                        registrationNumber: true,
                        businessAddress: true,
                        contactDetails: true,
                        status: true,
                        reviewedAt: true,
                        rejectionReason: true,
                        createdAt: true, // when submitted
                    }
                }
            }
        });

        if (!company) throw createError('Company not found', 404);

        return company;
    }

    async submitKyc(companyId: string, data: SubmitKycInput) {
        // check if KYC already submitted
        const existingKyc = await prisma.kycDocument.findFirst({
            where: { companyId }
        });

        if (existingKyc) {
            // check status
            if (existingKyc.status === 'PENDING') {
                throw createError('Your KYC submission is already under review', 409);
            }
            if (existingKyc.status === 'APPROVED') {
                throw createError('KYC has already been approved', 409);
            }
        }

        // create new KYC submission or when previous was rejected
        const kycDocument = await prisma.kycDocument.create({
            data: {
                companyId,
                registrationNumber: data.registrationNumber,
                businessAddress: data.businessAddress,
                contactDetails: data.contactDetails,
            }
        });

        return {
            message: 'KYC submitted successfully',
            kycDocument,
        }
    }
}

export const companyService = new CompanyService();