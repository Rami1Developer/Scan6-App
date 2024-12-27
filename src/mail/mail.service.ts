// mail.service.ts
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor() {


        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendPasswordResetEmail(to: string, otp: string) {
        // const resetLink = `http://yourapp.com/reset-password?token=${token}`;
        const mailOptions = {
            from: 'Auth-backend service',
            to: to,
            subject: 'Your OTP for Password Reset',
            // html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`,
            html: `<p>Your OTP for resetting your password is:</p><h2>${otp}</h2><p>This OTP is valid for 1 hour.</p>`,

        };


        await this.transporter.sendMail(mailOptions);

    }
    /* async sendConfirmEmail(to: string, token: string) {
       const resetLink = `http://yourapp.com/confirm-Email?token=${token}`;
       const mailOptions = {
         from: 'Auth-backend service',
         to: to,
         subject: 'Confirm Email',
         html: `<p>You requested a confirm email. Click the link below to confirm your email:</p><p><a href="${resetLink}">Confirm email here</a></p>`,
       };
   */
    async sendConfirmEmail(email: string, token: string) {
        const confirmationUrl = `http://${process.env.API_BASE_URL}/auth/confirm-email?token=${token}`;
        console.log("wE will send mail to this " + process.env.API_BASE_URL)
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Confirm Your Email',
            html: `
          <h1>Welcome!</h1>
          <p>Click the link below to confirm your email:</p>
          <a href="${confirmationUrl}"> Confirm email</a>
        `,
        };
        console.log(confirmationUrl);
        await this.transporter.sendMail(mailOptions);
    }
}