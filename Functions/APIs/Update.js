import mongoose from "mongoose";
import {buildMongooseQuery} from "../Helper Functions/MongooseQueryBuilder.js";

export const UpdateFlow = async (api, model, searchParams, setParams, res) => {
    const userModel = await mongoose.model(model)
    console.log("searchParams: " + searchParams + "\nsetParams: " + setParams)

    const searchQuery = buildMongooseQuery(api, searchParams)

    const data = await userModel.updateOne(searchQuery, setParams)
    console.log("response: ", data)
    return res.json(data).status(200).end()
}

