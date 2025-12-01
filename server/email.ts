import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sudhirmalini@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'GameSetMatch <noreply@gamesetmatch.com>';

export const emailService = {
  // Email admin when new player signs up
  async notifyAdminNewPlayer(player: {
    fullName: string;
    email: string;
    location: string;
    ranking?: string;
    specialization: string;
  }) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `🎾 New Player Application: ${player.fullName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .player-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                .label { font-weight: bold; color: #6b7280; }
                .value { color: #111827; }
                .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
                .button:hover { background: #059669; }
                .footer { text-align: center; color: #6b7280; margin-top: 30px; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎾 New Player Application</h1>
                </div>
                <div class="content">
                  <p>Hi Admin,</p>
                  <p>A new tennis player has registered on GameSetMatch and is awaiting your review:</p>
                  
                  <div class="player-info">
                    <h2 style="margin-top: 0; color: #10b981;">Player Details</h2>
                    <div class="info-row">
                      <span class="label">Name:</span>
                      <span class="value">${player.fullName}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Email:</span>
                      <span class="value">${player.email}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Location:</span>
                      <span class="value">${player.location}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Ranking:</span>
                      <span class="value">#${player.ranking || 'Not specified'}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Specialization:</span>
                      <span class="value">${player.specialization}</span>
                    </div>
                  </div>

                  <p style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.APP_URL || 'https://gamesetmatch-production.up.railway.app'}/admin" class="button">Review Application</a>
                  </p>

                  <div class="footer">
                    <p>This is an automated notification from GameSetMatch</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      });
      console.log('✅ Admin notification sent for new player:', player.fullName);
    } catch (error) {
      console.error('❌ Failed to send admin notification:', error);
    }
  },

  // Email player when approved
  async notifyPlayerApproved(player: {
    fullName: string;
    email: string;
  }) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: player.email,
        subject: '🎉 Your GameSetMatch Profile Has Been Approved!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .success-icon { font-size: 60px; margin-bottom: 20px; }
                .highlight-box { background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 4px; }
                .button { display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
                .button:hover { background: #059669; }
                .footer { text-align: center; color: #6b7280; margin-top: 30px; font-size: 14px; }
                ul { line-height: 2; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="success-icon">🎉</div>
                  <h1>Congratulations, ${player.fullName}!</h1>
                  <p style="font-size: 18px; margin: 0;">Your profile is now live on GameSetMatch</p>
                </div>
                <div class="content">
                  <p>Great news! Your player profile has been approved and is now visible to potential sponsors.</p>

                  <div class="highlight-box">
                    <h3 style="margin-top: 0; color: #10b981;">What happens next?</h3>
                    <ul style="padding-left: 20px;">
                      <li>Your profile is now searchable by sponsors</li>
                      <li>You'll receive notifications when sponsors show interest</li>
                      <li>You can update your profile anytime from your dashboard</li>
                      <li>Start sharing your profile link with your network</li>
                    </ul>
                  </div>

                  <p style="text-align: center;">
                    <a href="${process.env.APP_URL || 'https://gamesetmatch-production.up.railway.app'}/dashboard" class="button">View Your Dashboard</a>
                  </p>

                  <p style="margin-top: 30px;">Tips for success:</p>
                  <ul>
                    <li>Keep your profile updated with recent achievements</li>
                    <li>Share your profile on social media</li>
                    <li>Engage with sponsors professionally</li>
                    <li>Update your funding goals regularly</li>
                  </ul>

                  <p>Best of luck with your tennis journey!</p>

                  <p style="margin-top: 30px;">
                    <strong>The GameSetMatch Team</strong><br>
                    <em>Connecting tennis talent with sponsors</em>
                  </p>

                  <div class="footer">
                    <p>Questions? Reply to this email or contact us at support@gamesetmatch.com</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      });
      console.log('✅ Approval email sent to:', player.email);
    } catch (error) {
      console.error('❌ Failed to send approval email:', error);
    }
  },

  // Email player when rejected
  async notifyPlayerRejected(player: {
    fullName: string;
    email: string;
  }) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: player.email,
        subject: 'Update on Your GameSetMatch Application',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .info-box { background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px; }
                .button { display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; color: #6b7280; margin-top: 30px; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Application Update</h1>
                </div>
                <div class="content">
                  <p>Hi ${player.fullName},</p>

                  <p>Thank you for your interest in GameSetMatch. After careful review, we're unable to approve your profile at this time.</p>

                  <div class="info-box">
                    <h3 style="margin-top: 0; color: #92400e;">Common reasons for non-approval:</h3>
                    <ul>
                      <li>Incomplete profile information</li>
                      <li>Missing verification documents</li>
                      <li>Profile doesn't meet current criteria</li>
                      <li>Duplicate account detected</li>
                    </ul>
                  </div>

                  <p><strong>You're welcome to reapply!</strong></p>
                  <p>If you believe this was an error or would like feedback, please reach out to our support team. We're here to help you succeed.</p>

                  <p style="text-align: center;">
                    <a href="${process.env.APP_URL || 'https://gamesetmatch-production.up.railway.app'}/signup/player" class="button">Update & Reapply</a>
                  </p>

                  <p style="margin-top: 30px;">
                    <strong>The GameSetMatch Team</strong><br>
                    <em>Connecting tennis talent with sponsors</em>
                  </p>

                  <div class="footer">
                    <p>Questions? Contact us at support@gamesetmatch.com</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      });
      console.log('✅ Rejection email sent to:', player.email);
    } catch (error) {
      console.error('❌ Failed to send rejection email:', error);
    }
  },
};{\rtf1}