const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { genarateToken, hashToken } = require("../utils");
const { use } = require("../routes/userRoute");
var parser = require("ua-parser-js");
const { response } = require("express");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const { error, log } = require("console");
const Cryptr = require("cryptr");
const { OAuth2Client } = require("google-auth-library");

const cryptr = new Cryptr(process.env.CRYPTR_KEY);
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
//Register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  //Validation
  if (!name || !email || !password) {
    res.status(400);

    throw new Error("Please fill in all the required field.");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be up to 6 characters.");
  }
  //Check if User is exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("Email Alrady in Use.");
  }
  //GET UserAgent
  const ua = parser(req.headers["user-agent"]);
  const userAgent = [ua.ua];

  //Create New User
  const user = await User.create({
    name,
    email,
    password,
    userAgent,
  });

  //Genarate Token
  const token = genarateToken(user._id);

  //Send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), //One Day
    sameSite: "none",
    secure: true,
  });

  if (user) {
    const { _id, name, email, phone, bio, photo, role, isVerified } = user;
    res.status(201).json({
      _id,
      name,
      email,
      phone,
      bio,
      photo,
      role,
      isVerified,
      token,
    });
  } else {
    res.status(400);
    throw new Error("INVALID USER DATA.");
  }
});

//Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  //validation
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password.");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User Not Found.");
  }

  const passwordIsCorrect = await bcrypt.compare(password, user.password);
  if (!passwordIsCorrect) {
    res.status(400);
    throw new Error("Invalid Email or Password");
  }

  //Trigger 2FA for unknow UserAgent
  const ua = parser(req.headers["user-agent"]);
  const thisUserAgent = ua.ua;
  console.log(thisUserAgent);
  const allowedAgent = user.userAgent.includes(thisUserAgent);

  if (!allowedAgent) {
    //Genarate 6 digit Code
    const loginCode = Math.floor(100000 + Math.random() * 900000);
    console.log(loginCode);

    //Encrypt login Code before saving to DB
    const encryptedLoginCode = cryptr.encrypt(loginCode.toString());

    //Delete Token if it Exists  in DB
    let userToken = await Token.findOne({ userId: user._id });
    if (userToken) {
      await userToken.deleteOne();
    }
    //Save Token to DB
    await new Token({
      userId: user._id,
      lToken: encryptedLoginCode,
      createdAt: Date.now(),
      expirsAt: Date.now() + 60 * (60 * 100), //60 mins
    }).save();
    res.status(400);
    throw new Error("New browser or device detected");
  }
  //Genarate Token
  const token = genarateToken(user._id);
  if (user && passwordIsCorrect) {
    //Send HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), //One Day
      sameSite: "none",
      secure: true,
    });
    const { _id, name, email, phone, bio, photo, role, isVerified } = user;
    res.status(200).json({
      _id,
      name,
      email,
      phone,
      bio,
      photo,
      role,
      isVerified,
      token,
    });
  } else {
    res.status(500);
    throw new Error("Somthing went wrong please try again");
  }
});
//Sent Login Code Via Email
const sendLoginCode = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  //Find Login Code in DB
  let userToken = await Token.findOne({
    userId: user._id,
    expirsAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired token, Please login again");
  }
  const loginCode = userToken.lToken;
  const decryptedLoginCode = cryptr.decrypt(loginCode);
  //Send Email (Login Code)
  const subject = "Login Access Code - Seedevi Spice";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = "Noreply@seedevispice.com";
  const template = "loginCode";
  const name = user.name;
  const link = decryptedLoginCode;

  try {
    await sendEmail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({ message: `Access Code Sent to ${email}` });
  } catch (error) {
    res.status(500);
    throw new Error("Email Not Sent Please try again.");
  }
});

