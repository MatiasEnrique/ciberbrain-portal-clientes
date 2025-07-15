import nodemailer from "nodemailer";

export async function sendEmail(email: string, subject: string, body: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.sendMail({
    from: {
      name: process.env.EMAIL_SENDER_ALIAS ?? "Portal de Clientes",
      address: process.env.EMAIL_USER!,
    },
    to: email,
    subject: subject,
    html: body,
  });
}
