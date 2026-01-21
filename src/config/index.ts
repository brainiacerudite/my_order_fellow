import dotenv from 'dotenv';
import z from 'zod';

dotenv.config()

const envSchema = z.object({
    // Server
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(8000),

    // API
    API_URL: z.url().default('http://localhost:8000'),
    API_VERSION: z.string().default('v1'),

    // Frontend
    FRONTEND_URL: z.url().default('http://localhost:5173'),

    // Logging
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

    // Database
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    // Security (JWT)
    JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 chars"),
    JWT_EXPIRY: z.string().default('15m'),      // Access Token life
    JWT_REFRESH_TOKEN_EXPIRY: z.string().default('7d'), // Refresh Token life

    // OTP (for Email Verification)
    OTP_EXPIRY_MINUTES: z.coerce.number().default(10),

    // Email Service
    EMAIL_HOST: z.string().default('smtp.example.com'),
    EMAIL_PORT: z.coerce.number().default(587),
    EMAIL_USERNAME: z.string().default('user@example.com'),
    EMAIL_PASSWORD: z.string().default('password'),
    EMAIL_FROM_NAME: z.string().default('MyOrderFellow'),
    EMAIL_FROM_ADDRESS: z.email().default('no-reply@example.com'),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default(() => 900000), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).transform(Number).default(() => 100),
});

// Validate process.env against the schema
const env = envSchema.safeParse(process.env);

if (!env.success) {
    console.error('Invalid environment variables:', z.treeifyError(env.error));
    process.exit(1); // Crash the app immediately if there is config error
}

const API_PREFIX = `/api/${env.data.API_VERSION}`;

export const config = {
    // Server
    server: {
        port: env.data.PORT,
        environment: env.data.NODE_ENV,
        isDevelopment: env.data.NODE_ENV === "development",
        isProduction: env.data.NODE_ENV === "production",
        isTest: env.data.NODE_ENV === "test",
        corsOrigins: [env.data.FRONTEND_URL],
        frontendUrl: env.data.FRONTEND_URL,
    },

    // API
    api: {
        baseUrl: env.data.API_URL,
        version: env.data.API_VERSION,
        prefix: API_PREFIX,
    },

    // Logging
    logging: {
        level: env.data.LOG_LEVEL,
    },

    // Database
    database: {
        url: env.data.DATABASE_URL,
    },

    // Security
    jwt: {
        secret: env.data.JWT_SECRET,
        expiry: env.data.JWT_EXPIRY,
        refreshTokenExpiry: env.data.JWT_REFRESH_TOKEN_EXPIRY,
    },

    // OTP
    otp: {
        expiryMinutes: env.data.OTP_EXPIRY_MINUTES,
    },

    // Email Service
    email: {
        host: env.data.EMAIL_HOST,
        port: env.data.EMAIL_PORT,
        username: env.data.EMAIL_USERNAME,
        password: env.data.EMAIL_PASSWORD,
        fromName: env.data.EMAIL_FROM_NAME,
        fromAddress: env.data.EMAIL_FROM_ADDRESS,
    },

    // Rate Limiting
    rateLimiting: {
        windowMs: env.data.RATE_LIMIT_WINDOW_MS,
        maxRequests: env.data.RATE_LIMIT_MAX_REQUESTS,
    },

    // Pagination
    pagination: {
        limit: 15,
    },
}

// Log configuration on startup
if (config.server.isDevelopment) {
    console.log("Configuration loaded...");
}

export default config;