const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Email templates
const emailTemplates = {
    verification: (verificationUrl) => ({
        subject: 'Verify your email address',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #4F46E5; text-align: center;">Welcome to Campus Event Management</h1>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
                    <p style="font-size: 16px;">Please verify your email address by clicking the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" 
                           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 6px; font-weight: bold;">
                            Verify Email
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #666;">
                        Or copy and paste this link in your browser:<br>
                        <span style="color: #4F46E5;">${verificationUrl}</span>
                    </p>
                    <p style="font-size: 14px; color: #666;">This link will expire in 24 hours.</p>
                </div>
            </div>
        `
    }),

    passwordReset: (resetUrl) => ({
        subject: 'Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #4F46E5; text-align: center;">Password Reset Request</h1>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
                    <p style="font-size: 16px;">You requested a password reset. Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 6px; font-weight: bold;">
                            Reset Password
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #666;">
                        Or copy and paste this link in your browser:<br>
                        <span style="color: #4F46E5;">${resetUrl}</span>
                    </p>
                    <p style="font-size: 14px; color: #666;">
                        This link will expire in 1 hour.<br>
                        If you didn't request this reset, please ignore this email.
                    </p>
                </div>
            </div>
        `
    })
};

// Send email helper function
const sendEmail = async (to, template, data) => {
    try {
        const { subject, html } = emailTemplates[template](data);
        await transporter.sendMail({
            from: `"Campus Events" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

module.exports = { sendEmail }; 