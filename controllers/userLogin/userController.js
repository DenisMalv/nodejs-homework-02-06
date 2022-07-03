const { Conflict, Unauthorized, NotFound } = require("http-errors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const { v4 } = require("uuid");
// const sendMailNodemailer = require("../../utils/sendEmailNodeMailer");
const transporter = require("../../utils/sendEmailNodeMailer");

const { User } = require("../../models/users");
const { SECRET_KEY } = process.env;
const path = require("path");
const fs = require("fs/promises");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw new Conflict("Email in use");
  }
  const verificationToken = v4();
  const avatarURL = gravatar.url(email);
  const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  const data = await User.create({
    email,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  const mail = {
    to: email,
    subject: "confirm email",
    html: `<a target="_blank href="http://localhost:3000/api/users/verify/${verificationToken}">Click to confirm</a>`,
  };
  console.log("email", email);
  // sendMailNodemailer(mail);

  transporter
    .sendMail(mail)
    .then(() => console.log("email go"))
    .catch((error) => {
      console.log("error mail not go", error);
    });

  console.log(data);

  res.status(201).json({
    Status: "Created",
    code: 201,
    ResponseBody: {
      user: {
        email: email,
        subscription: "starter",
        avatarURL,
        verificationToken,
      },
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new Unauthorized("Email or password is wrong");
  }
  const passCompare = bcrypt.compareSync(password, user.password);
  if (!passCompare) {
    throw new Unauthorized("Email or password is wrong");
  }
  if (!user.verify) {
    throw new Unauthorized("Chek your email to confirm account");
  }
  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
  await User.findByIdAndUpdate(user._id, { token });
  res.json({
    status: "success",
    code: 200,
    data: {
      token,
    },
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).json();
};

const getCurrentUser = (req, res) => {
  console.log("req.user", req.user);

  const { email, subscription } = req.user;
  res.json({
    status: "success",
    code: 200,
    data: {
      email,
      subscription,
    },
  });
};

const updateSubscription = async (req, res) => {
  const { subscription } = req.body;
  const { _id } = req.user;
  const data = await User.findByIdAndUpdate(
    _id,
    { subscription },
    { new: true }
  );
  res.json({
    message: "contact successfully edit",
    statusOperation: "success",
    data,
  });
};

const avatarsDir = path.join(__dirname, "../../", "public", "avatars");

const updateAvatar = async (req, res) => {
  const { path: tempUpload, originalname } = req.file;
  const { _id: id } = req.user;
  const imageName = `${id}_${originalname}`;
  try {
    const resultUpload = path.join(avatarsDir, imageName);
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("public", "avatars", imageName);
    await User.findByIdAndUpdate(req.user._id, { avatarURL });
    res.json({ code: 200, responceBody: { avatarURL } });
  } catch (error) {
    await fs.unlink(tempUpload);
    throw error;
  }
};

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw NotFound();
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });
  res.json({
    code: 200,
    message: "Verification successful",
  });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user.verify) {
    res.status(400).json({
      code: 400,
      message: "Verification has already been passed",
    });
  }

  const mail = {
    to: email,
    subject: "confirm email",
    html: `<a target="_blank href="http://localhost:3000/api/users/verify/${user.verificationToken}">Click to confirm</a>`,
  };

  transporter
    .sendMail(mail)
    .then(() => console.log("email go"))
    .catch((error) => {
      console.log("error mail not go", error);
    });

  res.json({
    code: 200,
    message: "Verification email sent",
  });
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  updateSubscription,
  updateAvatar,
  verifyEmail,
  resendVerifyEmail,
};
