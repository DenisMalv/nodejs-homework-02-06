const nodemailer = require("nodemailer");
require("dotenv").config();

const { META_PASSWORD } = process.env;

const nodemailerConfig = {
  host: "smtp.meta.ua",
  port: 465,
  secure: true,
  auth: {
    user: "kissed03@meta.ua",
    pass: META_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(nodemailerConfig);

// const email = {
//   to: "kissed04@meta.ua",
//   from: "kissed03@meta.ua",
//   subject: "new letter",
//   html: "<p> New letter from site </p>",
// };

// const sendMailNodemailer = async (data) => {
//   const email = { ...data, from: "kissed03@meta.ua" };
//   try {
//     await transporter.sendMail(email);
//   } catch (error) {
//     throw new Error(error);
//   }
// };

// module.exports = sendMailNodemailer;
module.exports = transporter;
