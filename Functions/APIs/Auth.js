import mongoose from "mongoose";
import jwt from "jsonwebtoken";

export const AuthFlow = async (api, model, searchParams, res) => {
    const userModel = await mongoose.model(model)
    const user = await userModel.findOne(searchParams, api.responseParams)
    console.log("user: ", user)

    if (!user) {
        return res.status(404).json({ error: "Wrong Username/Password" }).end();
    }

    const token = jwt.sign(
        {
            id: user._id,
            role: user.role, // Figure out how to get this
            project: api.project,
            createdAt: new Date(),
        },
        "MY_SECRET",
        { expiresIn: "1d" }
    );
    return res.json({token: token}).status(200).end()
}