// Login with Code
const loginWithCode = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const { loginCode } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User Not Found");
  }

  //Find user login Token
  const userToken = await Token.findOne({
    userId: user.id,
    expirsAt: { $gt: Date.now() },
  });
  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expierd Token, Please login again");
  }
  const decryptedLoginCode = cryptr.decrypt(userToken.lToken);

  if (loginCode !== decryptedLoginCode) {
    res.status(400);
    throw new Error("Invalid Login Code, Please Try again");
  } else {
    //Register User Agent
    const ua = parser(req.headers["user-agent"]);
    const thisUserAgent = ua.ua;
    user.userAgent.push(thisUserAgent);
    await user.save();
    //Genarate Token
    const token = genarateToken(user._id);

    //Send HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), //One Day
      sameSite: "none",
      secure: true,
    });

    const { _id, name, email, phone, bio, photo, role, isVerified } = user;
    res.status(201).json({
      _id,
      name,
      email,
      phone,
      bio,
      photo,
      role,
      isVerified,
      token,
    });
  }
});

//Send Verification Email
const sendVerificationEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User Not Found.");
  }
  if (user.isVerified) {
    res.status(400);
    throw new Error("User Alrady Verified.");
  }
  //Delete Token if it Exists  in DB
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }
  //Create Verification token and Save
  const verificationToken = crypto.randomBytes(32).toString("hex") + user._id;
  console.log(verificationToken);

  //Hahs toke and save
  const hashedToken = hashToken(verificationToken);
  await new Token({
    userId: user._id,
    vToken: hashedToken,
    createdAt: Date.now(),
    expirsAt: Date.now() + 30 * (60 * 100), //30 mins
  }).save();

  //Construct Verification URL
  const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

  //Send Email
  const subject = "Verify Your Account - Seedevi Spice";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = "Noreply@seedevispice.com";
  const template = "verifiyEmail";
  const name = user.name;
  const link = verificationUrl;

  try {
    await sendEmail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({ message: "Verification Email Sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email Not Sent Please try again.");
  }
});

//Verify User
const verifyUser = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;
  const hashedToken = hashToken(verificationToken);
  const userToken = await Token.findOne({
    vToken: hashedToken,
    expirsAt: { $gt: Date.now() },
  });
  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired Token");
  }

  //Find User
  const user = await User.findOne({ _id: userToken.userId });
  if (user.isVerified) {
    res.status(400);
    throw new Error("user is Alrady Verified");
  }
  //Now Verify user
  user.isVerified = true;
  await user.save();
  res.status(200).json({ message: "Account Verification Successful" });
});

//LogOut User
const logoutUser = asyncHandler(async (req, res) => {
  //Send HTTP-only cookie
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({ message: "LogOut Successful" });
});

//Get User
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { _id, name, email, phone, bio, photo, role, isVerified } = user;
    res.status(200).json({
      _id,
      name,
      email,
      phone,
      bio,
      photo,
      role,
      isVerified,
    });
  } else {
    res.status(404);
    throw new Error("User Not Found.");
  }
});

//Update User
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const { name, email, phone, bio, photo, role, isVerified } = user;

    user.email = email;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;
    user.photo = req.body.photo || photo;

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      photo: updatedUser.photo,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
    });
  } else {
    res.status(404);
    throw new Error("User Not Found.");
  }
});

//Delete User
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User Not Found.");
  }

  await user.deleteOne();
  res.status(200).json({ message: "User Deleted Successfully" });
});

//Get Users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort("-createdAt").select("-password");
  if (!users) {
    res.status(500);
    throw new Error("Something went wrong.");
  }
  res.status(200).json(users);
});

//Get Login Status
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  //Verifiy Token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

//Upgrade User (Role)
const upgradeUser = asyncHandler(async (req, res) => {
  const { role, id } = req.body;

  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error("User Not Found.");
  }
  user.role = role;
  await user.save();
  res.status(200).json({
    message: `User role updated to ${role}`,
  });
});

