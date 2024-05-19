const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      throw new Error("Not Authorized, Please login.");
    }
    //Verifiy Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    //Get User ID from Token
    const user = await User.findById(verified.id).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("User Not Found.");
    }
    if (user.role === "suspended") {
      res.status(400);
      throw new Error("User Suspended, Please contact support.");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not Authorized, Please login!.");
  }
});

//ADMIN
const adminOnly = asyncHandler(async (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "owner")) {
    next();
  } else {
    res.status(401);
    throw new Error("Not Authorized as an Admin.");
  }
});

//OWNER
const ownerOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "owner") {
    next();
  } else {
    res.status(401);
    throw new Error("Not Authorized as an owner.");
  }
});

//Verified only
const verifiedOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
  } else {
    res.status(401);
    throw new Error("Account not Verified.");
  }
});

module.exports = {
  protect,
  adminOnly,
  verifiedOnly,
  ownerOnly,
};
