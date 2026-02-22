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
    const { candidateName, candidateEmail, candidatePosition } =
      await request.json();

    // Validate required fields
    if (!candidateName || !candidateEmail || !candidatePosition) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Email content
    const interviewLink = `https://intelliview-itfzztdoz-yzhuangintcds-projects.vercel.app/interview_environment?email=${encodeURIComponent(candidateEmail)}`;
    const emailHtml = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { padding: 20px; background: white; }
            .button { display: inline-block; background-color: #667eea; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Intelliviews</h1>
              <p>Your AI-Powered Interview Experience</p>
            </div>
            <div class="content">
              <h2>Hello ${candidateName},</h2>
              <p>We're excited to invite you to complete your interview for the <strong>${candidatePosition}</strong> position.</p>
              
              <p>Our interview process uses an innovative AI-powered approach with a virtual working environment. Rather than traditional back-and-forth questions, you'll work through realistic scenarios that showcase your actual problem-solving abilities.</p>
              
              <h3>What to expect:</h3>
              <ul>
                <li><strong>Technical Assessment:</strong> Solve real-world coding challenges (30 min)</li>
                <li><strong>Behavioural Assessment:</strong> Navigate realistic workplace scenarios (25 min)</li>
                <li><strong>Work Simulation:</strong> Experience a day in the role with real constraints (35 min)</li>
              </ul>
              
              <p><strong>Click the button below to begin your interview:</strong></p>
              <a href="${interviewLink}" class="button">Start Interview</a>
              
              <p>Or copy and paste this link into your browser: <br/><code>${interviewLink}</code></p>
              
              <p><strong>Tips for success:</strong></p>
              <ul>
                <li>Find a quiet space with a stable internet connection</li>
                <li>Speak naturally and explain your reasoning</li>
                <li>Focus on quality over speed — there's no time pressure</li>
                <li>Treat it like a real work environment</li>
              </ul>
              
              <p>If you have any questions, feel free to reach out to our team.</p>
              
              <p>Best of luck! We look forward to seeing what you can do.</p>
              
              <p>Warm regards,<br/>The Intelliviews Team</p>
            </div>
            <div class="footer">
              <p>© 2026 Intelliviews. All rights reserved.</p>
              <p>This is an automated email. Please do not reply directly.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: candidateEmail,
      subject: `Interview Invitation - ${candidatePosition}`,
      html: emailHtml,
    });

    console.log('✅ Email sent successfully to:', candidateEmail);
    console.log('📧 Message ID:', info.messageId);

    return NextResponse.json(
      {
        success: true,
        message: `Interview email sent to ${candidateEmail}`,
        interviewLink,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email. Check your email configuration.' },
      { status: 500 }
    );
  }
}
