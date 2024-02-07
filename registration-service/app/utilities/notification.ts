import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import nodemailer from "nodemailer";

const getSmtpCredentials = async () => {
  const secretName = process.env.SMTP_SECRET_NAME;
  const region = process.env.AWS_REGION;

  const client = new SecretsManagerClient({ region });

  let response;
  try {
    response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: "AWSCURRENT",
      })
    );
  } catch (error) {
    console.error(
      "Error retrieving database credentials from Secrets Manager:",
      error
    );
    throw error;
  }
  const secretString = response.SecretString || "";
  return JSON.parse(secretString);
};

const sendMail = async (code: number, toEmail: string) => {
  const smtpCredentials = await getSmtpCredentials();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpCredentials.user,
      pass: smtpCredentials.password,
    },
  });

  const mailOptions = {
    from: smtpCredentials.user,
    to: toEmail.trim(),
    subject: "Verification Code",
    text: `Your verification code is ${code}. It will expire within 30 minutes.`,
  };

  const response = await transporter.sendMail(mailOptions);
  console.log(response);
  return response;
};

export const GenerateAccessCode = () => {
  const code = Math.floor(10000 + Math.random() * 900000);
  const expiry = new Date();
  expiry.setTime(new Date().getTime() + 30 * 60 * 1000);
  return { code, expiry };
};

export const SendVerificationCode = async (code: number, toEmail: string) => {
  await sendMail(code, toEmail);
};
