import path from "node:path";
import fs from "node:fs";
import ejs from "ejs";
import logger from "./logger";
import { createError } from "../middlewares/errorHandler";
import config from "../../config";

export type EmailTemplate = 'auth/verify-otp' | 'auth/reset-password' | 'order/status-update';

export const renderTemplate = async (templateName: EmailTemplate, data: Record<string, any>): Promise<string> => {
    try {
        // resolve path to the template file
        const templatesDir = path.resolve(process.cwd(), 'src', 'shared', 'templates')
        const contentPath = path.join(templatesDir, `${templateName}.ejs`);
        const layoutPath = path.join(templatesDir, 'layouts', 'base.ejs');

        // security check
        if (!contentPath.startsWith(templatesDir)) {
            throw new Error("Invalid template path");
        }

        // check if file exists
        if (!fs.existsSync(contentPath)) {
            throw new Error(`Template ${templateName} not found`);
        }

        // global template context
        const templateContext = {
            ...data,
            config,
            year: new Date().getFullYear(),
        }

        // render the content
        const contentHtml = await ejs.renderFile(contentPath, templateContext);

        // render the layout with the content
        const finalHtml = await ejs.renderFile(layoutPath, {
            ...templateContext,
            body: contentHtml
        });

        return finalHtml;
    } catch (error) {
        logger.error("Error rendering email template:", error);
        throw createError("Failed to generate email template content", 500);
    }
}