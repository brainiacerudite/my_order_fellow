import { Company, Admin } from '@prisma/client';

declare global {
    namespace Express {
        interface Request {
            company?: Company;
            admin?: Admin;
        }
    }
}

export { };