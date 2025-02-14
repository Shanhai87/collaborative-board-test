import nodemailer from 'nodemailer';

export const sendConfirmationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Подтверждение email',
    html: `<h1>Подтвердите свой email</h1><p>Для подтверждения перейдите по <a href="http://localhost:3000/confirm/${token}">ссылке</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};
