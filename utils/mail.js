import nodemailer from "nodemailer";
import "dotenv/config";
import Mailgen from "mailgen";

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_SMTP_HOST,
  port: Number(process.env.MAILTRAP_SMTP_PORT),
  auth: {
    user: process.env.MAILTRAP_SMTP_USERNAME,
    pass: process.env.MAILTRAP_SMTP_PASSWORD,
  },
});

export const sendMail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "basecamp",
      link: "https://www.basecampurl.com",
    },
  });

  const emailText = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  const mail = {
    from: "Basecamp <noreply@basecamp.com>",
    to: options.email,
    subject: options.subject,
    text: emailText,
    html: emailHtml,
  };
  try {
    return await transporter.sendMail(mail);
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
};
export const emailVerificationTemplate = (userName, verificationLink) => {
  return {
    body: {
      name: userName,
      intro: "welcome to Basecamp! We're very excited to have you on board.",
      action: {
        instructions:
          "To get started with Basecamp, please click the button below to verify your email address.",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Verify your Email Address",
          link: verificationLink,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export const forgotPasswordEmailTemplate = (userName, passwordResetLink) => {
  return {
    body: {
      name: userName,
      intro:
        "You have requested to reset your password. Please click the button below to reset your password.",
      action: {
        instructions:
          "To get started with Basecamp, please click the button below to reset your password.",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Reset your Password",
          link: passwordResetLink,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};
