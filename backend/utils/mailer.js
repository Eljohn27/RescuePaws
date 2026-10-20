import ApiError from "./ApiError.js";

export async function sendOtpEmail({ to, subject, intro, otp }) {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    throw new ApiError(503, "Email verification is not configured. Set BREVO_API_KEY in environment variables.");
  }

  const text = `${intro}\n\nYour verification code: ${otp}\n\nIt expires in 5 minutes. If you did not request this, you can safely ignore this email.`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
    <h2 style="margin:0 0 8px;color:#9E4624">RescuePaws</h2>
    <p style="color:#334155;font-size:14px;line-height:1.5">${intro}</p>
    <p style="font-size:32px;letter-spacing:8px;font-weight:700;color:#0f172a;margin:18px 0">${otp}</p>
    <p style="color:#64748b;font-size:12px">This code expires in 5 minutes. If you did not request it, you can safely ignore this email.</p>
  </div>`;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "RescuePaws", email: "eljohnalcaide45@gmail.com" }, 
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Brevo API error:", errorText);
    throw new ApiError(500, "Failed to send verification email.");
  }
}