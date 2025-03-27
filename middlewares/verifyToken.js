import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    console.log(token)
    const user = jwt.verify(token.split(" ")[1], "MY_SECRET");
    console.log(user)
    req.user = user;
    next();
  } catch (e) {
    console.log(e)
    return res.status(500).json({ success: false, message: "Invalid token" });
  }
};

export default { verifyToken };