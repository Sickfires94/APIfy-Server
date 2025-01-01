import Model from "../models/Model.js";
import parseSchema from "../Functions/parseModel.js";
import mongoose from "mongoose";


const createMongooseModel = async (req, res, next) => {
    const { projectId, modelName } = req.query;
    const userId = req.user.id;
    const fullModelName = `${modelName}-${projectId}`;
    req.modelName = fullModelName

    
    if (!mongoose.modelNames().includes(fullModelName)) {
        const model = await Model.findOne({
            user: userId,
            project: projectId,
            name: modelName
        }).exec();

        if (!model) {
            return res.status(404).send("Model definition not found");
        }

        const schemaDefinition = parseSchema(model.colums);
        const mongooseSchema = new mongoose.Schema(schemaDefinition);
        
        mongoose.model(fullModelName, mongooseSchema);
    }

    next();
};

export default createMongooseModel;