import User from "../models/User.js";
import { compare, hash } from "bcrypt";

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = await findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const passwordCheck = await compare(oldPassword, user.password);

    if (!passwordCheck) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect old password" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    user.password = await hash(newPassword, 5);
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const viewProfile = async (req, res) => {
  try {
    const user = await findById(req.body.id);
    if (!user) {
      return res.status(404).json({ success: true, message: "User not found" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteMyAccount = async (req, res) => {
  try {
    if (!req.body.password) {
      return res
        .status(200)
        .json({ success: false, message: "Please provide your password" });
    }
    const user = await findById(req.user.id);

    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User not found" });
    }

    const passwordMatch = await compare(
      req.body.password,
      user.password
    );

    if (!passwordMatch) {
      return res
        .status(200)
        .json({ success: false, message: "Incorrect password" });
    }
    user.isDeleted = true;
    user.deletedBy = req.user.id;
    user.deletedAt = new Date(Date.now());
    await user.save();
    return res.status(200).json({ success: true, message: "Account deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export default {
  changePassword,
  deleteMyAccount,
  viewProfile,
};