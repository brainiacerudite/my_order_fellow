import nodemailer from "nodemailer"
import config from "../../config"
import logger from "./logger"

interface SendEmailOptions {
    to: string
    subject: string
    html: string
    category?: string
}

// create transpoter
const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465, // true for 465, false for other ports
    auth: {
        user: config.email.username,
        pass: config.email.password,
    },
})

// verify connection configuration on startup
if (config.server.isProduction || config.email.host) {
    transporter.verify((error, _success) => {
        if (error) {
            logger.error("Error connecting to email server:", error);
        } else {
            logger.info("Email server connection successful");
        }
    })
}

export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
    try {
        const info = await transporter.sendMail({
            from: `"${config.email.fromName}" <${config.email.fromAddress}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
        })

        logger.info(`Email sent: ${info.messageId} to ${options.to}`);
        return true;
    } catch (error) {
        logger.error("Error sending email:", error);
        throw error;
    }
}

