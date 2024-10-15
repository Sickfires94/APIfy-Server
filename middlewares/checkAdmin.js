export const checkAdmin = async (req, res, next) => {
  const userRole = req.user.role;

  if (userRole === "admin") {
    next();
  } else {
    return res
      .status(400)
      .json({
        success: false,
        message: "You are not authorized to perform this action2",
      });
  }
};

export default { checkAdmin };