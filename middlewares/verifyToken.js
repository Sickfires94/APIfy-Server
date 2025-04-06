import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const user = jwt.verify(token.split(" ")[1], "MY_SECRET");
    req.user = user;
    next();
  } catch (e) {
    console.log(e)
    return res.status(500).json({ success: false, message: "Invalid token" });
  }
};

export default { verifyToken };