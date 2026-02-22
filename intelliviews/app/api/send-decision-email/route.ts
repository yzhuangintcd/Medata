import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configure Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { candidateEmail, candidateName, subject, body, decision } = await request.json();

    // Validate required fields
    if (!candidateEmail || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: candidateEmail, subject, and body are required' },
        { status: 400 }
      );
    }

    // Determine header color based on decision
    let headerColor = '#667eea'; // default blue
    let headerTitle = 'Update on Your Application';
    
    if (decision === 'hire') {
      headerColor = '#10b981'; // green
      headerTitle = 'Great News About Your Application!';
    } else if (decision === 'reject') {
      headerColor = '#ef4444'; // red
      headerTitle = 'Update on Your Application';
    } else if (decision === 'review') {
      headerColor = '#f59e0b'; // amber
      headerTitle = 'Next Steps in Your Application';
    }

    // Convert plain text body to HTML with proper formatting
    const formattedBody = body
      .split('\n\n')
      .map((paragraph: string) => `<p>${paragraph}</p>`)
      .join('');

    const emailHtml = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
            .header { background-color: ${headerColor}; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { padding: 30px; background: white; }
            .content p { margin-bottom: 15px; line-height: 1.8; }
            .footer { font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; }
            .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; }
            .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${headerTitle}</h1>
            </div>
            <div class="content">
              ${candidateName ? `<p class="greeting">Dear ${candidateName},</p>` : ''}
              ${formattedBody}
              <div class="signature">
                <p>Best regards,<br/>The Hiring Team</p>
              </div>
            </div>
            <div class="footer">
              <p>© 2026 Intelliviews. All rights reserved.</p>
              <p>This email was sent from an automated hiring system.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: `"Hiring Team" <${process.env.EMAIL_USER}>`,
      to: candidateEmail,
      subject: subject,
      html: emailHtml,
      text: body, // Plain text fallback
    });

    console.log('✅ Decision email sent successfully to:', candidateEmail);
    console.log('📧 Message ID:', info.messageId);
    console.log('📝 Decision type:', decision);

    return NextResponse.json(
      {
        success: true,
        message: 'Email sent successfully',
        messageId: info.messageId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
