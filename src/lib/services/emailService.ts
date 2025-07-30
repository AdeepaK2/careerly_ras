import nodemailer from 'nodemailer';

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_ID,
    pass: process.env.MAIL_PW,
  },
});

// Verify transporter configuration
transporter.verify((error: any, success: any) => {
  if (error) {
    console.error('Email service configuration error:', error);
  } else {
    console.log('Email service is ready to send messages');
  }
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
  }>;
}

export const sendEmail = async (options: EmailOptions): Promise<{ success: boolean; message: string; messageId?: string; error?: any }> => {
  try {
    const mailOptions = {
      from: `"Careerly Platform" <${process.env.MAIL_ID}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      cc: Array.isArray(options.cc) ? options.cc.join(', ') : options.cc,
      bcc: Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: 'Failed to send email',
      error: error.message,
    };
  }
};

// Pre-built email templates for common use cases
export const emailTemplates = {
  // Welcome email for new users
  welcome: (name: string, userType: 'student' | 'employer') => ({
    subject: `Welcome to Careerly - Your ${userType === 'student' ? 'Career Journey' : 'Talent Search'} Begins!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Careerly, ${name}!</h2>
        <p>Thank you for joining our platform. We're excited to help you ${userType === 'student' ? 'find your dream job' : 'discover amazing talent'}.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>What's next?</h3>
          <ul>
            ${userType === 'student' 
              ? '<li>Complete your profile</li><li>Upload your resume</li><li>Browse job opportunities</li>' 
              : '<li>Set up your company profile</li><li>Post job openings</li><li>Browse student profiles</li>'
            }
          </ul>
        </div>
        <p>Best regards,<br>The Careerly Team</p>
      </div>
    `,
  }),

  // Email verification
  verification: (name: string, verificationLink: string) => ({
    subject: 'Verify Your Careerly Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Verify Your Email</h2>
        <p>Hi ${name},</p>
        <p>Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p><small>If the button doesn't work, copy and paste this link: ${verificationLink}</small></p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `,
  }),

  // Job application notification for employers
  jobApplication: (employerName: string, studentName: string, jobTitle: string, resumeUrl?: string) => ({
    subject: `New Application for ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Job Application</h2>
        <p>Dear ${employerName},</p>
        <p>You have received a new application for the position: <strong>${jobTitle}</strong></p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Applicant:</strong> ${studentName}</p>
          ${resumeUrl ? `<p><a href="${resumeUrl}" style="color: #2563eb;">View Resume</a></p>` : ''}
        </div>
        <p>Please log in to your dashboard to review the application.</p>
      </div>
    `,
  }),

  // Application status update for students
  applicationStatus: (studentName: string, jobTitle: string, companyName: string, status: 'accepted' | 'rejected' | 'interview') => ({
    subject: `Application Update: ${jobTitle} at ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Application Update</h2>
        <p>Dear ${studentName},</p>
        <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated.</p>
        <div style="background-color: ${status === 'accepted' ? '#d1fae5' : status === 'interview' ? '#fef3c7' : '#fee2e2'}; 
                    padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Status: ${status === 'accepted' ? 'Accepted! 🎉' : status === 'interview' ? 'Interview Scheduled 📅' : 'Not Selected'}</strong></p>
        </div>
        <p>Please check your dashboard for more details.</p>
      </div>
    `,
  }),

  // Password reset
  passwordReset: (name: string, resetLink: string) => ({
    subject: 'Reset Your Careerly Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p><small>If you didn't request this, please ignore this email.</small></p>
        <p>This link will expire in 1 hour.</p>
      </div>
    `,
  }),
};

// Bulk email function for sending to multiple recipients
export const sendBulkEmail = async (
  recipients: string[],
  template: { subject: string; html: string },
  batchSize: number = 50
): Promise<{ success: boolean; sent: number; failed: number; errors: any[] }> => {
  let sent = 0;
  let failed = 0;
  const errors: any[] = [];

  // Process in batches to avoid rate limits
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    const promises = batch.map(async (email) => {
      try {
        await sendEmail({
          to: email,
          subject: template.subject,
          html: template.html,
        });
        sent++;
      } catch (error) {
        failed++;
        errors.push({ email, error });
      }
    });

    await Promise.allSettled(promises);
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return {
    success: failed === 0,
    sent,
    failed,
    errors,
  };
};