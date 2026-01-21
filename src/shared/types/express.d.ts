import { Company, Admin } from '@prisma/client';
import { AuthPayload } from './api';

declare global {
    namespace Express {
        interface Request {
            company?: Omit<Company, 'password' | 'otpHash' | 'otpExpiresAt' | 'webhookSecret'>;
            admin?: Admin;
            authPayload?: AuthPayload
        }
    }
}

export { };