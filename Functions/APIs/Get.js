import mongoose from "mongoose";

export const GetFlow = async (api, model, searchParams, res) => {
    const userModel = await mongoose.model(model)

    const data = await userModel.find(searchParams, api.responseParams)

    console.log("response: ", data)
    return res.json(data).status(200).end()
}




