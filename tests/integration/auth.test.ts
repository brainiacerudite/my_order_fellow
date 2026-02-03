import app from "../../src/app";
import { prisma } from "../../src/shared/database/prisma";
import request from "supertest";

describe('Auth Integration Tests', () => {
    const TEST_COMPANY = {
        businessName: 'Auth Test Company',
        email: 'auth-test@example.com',
        password: 'Pa$$w0rd!'
    }

    /** Helper function to clear test data */
    const clearTestData = async () => {
        const company = await prisma.company.findUnique({ where: { email: TEST_COMPANY.email } });
        if (!company) return;

        // delete company
        await prisma.company.delete({ where: { id: company.id } });
    }

    // clean up before and after tests
    beforeAll(async () => {
        await clearTestData();
    });

    afterAll(async () => {
        await clearTestData();
        await prisma.$disconnect();
    });

    /** TEST CASES */
    describe('POST /api/v1/auth/register', () => {
        it('should register a new company', async () => {
            const res = await request(app).post('/api/v1/auth/register').send(TEST_COMPANY)

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it('should fail if businessName is missing (400)', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({
                email: TEST_COMPANY.email,
                password: TEST_COMPANY.password
            });
            expect(res.status).toBe(400);
        });

        it('should fail if email is invalid (400)', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({
                ...TEST_COMPANY,
                email: 'not-an-email'
            });
            expect(res.status).toBe(400);
        });

        it('should fail if password is too short (400)', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({
                ...TEST_COMPANY,
                password: '123'
            });
            expect(res.status).toBe(400);
        });

        it('should reject duplicate email (400)', async () => {
            const res = await request(app).post('/api/v1/auth/register').send(TEST_COMPANY);

            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login an existing company', async () => {
            // manually set verified email for test company
            await prisma.company.update({
                where: { email: TEST_COMPANY.email },
                data: { isEmailVerified: true, emailVerifiedAt: new Date() }
            });

            const res = await request(app).post('/api/v1/auth/login').send({
                email: TEST_COMPANY.email,
                password: TEST_COMPANY.password
            })

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('tokens');
        });

        it('should return 400 for incorrect password', async () => {
            const res = await request(app).post('/api/v1/auth/login').send({
                email: TEST_COMPANY.email,
                password: 'WrongPassword123'
            });

            expect(res.status).toBe(400);
        });

        it('should return 400 for non-existent email', async () => {
            const res = await request(app).post('/api/v1/auth/login').send({
                email: 'ghost@doesnotexist.com',
                password: 'password123'
            });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/v1/companies/profile', () => {
        it('should allow access to protected route with Token', async () => {
            // login to get token
            const loginRes = await request(app).post('/api/v1/auth/login').send({
                email: TEST_COMPANY.email,
                password: TEST_COMPANY.password
            });

            const token = loginRes.body.data.tokens.access;

            const res = await request(app).get('/api/v1/companies/profile').set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.businessName).toBe(TEST_COMPANY.businessName);
        })

        it('should fail without token (401)', async () => {
            const res = await request(app).get('/api/v1/companies/profile');

            expect(res.status).toBe(401);
        })

        it('should fail with invalid token (401)', async () => {
            const res = await request(app).get('/api/v1/companies/profile').set('Authorization', 'Bearer invalid-token-123');

            expect(res.status).toBe(401);
        })
    })
});