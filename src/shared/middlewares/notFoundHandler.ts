import { Request, Response } from "express"
import { ApiResponse } from "../types/api"

export const notFoundHandler = (req: Request, res: Response) => {
    const apiResponse: ApiResponse = {
        success: false,
        message: `Route ${req.originalUrl} not found`,
        error: "Not Found"
    }
    res.status(404).json(apiResponse)
}