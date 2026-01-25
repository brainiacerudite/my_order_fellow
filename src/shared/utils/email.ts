import config from "../../config"
import logger from "./logger"

interface SendEmailOptions {
    to: string
    subject: string
    html: string
    category?: string
}

export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
    // mail logic goes here

    if (config.server.isProduction) {
        // TODO: send real email

        return true
    }

    logger.info(`Email sent to ${options.to} with subject "${options.subject}".`)
    return true
}

