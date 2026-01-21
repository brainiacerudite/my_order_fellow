import { Request, Response, NextFunction } from "express";
import { ValidationException } from "./validation";
import { ApiResponse } from "../types";
import logger from "../utils/logger";
import config from "../../config";

export interface AppError extends Error {
    statusCode: number;
    isOperational: boolean;
}

export const createError = (message: string, statusCode: number): AppError => {
    const error = new Error(message) as AppError;
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};

export const errorHandler = (
    error: AppError | ValidationException,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Handle ValidationException specially
    if (error instanceof ValidationException) {
        logger.warn(`Validation Error: ${error.message}`, {
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            errors: error.errors,
        });

        const apiResponse: ApiResponse = {
            success: false,
            message: "Validation failed",
            data: error.errors,
        };
        res.status(400).json(apiResponse);
        return;
    }

    const { statusCode = 500, message } = error;

    logger.error(`Error ${statusCode}: ${message}`, {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        stack: error.stack,
    });

    // Don't leak error details in production
    const response: ApiResponse = {
        success: false,
        message:
            config.server.isProduction && statusCode === 500
                ? "Internal Server Error"
                : message,
        ...(!config.server.isProduction && { stack: error.stack }),
    };

    res.status(statusCode).json(response);
};
