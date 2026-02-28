const nodemailer = require("nodemailer");

let transporter = null;

// Only create transporter if credentials exist
if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  transporter.verify((err) => {
    if (err) {
      console.error("❌ Email configuration error:", err.message);
    } else {
      console.log("✅ Email service ready");
    }
  });
} else {
  console.log("⚠️ Email service disabled (no credentials provided)");
}
// ─── Shared styles ───────────────────────────────────────────────────────────
const wrap = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#F7F7F5;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F7F5;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Logo bar -->
        <tr>
          <td style="padding-bottom:24px;text-align:center;">
            <span style="font-size:22px;font-weight:800;color:#0A0A08;letter-spacing:-0.5px;">
              Wander<span style="color:#C8382A;">lust</span>
            </span>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 0;text-align:center;color:#A8A89E;font-size:12px;line-height:1.6;">
            © ${new Date().getFullYear()} Wanderlust · You're receiving this because you have an account.<br/>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

const accentBar = (color = '#C8382A') =>
  `<tr><td style="height:5px;background:${color};"></td></tr>`;

const bodyPad = (inner) =>
  `<tr><td style="padding:36px 40px;">${inner}</td></tr>`;

const btn = (text, href, color = '#C8382A') =>
  `<a href="${href}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;
    font-weight:700;font-size:15px;padding:14px 32px;border-radius:100px;margin-top:24px;">${text}</a>`;

// ─── Email Templates ──────────────────────────────────────────────────────────

// 1. Admin notified when a new listing is submitted
const newListingAdminHtml = ({ listingTitle, ownerName, ownerEmail, listingId, adminUrl }) =>
  wrap(`
    <table width="100%" cellpadding="0" cellspacing="0">
      ${accentBar('#0A0A08')}
      ${bodyPad(`
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#C8382A;letter-spacing:0.08em;text-transform:uppercase;">Action Required</p>
        <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#0A0A08;line-height:1.2;">New listing pending review</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#6B6B60;line-height:1.7;">
          A new listing has been submitted and is waiting for your approval.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;border-radius:12px;border:1px solid #EBEBЕ7;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 8px;font-size:13px;color:#A8A89E;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Listing Details</p>
            <p style="margin:0 0 4px;font-size:17px;font-weight:700;color:#0A0A08;">${listingTitle}</p>
            <p style="margin:0;font-size:14px;color:#6B6B60;">Submitted by <strong>${ownerName}</strong> (${ownerEmail})</p>
          </td></tr>
        </table>

        <p style="margin:0;">
          ${btn('Review in Admin Panel', adminUrl || `${process.env.FRONTEND_URL}/admin/listings`, '#0A0A08')}
        </p>
      `)}
    </table>
  `);

// 2. User notified their listing was approved
const listingApprovedHtml = ({ ownerName, listingTitle, listingUrl }) =>
  wrap(`
    <table width="100%" cellpadding="0" cellspacing="0">
      ${accentBar('#22C55E')}
      ${bodyPad(`
        <div style="width:56px;height:56px;background:#F0FDF4;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
          <span style="font-size:28px;">🎉</span>
        </div>
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#16A34A;letter-spacing:0.08em;text-transform:uppercase;">Approved</p>
        <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#0A0A08;line-height:1.2;">Your listing is live!</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#6B6B60;line-height:1.7;">
          Hi <strong>${ownerName}</strong>, great news! Your listing <strong>"${listingTitle}"</strong> has been approved and is now visible to travelers worldwide.
        </p>
        <p style="margin:0;">
          ${btn('View Your Listing', listingUrl, '#16A34A')}
        </p>
      `)}
    </table>
  `);

// 3. User notified their listing was rejected (with reason)
const listingRejectedHtml = ({ ownerName, listingTitle, reason }) =>
  wrap(`
    <table width="100%" cellpadding="0" cellspacing="0">
      ${accentBar('#C8382A')}
      ${bodyPad(`
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#C8382A;letter-spacing:0.08em;text-transform:uppercase;">Not Approved</p>
        <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#0A0A08;line-height:1.2;">Your listing needs changes</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#6B6B60;line-height:1.7;">
          Hi <strong>${ownerName}</strong>, unfortunately your listing <strong>"${listingTitle}"</strong> could not be approved at this time.
        </p>

        ${reason ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF5F4;border-radius:12px;border:1px solid #FECACA;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#C8382A;text-transform:uppercase;letter-spacing:0.06em;">Reason from admin</p>
            <p style="margin:0;font-size:15px;color:#0A0A08;line-height:1.6;">${reason}</p>
          </td></tr>
        </table>` : ''}

        <p style="margin:0 0 24px;font-size:15px;color:#6B6B60;line-height:1.7;">
          Please make the necessary changes and submit a new listing.
        </p>
        ${btn('Create a New Listing', `${process.env.FRONTEND_URL}/listings/new`)}
      `)}
    </table>
  `);

// ─── Send helpers ─────────────────────────────────────────────────────────────

exports.sendNewListingAlert = async (data) => {
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: `"Wanderlust" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER,
      subject: `🏡 New listing pending review: "${data.listingTitle}"`,
      html: newListingAdminHtml(data),
    });

    console.log("📧 Admin notified");
  } catch (err) {
    console.error("Failed to send new listing alert:", err.message);
  }
};
exports.sendListingApproved = async ({ ownerEmail, ownerName, listingTitle, listingId }) => {
  try {
    await transporter.sendMail({
      from: `"Wanderlust" <${process.env.GMAIL_USER}>`,
      to: ownerEmail,
      subject: `✅ Your listing "${listingTitle}" is now live!`,
      html: listingApprovedHtml({
        ownerName,
        listingTitle,
        listingUrl: `${process.env.FRONTEND_URL}/listings/${listingId}`,
      }),
    });
    console.log(`📧 Approval email sent to ${ownerEmail}`);
  } catch (err) {
    console.error('Failed to send approval email:', err.message);
  }
};

exports.sendListingRejected = async ({ ownerEmail, ownerName, listingTitle, reason }) => {
  try {
    await transporter.sendMail({
      from: `"Wanderlust" <${process.env.GMAIL_USER}>`,
      to: ownerEmail,
      subject: `Your listing "${listingTitle}" needs changes`,
      html: listingRejectedHtml({ ownerName, listingTitle, reason }),
    });
    console.log(`📧 Rejection email sent to ${ownerEmail}`);
  } catch (err) {
    console.error('Failed to send rejection email:', err.message);
  }
};