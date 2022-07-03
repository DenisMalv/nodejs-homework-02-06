const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const { SENGRID_API_KEY } = process.env;

sgMail.setApiKey(SENGRID_API_KEY);

// const email = {
//     to: "kissed04@gmail.com",
//     from:"kissed03@gmail.com",
//     subject:"new letter",
//     html:"<p> New letter from site </p>"
// }

const sendEmail = async (data) => {
  const email = { ...data, from: "kissed03@gmail.com" };
  try {
    await sgMail(email);
    return true;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = sendEmail;
