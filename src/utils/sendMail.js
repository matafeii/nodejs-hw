import nodemailer from 'nodemailer';

const getTransportConfig = () => ({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = (mailOptions) => {
  const transporter = nodemailer.createTransport(getTransportConfig());

  return transporter.sendMail({
    ...mailOptions,
    from: process.env.SMTP_FROM,
  });
};
