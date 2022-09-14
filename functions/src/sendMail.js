const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
require("dotenv").config();
require("date-utils");
const address = process.env.EMAIL_ADDRESS;
const password = process.env.EMAIL_PASSWORD;
const host = process.env.EMAIL_HOST;
const port = process.env.EMAIL_PORT;
process.env.TZ = "Asia/Tokyo";

admin.initializeApp();

const mailTransport = nodemailer.createTransport({
  host: host,
  port: port,
  auth: {
    user: address,
    pass: password,
  },
});

module.exports = functions.https.onCall((data, ctx) => {
  const message = data.message;
  if (message === "" || typeof message === "undefined") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "message not found"
    );
  }

  let date = new Date();
  let formatDate = date.toFormat("YYYY/MM/DD HH24:MI:SS");

  const emailObj = {
    from: address,
    to: address,
    subject: "[TRIAL CMS] お問い合わせ",
    text: `${formatDate}\n${message}`,
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
