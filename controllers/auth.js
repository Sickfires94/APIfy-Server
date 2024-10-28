import "dotenv/config";

import { createTransport } from "nodemailer";
import  User from "../models/User.js";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";

export const signUp = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName)
      return res
        .status(200)
        .json({ success: false, message: "Please enter all fields", data: [] }); // Check the email format

    if (!email.match(/^\S+@\S+\.\S+$/))
      return res
        .status(200)
        .json({ success: false, message: "Invalid Email format", data: [] }); // Check the email format
    let user = await User.findOne({ email });

    if (user) {
      return res
        .status(200)
        .json({ success: false, message: "User already exists" });
    }
    if (password.length < 8) {
      return res.status(200).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    await User.create({
      ...req.body,
      password: await hash(password, 5),
      role: 'user',
    });
    return res.status(200).json({ success: true, message: "User created" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password){
      return res
        .status(200)
        .json({ success: false, message: "email and/or password is missing"});
    }
    const user = await User.findOne({ email, isDeleted: false });
    if (!user)
      return res
        .status(200)
        .json({ success: false, message: "User not found" });

    const passwordCheck = await compare(password, user.password);
    if (!passwordCheck)
      return res
        .status(200)
        .json({ success: false, message: "Invalid password" });

    const token = jwt.sign(
      {
        name: user.firstName + " " + user.lastName,
        id: user._id,
        role: user.role,
        createdAt: new Date(),
      },
      "MY_SECRET",
      { expiresIn: "1d" }
    );
    res.json({
      success: true,
      message: "LOGGED IN",
      token,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findOne({ email, isDeleted: false });

    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User not found" });
    }

    const newPassword = Math.random().toString(36).slice(-8);
    user.password = await hash(newPassword, 5);
    await user.save();

    await sendEmail(email, newPassword);
    res
      .status(200)
      .json({ success: true, message: "Email sent for password reset" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error: Email not sent" });
  }
};

const sendEmail = async (email, newPassword) => {
  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: process.env.gmail_username,
      pass: process.env.gmail_password,
    },
  });

  const mailOptions = {
    from: process.env.gmail_username,
    to: email,
    subject: "Password Reset For Event Express",
    text: `Your new password is: ${newPassword}. Please use this password to login and then reset it.`,
  };

  await transporter.sendMail(mailOptions);
};

export default {
  login,
  forgetPassword,
  signUp,
};