//Send Automated Email
const sendAutomatedEmail = asyncHandler(async (req, res) => {
  const { subject, send_to, reply_to, template, url } = req.body;

  if (!subject || !send_to || !reply_to || !template) {
    res.status(500);
    throw new Error("Missing Email Parameter");
  }
  //Get User
  const user = await User.findOne({ email: send_to });
  if (!user) {
    res.status(404);
    throw new Error("User Not Found.");
  }
  const sent_from = process.env.EMAIL_USER;
  const name = user.name;
  const link = `${process.env.FRONTEND_URL}${url}`;

  try {
    await sendEmail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({ message: "Email Sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email Not Sent Please try again.");
  }
});

//Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("No user with this email");
  }
  //Delete Token if it Exists  in DB
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }
  //Create Verification token and Save
  const resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  console.log(resetToken);

  //Hahs token and save
  const hashedToken = hashToken(resetToken);
  await new Token({
    userId: user._id,
    rToken: hashedToken,
    createdAt: Date.now(),
    expirsAt: Date.now() + 60 * (60 * 100), //60 mins
  }).save();

  //Construct Reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;

  //Send Email
  const subject = "Password Reest Request - Seedevi Spice";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = "Noreply@seedevispice.com";
  const template = "forgotPassword";
  const name = user.name;
  const link = resetUrl;

  try {
    await sendEmail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({ message: "Password Reset Email Sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email Not Sent Please try again.");
  }
});

//Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  const hashedToken = hashToken(resetToken);
  const userToken = await Token.findOne({
    rToken: hashedToken,
    expirsAt: { $gt: Date.now() },
  });
  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired Token");
  }

  //Find User
  const user = await User.findOne({ _id: userToken.userId });

  //Now Reset Passwor
  user.password = password;
  await user.save();
  res.status(200).json({ message: "Password Reset Successful, Please Login" });
});

//Change Password
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, password } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User Not Found");
  }
  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Please Enter old and New Password");
  }
  //Check if Old password is correct
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  //Save New Password
  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    res
      .status(200)
      .json({ message: "Password Change Successful, Please Re-Login" });
  } else {
    res.status(400);
    throw new Error("Old Password is incorrect");
  }
});
//loginWithGoogle
const loginWithGoogle = asyncHandler(async (req, res) => {
  const { userToken } = req.body;

  const ticket = await client.verifyIdToken({
    idToken: userToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const { name, email, picture, sub } = payload;
  const password = Date.now() + sub;

  //Check if user exists
  const user = await User.findOne({ email });

  //GET UserAgent
  const ua = parser(req.headers["user-agent"]);
  const userAgent = [ua.ua];

  if (!user) {
    //Create New User
    const newUser = await User.create({
      name,
      email,
      password,
      photo: picture,
      userAgent,
      isVerified: true,
    });

    if (newUser) {
      //Genarate Token
      const token = genarateToken(newUser._id);
      //Send HTTP-only cookie
      res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //One Day
        sameSite: "none",
        secure: true,
      });

      const { _id, name, email, phone, bio, photo, role, isVerified } = newUser;
      res.status(201).json({
        _id,
        name,
        email,
        phone,
        bio,
        photo,
        role,
        isVerified,
        token,
      });
    }
  }
  //User Exists,login
  if (user) {
    //Genarate Token
    const token = genarateToken(user._id);
    //Send HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), //One Day
      sameSite: "none",
      secure: true,
    });

    const { _id, name, email, phone, bio, photo, role, isVerified } = user;
    res.status(201).json({
      _id,
      name,
      email,
      phone,
      bio,
      photo,
      role,
      isVerified,
      token,
    });
  }
});
module.exports = {
  registerUser,
  loginUser,
  sendVerificationEmail,
  logoutUser,
  getUser,
  updateUser,
  deleteUser,
  getUsers,
  loginStatus,
  upgradeUser,
  sendAutomatedEmail,
  verifyUser,
  forgotPassword,
  resetPassword,
  changePassword,
  sendLoginCode,
  loginWithCode,
  loginWithGoogle,
};
