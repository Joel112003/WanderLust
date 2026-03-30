const nodemailer = require("nodemailer");

let transporter = null;

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

const bookingCancelledHtml = ({
  guestName,
  listingTitle,
  reason,
  checkIn,
  checkOut,
  refundAmount,
  isLastMinute,
}) =>
  wrap(`
    <table width="100%" cellpadding="0" cellspacing="0">
      ${accentBar("#C8382A")}
      ${bodyPad(`
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#C8382A;letter-spacing:0.08em;text-transform:uppercase;">Booking Cancelled</p>
        <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#0A0A08;line-height:1.2;">Your booking has been cancelled</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#6B6B60;line-height:1.7;">
          Hi <strong>${guestName}</strong>, we're sorry to inform you that your booking has been cancelled by the host.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;border-radius:12px;border:1px solid #EBEBЕ7;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 12px;font-size:17px;font-weight:700;color:#0A0A08;">${listingTitle}</p>
            <p style="margin:0 0 4px;font-size:14px;color:#6B6B60;"><strong>Check-in:</strong> ${new Date(
              checkIn
            ).toLocaleDateString()}</p>
            <p style="margin:0 0 4px;font-size:14px;color:#6B6B60;"><strong>Check-out:</strong> ${new Date(
              checkOut
            ).toLocaleDateString()}</p>
            <p style="margin:0 0 12px;font-size:14px;color:#6B6B60;"><strong>Refund:</strong> ₹${refundAmount.toLocaleString()}</p>
            ${
              reason
                ? `<p style="margin:0;font-size:14px;color:#6B6B60;line-height:1.6;"><strong>Reason:</strong> ${reason}</p>`
                : ""
            }
          </td></tr>
        </table>

        ${
          isLastMinute
            ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FEF3C7;border-radius:12px;border:1px solid #FCD34D;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0;font-size:14px;color:#92400E;line-height:1.6;">
              ⚠️ <strong>Last-minute cancellation:</strong> We're actively finding you alternative accommodation nearby. You'll receive options shortly.
            </p>
          </td></tr>
        </table>`
            : ""
        }

        <p style="margin:0 0 24px;font-size:15px;color:#6B6B60;line-height:1.7;">
          Your refund will be processed within 5-7 business days. If you have any questions, please contact our support team.
        </p>
        ${btn(
          "View Alternative Properties",
          `${process.env.FRONTEND_URL}/bookings`,
          "#C8382A"
        )}
      `)}
    </table>
  `);

// 5. Alternative Accommodation Suggestions
const alternativeAccommodationHtml = ({
  guestName,
  originalListing,
  alternatives,
  alternativeBookingId,
}) =>
  wrap(`
    <table width="100%" cellpadding="0" cellspacing="0">
      ${accentBar("#3B82F6")}
      ${bodyPad(`
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#3B82F6;letter-spacing:0.08em;text-transform:uppercase;">Alternative Accommodation</p>
        <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#0A0A08;line-height:1.2;">We found great alternatives for you!</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#6B6B60;line-height:1.7;">
          Hi <strong>${guestName}</strong>, we've found similar properties near your original location that match your preferences.
        </p>

        ${alternatives
          .slice(0, 3)
          .map(
            (alt) => `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;border-radius:12px;border:1px solid #EBEBЕ7;margin-bottom:16px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 8px;font-size:17px;font-weight:700;color:#0A0A08;">${
              alt.title
            }</p>
            <p style="margin:0 0 4px;font-size:14px;color:#6B6B60;">📍 ${alt.location}</p>
            <p style="margin:0 0 4px;font-size:14px;color:#6B6B60;">💰 ₹${
              alt.price || alt.pricing?.finalPrice || 0
            }/night</p>
            <p style="margin:0 0 4px;font-size:14px;color:#6B6B60;">👥 ${
              alt.guests
            } guests • ${alt.bedrooms} bedrooms</p>
            <p style="margin:0;font-size:14px;color:#16A34A;font-weight:600;">✨ ${
              alt.similarityScore
            }% match</p>
          </td></tr>
        </table>
        `
          )
          .join("")}

        <p style="margin:24px 0;font-size:15px;color:#6B6B60;line-height:1.7;">
          Select your preferred option within 24 hours to confirm your alternative booking. Any price difference will be covered by us.
        </p>
        ${btn(
          "Choose Your Alternative",
          `${process.env.FRONTEND_URL}/booking/alternative/${alternativeBookingId}`,
          "#3B82F6"
        )}
      `)}
    </table>
  `);

const reportSubmittedHtml = ({
  reporterName,
  ticketNumber,
  reportType,
  listingTitle,
  severity,
}) =>
  wrap(`
    <table width="100%" cellpadding="0" cellspacing="0">
      ${accentBar("#F59E0B")}
      ${bodyPad(`
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#F59E0B;letter-spacing:0.08em;text-transform:uppercase;">Report Received</p>
        <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#0A0A08;line-height:1.2;">We're investigating your report</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#6B6B60;line-height:1.7;">
          Hi <strong>${reporterName}</strong>, thank you for bringing this to our attention. We take all reports seriously.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;border-radius:12px;border:1px solid #EBEBЕ7;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 8px;font-size:13px;color:#A8A89E;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Report Details</p>
            <p style="margin:0 0 4px;font-size:14px;color:#6B6B60;"><strong>Ticket Number:</strong> ${ticketNumber}</p>
            <p style="margin:0 0 4px;font-size:14px;color:#6B6B60;"><strong>Property:</strong> ${listingTitle}</p>
            <p style="margin:0 0 4px;font-size:14px;color:#6B6B60;"><strong>Issue Type:</strong> ${reportType
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}</p>
            <p style="margin:0;font-size:14px;color:#6B6B60;"><strong>Priority:</strong> <span style="color:${
              severity === "critical"
                ? "#DC2626"
                : severity === "high"
                ? "#F59E0B"
                : "#6B6B60"
            };">${severity.toUpperCase()}</span></p>
          </td></tr>
        </table>

        ${
          severity === "critical" || severity === "high"
            ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FEF3C7;border-radius:12px;border:1px solid #FCD34D;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0;font-size:14px;color:#92400E;line-height:1.6;">
              🚀 Due to the severity of this issue, we're working on finding alternative accommodation for you immediately.
            </p>
          </td></tr>
        </table>`
            : ""
        }

        <p style="margin:0 0 24px;font-size:15px;color:#6B6B60;line-height:1.7;">
          Our support team will review your case and contact you within 24 hours. You can track the status of your report in your dashboard.
        </p>
        ${btn(
          "Track Report Status",
          `${process.env.FRONTEND_URL}/reports/${ticketNumber}`,
          "#F59E0B"
        )}
      `)}
    </table>
  `);

