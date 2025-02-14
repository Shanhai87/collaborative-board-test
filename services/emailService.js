import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_APP,
    pass: process.env.GMAIL_APP_PASSWORD,  // Используй App Password
  },
});

export const sendConfirmationEmail = async (email, token) => {
  const mailOptions = {
    from: process.env.GMAIL_APP,
    to: email,
    subject: 'Подтверждение регистрации',
    html: `<p>Пожалуйста, подтвердите свою регистрацию, перейдя по следующей ссылке: <a href="https://collaborative-board-test.vercel.app/confirm?token=${token}">Подтвердить</a></p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Письмо отправлено:', info);
  } catch (error) {
    console.error('Ошибка при отправке письма:', error);
  }
};
