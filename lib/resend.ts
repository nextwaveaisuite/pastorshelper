import { Resend } from "resend";

export async function sendWelcomeEmail(email: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  return resend.emails.send({
    from: "The Pastors Helper <noreply@thepastorshelper.com>",
    to: email,
    subject: "Welcome to The Pastors Helper ✝",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="background:#0f0a05;color:#fef3c7;font-family:Georgia,serif;padding:40px;max-width:600px;margin:0 auto;">
        <h1 style="color:#f59e0b;font-size:28px;margin-bottom:8px;">The Pastors Helper</h1>
        <p style="color:#fbbf24;font-size:13px;letter-spacing:2px;margin-bottom:32px;">SPIRIT-LED SERMON BUILDER</p>
        <p style="font-size:16px;line-height:1.7;margin-bottom:24px;">
          Welcome. Your account is ready and the Word is waiting.
        </p>
        <p style="font-size:16px;line-height:1.7;margin-bottom:32px;">
          Begin building your first sermon — anchored in Scripture, guided by the Spirit.
        </p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard"
           style="background:#f59e0b;color:#0f0a05;padding:14px 28px;text-decoration:none;font-weight:bold;display:inline-block;border-radius:4px;">
          Go to Dashboard →
        </a>
        <p style="margin-top:48px;font-size:13px;color:#78716c;">
          "Your word is a lamp to my feet and a light to my path." — Psalm 119:105
        </p>
      </body>
      </html>
    `,
  });
}
