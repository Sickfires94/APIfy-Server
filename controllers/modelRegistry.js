import Model from "../models/Model.js";
import User from "../models/User.js";
import parseModel from "../Functions/parseModel.js";
import mongoose from "mongoose";


const createModel = async (req, res) => {
    console.log('creating a model');

    const { name, project } = req.body;

    if(!name || !project){
        return res.status(403).end();
    }

    let model = await Model.findOne({ user: req.user.id, project: new mongoose.Types.ObjectId(project), name }).exec();
    console.log(model);
    console.log(req.user)

    if (model) {
        return res.status(409).end();
    }

    model = new Model({
        name,
        project,
        user: req.user.id,
    })
    await model.save();
    res.end();
};
const addColum = async (req, res) => {
    console.log('adding colum');

    const { columName, type, isRequired, isArray, objectColums, modelId } = req.body;

    const model = await Model.findById(modelId);

    if (!model) {
        return res.status(404).json({ message: "Model not found" });
    }
    const newColum = {
        columName,
        type,
        isRequired,
        isArray,
    }
    const columExists = model.colums.some(colum => colum.columName === newColum.columName);

    if (columExists) {
        return res.status(409).json({ message: "Conflict: Column already exists" });
    }

    const updatedModel = await Model.findByIdAndUpdate(
        modelId,
        { $push: { colums: newColum } },
    );
    return res.end();
}

const getUserModels = async (req,res)=>{
    console
    const {projectId} = req.query
    const models = await Model.find({
        project: new mongoose.Types.ObjectId(projectId),
        user: req.user.id
    }).exec();

    return res.json(models).end();
}


const addRow = async (req,res)=>{
    console.log('adding row');
    console.log(req.body);

    console.log('retrieving already done model');
    console.log('model name: ', req.modelName);
    const userModel = mongoose.model(req.modelName);


    const row = new userModel(req.body)
    console.log(row);
    row.save();


    res.end();
}


export {
    createModel,
    addColum,
    getUserModels,
    addRow,
};
