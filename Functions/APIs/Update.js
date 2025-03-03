import mongoose from "mongoose";

export const UpdateFlow = async (api, model, searchParams, setParams, res) => {
    const userModel = await mongoose.model(model)
    console.log("searchParams: " + searchParams + "\nsetParams: " + setParams)

    const data = await userModel.updateOne(searchParams, setParams)
    console.log("response: ", data)
    return res.json(data).status(200).end()
}

