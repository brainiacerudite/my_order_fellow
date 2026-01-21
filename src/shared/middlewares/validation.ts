import { Request, Response, NextFunction } from "express";
import { z, ZodType } from "zod";
import logger from "../utils/logger";

export interface ValidationError {
    field: string;
    message: string;
}

export class ValidationException extends Error {
    public errors: ValidationError[];
    public statusCode: number;

    constructor(errors: ValidationError[]) {
        super("Validation failed");
        this.errors = errors;
        this.statusCode = 400;
        this.name = "ValidationException";
    }
}

/**
 * Middleware factory for validating request data using Zod schemas
 */
export const validate = (
    schema: ZodType,
    source: "body" | "query" | "params" = "body"
) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            let dataToValidate;

            switch (source) {
                case "body":
                    dataToValidate = req.body;
                    break;
                case "query":
                    dataToValidate = req.query;
                    break;
                case "params":
                    dataToValidate = req.params;
                    break;
                default:
                    dataToValidate = req.body;
            }

            // Validate the data
            const result = schema.safeParse(dataToValidate);

            if (!result.success) {
                const errors: ValidationError[] = result.error.issues.map(
                    (err: z.core.$ZodIssue) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })
                );

                logger.warn("Validation failed", {
                    source,
                    errors,
                    data: dataToValidate,
                });

                throw new ValidationException(errors);
            }

            // Store the validated (and potentially transformed) data
            // Note: req.query is read-only in Express, so we store validated query data separately
            switch (source) {
                case "body":
                    req.body = result.data;
                    break;
                case "query":
                    // Store validated query data in a custom property since req.query is read-only
                    (req as any).validatedQuery = result.data;
                    break;
                case "params":
                    req.params = result.data as any;
                    break;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Sanitize and validate ObjectId parameters
 */
export const validateObjectId = (paramName: string = "id") => {
    const objectIdSchema = z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, `Invalid ${paramName} format`);

    return validate(z.object({ [paramName]: objectIdSchema }), "params");
};
