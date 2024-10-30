
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


export default {
  viewProfile,
};