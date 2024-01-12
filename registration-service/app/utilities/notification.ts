import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mikolaskidan17@gmail.com",
    pass: "jwcz dwvf zetx nqnu",
  },
});

export const GenerateAccessCode = () => {
  const code = Math.floor(10000 + Math.random() * 900000);
  let expiry = new Date();
  expiry.setTime(new Date().getTime() + 30 * 60 * 1000);
  return { code, expiry };
};

export const SendVerificationCode = async (code: number, toEmail: string) => {
  const mailOptions = {
    from: "mikolaskidan17@gmail.com",
    to: toEmail.trim(),
    subject: "Verification Code",
    text: `Your verification code is ${code}. It will expire within 30 minutes.`,
  };

  const response = await transporter.sendMail(mailOptions);
  console.log(response);
  return response;
};
