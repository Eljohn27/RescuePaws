// Sends the 6-digit verification emails through Gmail SMTP (plain text + simple HTML, no emoji).
import nodemailer from "nodemailer";
import env from "../config/env.js";
import ApiError from "./ApiError.js";
import { maskEmail } from "./otp.js";

let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: env.gmailUser, pass: env.gmailAppPassword },
    });
  }
  return transporter;
};

export async function sendOtpEmail({ to, subject, intro, otp }) {
  if (!env.gmailUser || !env.gmailAppPassword) {
    throw new ApiError(503, "Email verification is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env.");
  }
  const text = `${intro}\n\nYour verification code: ${otp}\n\nIt expires in 5 minutes. If you did not request this, you can safely ignore this email.`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
    <h2 style="margin:0 0 8px;color:#9E4624">RescuePaws</h2>
    <p style="color:#334155;font-size:14px;line-height:1.5">${intro}</p>
    <p style="font-size:32px;letter-spacing:8px;font-weight:700;color:#0f172a;margin:18px 0">${otp}</p>
    <p style="color:#64748b;font-size:12px">This code expires in 5 minutes. If you did not request it, you can safely ignore this email.</p>
  </div>`;
  try {
    const info = await getTransporter().sendMail({ from: `RescuePaws <${env.gmailUser}>`, to, subject, text, html });
    const accepted = (info.accepted || []).map((a) => String(a).toLowerCase());
    if (!accepted.includes(String(to).toLowerCase())) {
      const err = new Error("SMTP did not accept the recipient");
      err.code = "ERECIPIENT";
      throw err;
    }
    console.info("[mail] verification email accepted", { recipient: maskEmail(to), messageId: info.messageId });
  } catch (error) {
    console.error("[mail] verification email failed", { code: error.code || "UNKNOWN", responseCode: error.responseCode || null });
    throw new ApiError(502, "We couldn't send the verification email. Check the Gmail sender settings and try again.");
  }
}
