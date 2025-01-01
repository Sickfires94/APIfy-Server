import ApiConfigs from "../models/ApiConfig.js";
import Model from "../models/Model.js";
import parseSchema from "../Functions/parseModel.js";
import mongoose from "mongoose";


const createMongooseModelAPI = async (req, res, next) => {
    const { project, name } = req.params;
    // const userId = req.user.id;

    console.log("req.params: ", req.params)

    const api = await ApiConfigs.findOne({name: name, project: project}).exec();
    //if (!mongoose.modelNames().includes(fullModelName)) {
    console.log("api: ", api)

    if(!api) return res.status(404).send("No API returned with that name!").end()

    const model = await Model.findOne({

        project: project,
        _id: api.model,
    }).exec();

    if (!model) {
        return res.status(404).send("Model definition not found");
    }


    const fullModelName = `${model.name}-${project}`;
    req.modelName = fullModelName
    if (!mongoose.modelNames().includes(fullModelName)) {
        const schemaDefinition = parseSchema(model.colums);
        const mongooseSchema = new mongoose.Schema(schemaDefinition);

        mongoose.model(fullModelName, mongooseSchema);
    }

    next();
};

export default createMongooseModelAPI;