// 7. Alternative Booking Confirmed
const alternativeBookingConfirmedHtml = ({
  guestName,
  confirmationNumber,
  listingTitle,
  checkIn,
  checkOut,
  totalAmount,
  listingId,
}) =>
  wrap(`
    <table width="100%" cellpadding="0" cellspacing="0">
      ${accentBar("#16A34A")}
      ${bodyPad(`
        <div style="width:56px;height:56px;background:#F0FDF4;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
          <span style="font-size:28px;">✅</span>
        </div>
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#16A34A;letter-spacing:0.08em;text-transform:uppercase;">Booking Confirmed</p>
        <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#0A0A08;line-height:1.2;">Your alternative booking is confirmed!</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#6B6B60;line-height:1.7;">
          Hi <strong>${guestName}</strong>, great news! Your new accommodation has been confirmed.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;border-radius:12px;border:1px solid #EBEBЕ7;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 8px;font-size:13px;color:#A8A89E;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Booking Details</p>
            <p style="margin:0 0 12px;font-size:17px;font-weight:700;color:#0A0A08;">${listingTitle}</p>
            <p style="margin:0 0 4px;font-size:14px;color:#6B6B60;"><strong>Confirmation #:</strong> ${confirmationNumber}</p>
            <p style="margin:0 0 4px;font-size:14px;color:#6B6B60;"><strong>Check-in:</strong> ${new Date(
              checkIn
            ).toLocaleDateString()}</p>
            <p style="margin:0 0 4px;font-size:14px;color:#6B6B60;"><strong>Check-out:</strong> ${new Date(
              checkOut
            ).toLocaleDateString()}</p>
            <p style="margin:0;font-size:16px;color:#0A0A08;font-weight:700;"><strong>Total:</strong> ₹${totalAmount.toLocaleString()}</p>
          </td></tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#DBEAFE;border-radius:12px;border:1px solid #93C5FD;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0;font-size:14px;color:#1E40AF;line-height:1.6;">
              💝 Any price difference has been covered by Wanderlust as a courtesy for the inconvenience.
            </p>
          </td></tr>
        </table>

        <p style="margin:0;">
          ${btn(
            "View Booking Details",
            `${process.env.FRONTEND_URL}/listings/${listingId}`,
            "#16A34A"
          )}
        </p>
      `)}
    </table>
  `);

// ─── Send helpers for new features ────────────────────────────────────────────

exports.sendCancellationEmail = async (guestEmail, details) => {
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: `"Wanderlust" <${process.env.GMAIL_USER}>`,
      to: guestEmail,
      subject: `Booking Cancellation - ${details.listingTitle}`,
      html: bookingCancelledHtml(details),
    });
    console.log(`📧 Cancellation email sent to ${guestEmail}`);
  } catch (err) {
    console.error("Failed to send cancellation email:", err.message);
  }
};

exports.sendAlternativeAccommodationEmail = async (guestEmail, details) => {
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: `"Wanderlust" <${process.env.GMAIL_USER}>`,
      to: guestEmail,
      subject: `We found great alternatives for your trip!`,
      html: alternativeAccommodationHtml(details),
    });
    console.log(`📧 Alternative accommodation email sent to ${guestEmail}`);
  } catch (err) {
    console.error("Failed to send alternative accommodation email:", err.message);
  }
};

exports.sendReportConfirmationEmail = async (reporterEmail, details) => {
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: `"Wanderlust" <${process.env.GMAIL_USER}>`,
      to: reporterEmail,
      subject: `Report Received - Ticket #${details.ticketNumber}`,
      html: reportSubmittedHtml(details),
    });
    console.log(`📧 Report confirmation sent to ${reporterEmail}`);
  } catch (err) {
    console.error("Failed to send report confirmation:", err.message);
  }
};

exports.sendAlternativeBookingConfirmation = async (guestEmail, details) => {
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: `"Wanderlust" <${process.env.GMAIL_USER}>`,
      to: guestEmail,
      subject: `Booking Confirmed - ${details.confirmationNumber}`,
      html: alternativeBookingConfirmedHtml(details),
    });
    console.log(`📧 Alternative booking confirmation sent to ${guestEmail}`);
  } catch (err) {
    console.error(
      "Failed to send alternative booking confirmation:",
      err.message
    );
  }
};
