import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await find({
      role: "user",
      isDeleted: false,
    }).select("-password");

    if (users.length === 0) {
      return res
        .status(200)
        .json({ success: false, message: "No users found" });
    }
    return res.status(200).json({ success: true, data: users, message: "Users fetched successfully"});

  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const getUserByName = async (req, res) => {
  const fullName = req.body.name.trim();
  const names = fullName.split(' ');
  const firstName = names[0];
  const lastName = names.slice(1).join(' ');
  try {
    const searchCriteria = {
      role: "user",
      isDeleted: false,
      $or: [
        { firstName: { $regex: new RegExp('^' + firstName + '$', 'i') } },
        { 
          $and: [
            { firstName: { $regex: new RegExp('^' + firstName + '$', 'i') } },
            { lastName: { $regex: new RegExp('^' + lastName + '$', 'i') } }
          ]
        },
        {lastName: { $regex: new RegExp('^' + firstName + '$', 'i') }},
        {lastName: { $regex: new RegExp('^' + lastName + '$', 'i') }}
      ]
    };

    const users = await find(searchCriteria).select("-password");

    if (users.length === 0) {
      return res
        .status(200)
        .json({ success: false, message: "No user found with this name" });
    }
    return res.status(200).json({ success: true, data: users, message: "User fetched successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}


export const deleteAccount = async (req, res) => {
  try {
    const { email } = req.body;
    let user = await findOne({ email, isDeleted: false });

    if (user) {
      if (req.user.role === "superAdmin") {
        user.isDeleted = true;
        user.deletedBy = req.user.id;
        user.deletedAt = new Date(Date.now());
        await user.save();
        return res
          .status(200)
          .json({ success: true, message: "Account deleted successfully" });
      }
      if (user.role === "user" || user.role === "organizer") {
        user.isDeleted = true;
        user.deletedBy = req.user.id;
        user.deletedAt = new Date(Date.now());
        await user.save();
        return res
          .status(200)
          .json({ success: true, message: "Account deleted successfully" });
      }
      return res.status(401).json({
        success: true,
        message: "You can only delete the account of a user or organizer",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



export const countUsers = async(req,res) => {
    try {
        const users = await find({role: "user", isDeleted: false}).countDocuments();
        return res.status(200).json({success: true, data: users});
    } catch (error) {
        return res.status(500).json({success: false, message: "Server Error"});
    }
}

export default { getAllUsers, deleteAccount, getUserByName,  countUsers};
