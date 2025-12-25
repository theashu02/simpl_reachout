import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Context } from 'elysia';
import { RECEIVER_EMAIL, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from '../../../utils/config';

interface EmailBody {
    email: string;
    toolName: string;
    useCase: string;
}

const smtpConfig: SMTPTransport.Options = {
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
};

const transporter = nodemailer.createTransport(smtpConfig);

export const EmailController = {
    sendToolSubmission: async ({ body, set }: Context) => {
        const { email, toolName, useCase } = body as EmailBody;

        try {
            const info = await transporter.sendMail({
                from: `"API Notification" <${SMTP_USER}>`,
                to: RECEIVER_EMAIL,
                subject: `New Tool Submission: ${toolName}`,
                text: `User: ${email}\nTool: ${toolName}\nUse Case: ${useCase}`,
                html: `
                    <h3>New Submission</h3>
                    <p><strong>User:</strong> ${email}</p>
                    <p><strong>Tool:</strong> ${toolName}</p>
                    <p><strong>Use Case:</strong><br/>${useCase}</p>
                `,
            });

            return {
                success: true,
                message: 'Request sent successfully',
                id: info.messageId
            };

        } catch (error) {
            console.error('Email error:', error);
            set.status = 500;
            return {
                success: false,
                message: 'Failed to send email',
                error: String(error)
            };
        }
    }
};
