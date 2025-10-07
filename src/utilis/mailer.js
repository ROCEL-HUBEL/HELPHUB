import nodemailer from 'nodemailer';

let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: +process.env.SMTP_PORT,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

export async function sendVerificationEmail(to, token) {
  const verifyUrl = `${process.env.APP_BASE_URL}/api/auth/verify?token=${encodeURIComponent(token)}`;
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Verify your HelpHub email',
    html: `
      <h2>Verify your email</h2>
      <p>Click the button below to verify your account:</p>
      <p><a href="${verifyUrl}" style="background:#1565c0;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none">Verify Email</a></p>
      <p>Or open this link: ${verifyUrl}</p>
    `
  });
  return info;
}
