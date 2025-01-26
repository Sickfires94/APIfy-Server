import Model from "../models/Model.js";
import parseSchema from "../Functions/parseModel.js";
import mongoose from "mongoose";


const createMongooseModel = async (req, res, next) => {
    console.log('creating/fetching model')
    const { projectId, modelName } = req.query;
    const userId = req.user.id;
    const fullModelName = `${modelName}-${projectId}`;
    req.modelName = fullModelName

    try {
        const model = await Model.findOne({
            user: userId,
            project: projectId,
            name: modelName
        }).exec();
        // console.log("model: ", model);
        if (!model) {
            return res.status(404).send("Model definition not found");
        }

        const schemaDefinition = parseSchema(model.colums);
        const mongooseSchema = new mongoose.Schema(schemaDefinition);
        mongoose.model(fullModelName, mongooseSchema);

    }
    catch (err) {
        if (err.name === "OverwriteModelError") {
        } else {
            console.error(err);
            return res.status(500).send("Internal Server Error");
        }
    }
    req.modelName = fullModelName

    console.log("Adding row to ", fullModelName);

    next();
};

export default createMongooseModel;