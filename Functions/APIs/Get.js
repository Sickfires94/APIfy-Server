import mongoose from "mongoose";
import {buildMongooseQuery} from "../Helper Functions/MongooseQueryBuilder.js";

export const GetFlow = async (api, model, searchParams, res) => {
    const userModel = await mongoose.model(model)
    console.log("**********************************")
    console.log("Project: " + model)

    const searchQuery = buildMongooseQuery(api, searchParams)
    console.log("searchQuery", searchQuery)

    const data = await userModel.find(searchQuery, api.responseParams)

    console.log("response: ", data)
    return res.json(data).status(200).end()
}




