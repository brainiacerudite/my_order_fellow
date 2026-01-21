import rateLimit from "express-rate-limit";
import config from "../../config";

export const limiter = rateLimit({
    windowMs: config.rateLimiting.windowMs,
    max: config.rateLimiting.maxRequests,
})