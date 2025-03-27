import mongoose from "mongoose";

export const PostFlow = async (api, model, setParams, res) => {
    const userModel = await mongoose.model(model)
    console.log("setParams: " + setParams)
    let obj = new userModel(setParams);
    await obj.save();
    res.status(200).json(obj).end()

    // const data = await userModel.find(reqParams, api.responseParams)
    // console.log("response: ", data)
    // return res.json(data).status(200).end()
}

