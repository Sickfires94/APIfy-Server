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
    // console.log("api: ", api)

    if(!api) return res.status(404).send("No API returned with that name!").end()

    for (const queryElement of api.queries) {
        const index = api.queries.indexOf(queryElement);
        const modelId = queryElement.model;

        console.log("Finding model by id: " + modelId)

        let model = await Model.findOne({
            project: project,
            _id: modelId,
        }).exec();

        if (!model) {
            res.status(404).send("Model definition not found");
        }


        const fullModelName = `${model.name}-${project}`;
        console.log("fullModelName: ", fullModelName)
       // req.modelName = fullModelName
        if (!mongoose.modelNames().includes(fullModelName)) {
            const schemaDefinition = parseSchema(model.colums);
            const mongooseSchema = await new mongoose.Schema(schemaDefinition);

            const Model = await mongoose.model(fullModelName, mongooseSchema,  fullModelName, {
                overwriteModels: true
            });
        }

    }


    next();
};

export default createMongooseModelAPI;