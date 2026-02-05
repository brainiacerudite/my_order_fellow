import sendgrid from "@sendgrid/mail"
import nodemailer from "nodemailer"
import config from "../../config"
import logger from "./logger"

interface SendEmailOptions {
    to: string
    subject: string
    html: string
    category?: string
}

// sendgrid provider setup
if (config.email.provider === 'sendgrid') {
    if (!config.email.apiKey) {
        logger.error("EMAIL_API_KEY is required for the provider");
    } else {
        sendgrid.setApiKey(config.email.apiKey);
        logger.info("SendGrid email provider configured");
    }
}

// smtp provider setup
let smtpTransporter: nodemailer.Transporter | null = null;
if (config.email.provider === 'smtp') {
    // create transpoter
    smtpTransporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465, // true for 465, false for other ports
        auth: {
            user: config.email.user,
            pass: config.email.password,
        },
    })

    // verify connection configuration on startup
    if (config.server.isProduction || config.email.host) {
        smtpTransporter.verify((error, _success) => {
            if (error) {
                logger.error("Error connecting to email server:", error);
            } else {
                logger.info("Email server connection successful");
            }
        })
    }
}

// send via sendgrid
const sendEmailViaSendGrid = async (options: SendEmailOptions): Promise<boolean> => {
    const msg: any = {
        to: options.to,
        from: {
            name: config.email.fromName,
            email: config.email.fromAddress,
        },
        subject: options.subject,
        html: options.html,
    }

    if (options.category) {
        msg.categories = [options.category];
    }

    try {
        await sendgrid.send(msg);
        logger.info(`Email sent via SendGrid to ${options.to}`);
        return true;
    } catch (error) {
        logger.error("Error sending email via SendGrid:", error);
        throw error;
    }
}

// send via smtp
const sendEmailViaSMTP = async (options: SendEmailOptions): Promise<boolean> => {
    if (!smtpTransporter) {
        const errorMsg = "SMTP transporter is not configured";
        throw new Error(errorMsg);
    }

    try {
        const info = await smtpTransporter.sendMail({
            from: `"${config.email.fromName}" <${config.email.fromAddress}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
        })

        logger.info(`Email sent: ${info.messageId} to ${options.to}`);
        return true;
    } catch (error) {
        logger.error("Error sending email via SMTP:", error);
        throw error;
    }
}

export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
    if (config.email.provider === 'sendgrid') {
        return await sendEmailViaSendGrid(options);
    } else {
        return await sendEmailViaSMTP(options);
    }
}