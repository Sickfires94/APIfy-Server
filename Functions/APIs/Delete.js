import mongoose from "mongoose";

export const DeleteFlow = async (api, model, searchParams, res) => {
    const userModel = await mongoose.model(model)


    const data = await userModel.deleteOne(searchParams, api.responseParams)
    console.log("response: ", data)
    return res.json({data: "Object Deleted"}).status(200).end()
}

