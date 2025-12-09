import { Resend } from 'resend';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sudhirmalini@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'GameSetMatch <onboarding@resend.dev>';
let resend = null;
if (RESEND_API_KEY) {
    resend = new Resend(RESEND_API_KEY);
    console.log('✅ Email service enabled');
}
else {
    console.log('⚠️  Email service disabled - RESEND_API_KEY not set');
}
export const emailService = {
    async notifyAdminNewPlayer(player) {
        if (!resend) {
            console.log('📧 [SKIPPED] Admin notification for:', player.fullName);
            return;
        }
        try {
            await resend.emails.send({
                from: FROM_EMAIL,
                to: ADMIN_EMAIL,
                subject: `New Player Application: ${player.fullName}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center;">
              <h1>New Player Application</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px;">
              <p>Hi Admin,</p>
              <p>A new tennis player has registered on GameSetMatch:</p>
              <div style="background: white; padding: 20px; margin: 20px 0;">
                <p><strong>Name:</strong> ${player.fullName}</p>
                <p><strong>Email:</strong> ${player.email}</p>
                <p><strong>Location:</strong> ${player.location}</p>
                <p><strong>Ranking:</strong> #${player.ranking || 'Not specified'}</p>
                <p><strong>Specialization:</strong> ${player.specialization}</p>
              </div>
              
              ${player.atpStatusHtml || ''}
              
              <p style="text-align: center;">
                <a href="${process.env.APP_URL || 'https://gamesetmatch-production.up.railway.app'}/admin" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Review Application</a>
              </p>
            </div>
          </div>
        `,
            });
            console.log('✅ Admin notification sent for:', player.fullName);
        }
        catch (error) {
            console.error('❌ Failed to send admin notification:', error);
        }
    },
    async notifyPlayerApproved(player) {
        if (!resend) {
            console.log('📧 [SKIPPED] Approval email for:', player.email);
            return;
        }
        try {
            await resend.emails.send({
                from: FROM_EMAIL,
                to: player.email,
                subject: 'Your GameSetMatch Profile Has Been Approved!',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px; text-align: center;">
              <h1>Congratulations, ${player.fullName}!</h1>
              <p style="font-size: 18px;">Your profile is now live on GameSetMatch</p>
            </div>
            <div style="background: #f9fafb; padding: 30px;">
              <p>Great news! Your player profile has been approved and is now visible to potential sponsors.</p>
              <div style="background: white; padding: 20px; margin: 20px 0;">
                <h3>What happens next?</h3>
                <ul>
                  <li>Your profile is now searchable by sponsors</li>
                  <li>Log in and connect your Stripe payouts account from your dashboard</li>
                  <li>You will receive notifications when sponsors show interest</li>
                  <li>You can update your profile anytime from your dashboard</li>
                  <li>Start sharing your profile link with your network</li>
                </ul>
              </div>
              <p style="text-align: center;">
                <a href="${process.env.APP_URL || 'https://gamesetmatch-production.up.railway.app'}/dashboard" style="background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; display: inline-block;">View Your Dashboard</a>
              </p>
              <p>Best of luck with your tennis journey!</p>
              <p><strong>The GameSetMatch Team</strong></p>
            </div>
          </div>
        `,
            });
            console.log('✅ Approval email sent to:', player.email);
        }
        catch (error) {
            console.error('❌ Failed to send approval email:', error);
        }
    },
    async notifyPlayerRejected(player) {
        if (!resend) {
            console.log('📧 [SKIPPED] Rejection email for:', player.email);
            return;
        }
        try {
            await resend.emails.send({
                from: FROM_EMAIL,
                to: player.email,
                subject: 'Update on Your GameSetMatch Application',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center;">
              <h1>Application Update</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px;">
              <p>Hi ${player.fullName},</p>
              <p>Thank you for your interest in GameSetMatch. After careful review, we are unable to approve your profile at this time.</p>
              <div style="background: #fef3c7; padding: 20px; margin: 20px 0;">
                <h3>Common reasons for non-approval:</h3>
                <ul>
                  <li>Incomplete profile information</li>
                  <li>Missing verification documents</li>
                  <li>Profile does not meet current criteria</li>
                  <li>Duplicate account detected</li>
                </ul>
              </div>
              <p><strong>You are welcome to reapply!</strong></p>
              <p>If you believe this was an error or would like feedback, please reach out to our support team.</p>
              <p style="text-align: center;">
                <a href="${process.env.APP_URL || 'https://gamesetmatch-production.up.railway.app'}/signup/player" style="background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; display: inline-block;">Update and Reapply</a>
              </p>
              <p><strong>The GameSetMatch Team</strong></p>
            </div>
          </div>
        `,
            });
            console.log('✅ Rejection email sent to:', player.email);
        }
        catch (error) {
            console.error('❌ Failed to send rejection email:', error);
        }
    },
};
