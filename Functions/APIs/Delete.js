import mongoose from "mongoose";
import {buildMongooseQuery} from "../Helper Functions/MongooseQueryBuilder.js";

export const DeleteFlow = async (api, model, searchParams, res) => {
    const userModel = await mongoose.model(model)

    const searchQuery = buildMongooseQuery(api, searchParams);
    const data = await userModel.deleteOne(searchQuery, api.responseParams)
    console.log("response: ", data)
    return res.json({data: "Object Deleted"}).status(200).end()
}

