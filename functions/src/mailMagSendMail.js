const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
require("dotenv").config();
require("date-utils");
const fromAddress = process.env.MAIL_MAG_FROM_EMAIL_ADDRESS;
const toAddress = process.env.MAIL_MAG_TO_EMAIL_ADDRESS;
const password = process.env.MAIL_MAG_EMAIL_PASSWORD;
const host = process.env.EMAIL_HOST;
const port = process.env.EMAIL_PORT;

const mailTransport = nodemailer.createTransport({
  host: host,
  port: port,
  auth: {
    user: fromAddress,
    pass: password,
  },
});

module.exports = functions.https.onCall((data, ctx) => {
  const id = data.memberId;
  const mail = data.mail;

  if (id === "" || typeof id === "undefined") {
    throw new functions.https.HttpsError("invalid-argument", "id not found");
  }

  if (mail === "" || typeof mail === "undefined") {
    throw new functions.https.HttpsError("invalid-argument", "mail not found");
  }

  const emailObj = {
    from: fromAddress,
    to: toAddress,
    subject: "[RTUG-S]メルマガ配信登録希望",
    text: `----------------------\n会員番号：${id}\nメールアドレス：${mail}\n----------------------`,
  };

  mailTransport.sendMail(emailObj, (err) => {
    if (err) {
      throw new functions.https.HttpsError("internal", "failed");
    }
  });

  mailTransport.close();

  return {
    message: "success",
  };
});
