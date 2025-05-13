import Model from "../models/Model.js";
import User from "../models/User.js";
import parseModel from "../Functions/parseModel.js";
import mongoose from "mongoose";
import Models from "../models/Model.js";
import {checkParamsExist} from "../Functions/Helper Functions/CheckBodyParams.js";
import ColumTypes from "../Data/ColumTypes.js";


const createModel = async (req, res) => {
    console.log('creating a model');

    const { name, project } = req.body;
    if (!checkParamsExist(res, [name, project])) return res;

    if(!name || !project){
        return res.status(403).end();
    }

    let model = await Model.findOne({ user: req.user.id, project: new mongoose.Types.ObjectId(project), name }).exec();
    

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

    const { columName, type, isRequired, isArray, modelId } = req.body;
    if (!checkParamsExist(res, [columName, type, modelId]))  return res;

    const model = await Model.findById(modelId);

    if (!model) {
        return res.status(404).json({ message: "Model not found" });
    }
    let objectColums = []

    console.log("type: " + type + "\nENUMS: " + ColumTypes.ENUM)

    if(type === ColumTypes.ENUM){
        console.log("here")
        const {enumList} = req.body
        if (!checkParamsExist(res, [enumList])) return res;
        objectColums = enumList 
    }

    if(type === ColumTypes.OBJECT){
        const {ref} = req.body;
        if(!checkParamsExist(res, [ref])) return res;
        objectColums[0] = ref // should contain full model name i.e, modelName-ProjectName
    }

    const newColum = {
        columName,
        type,
        isRequired,
        isArray,
        objectColums
    }
    const columExists = model.colums.some(colum => colum.columName === newColum.columName);

    if (columExists) {
        return res.status(409).json({ message: "Conflict: Column already exists" });
    }

    const updatedModel = await Model.findByIdAndUpdate(
        modelId,
        { $push: { colums: newColum } },
    );
    return res.status(200).json({data: "Column Created Successfully"}).end();
}

const getUserModels = async (req,res)=>{
    console.log('getting user models')

    const {projectId} = req.query


    const models = await Model.find({
        project: new mongoose.Types.ObjectId(projectId),
        user: req.user.id
    }).exec();

    return res.json(models).end();
}

const getModel = async (req, res) => {

    const  {modelId} = req.body

    let model = await Model.findOne({
        _id: modelId
    }).exec()
    if(!model) {
        console.log("No model found");
        return res.status(404).end()
    }


    return res.json(model).status(200).end()
}


const addRow = async (req,res)=>{
    console.log('adding row');
    console.log(req.body);

    console.log('retrieving already done model');
    console.log('model name: ', req.modelName);
    const userModel = await mongoose.model(req.modelName);


    const row = await new userModel(req.body.row)
    await row.save();
    console.log(row);

    res.status(200).json({"data": row}).end();
}

const getData = async (req,res)=>{
    console.log('getting data');
    console.log(req.modelName)
    const userModel = mongoose.model(req.modelName);

    const data = await userModel.find().exec();


    res.json(data)
}

const deleteData = async (req,res)=>{
    console.log('deleting data');
    console.log(req.modelName)
    const userModel = mongoose.model(req.modelName);

    const {id} = req.body;
    console.log("ID: ", id)
    const data = await userModel.findByIdAndDelete(id).exec();

    res.json(data)
}


export {
    createModel,
    addColum,
    getUserModels,
    addRow,
    getModel,
    getData,
    deleteData
};
