import Model from "../models/Model.js";
import User from "../models/User.js";
import parseModel from "../Functions/parseModel.js";
import mongoose, {Mongoose} from "mongoose";
import ApiConfigs from "../models/ApiConfig.js";
import Models from "../models/Model.js";
import apiConfig from "../models/ApiConfig.js";
import ApiConfig from "../models/ApiConfig.js";

const createAPI = async (req, res) => {
    const { name, project, model, type, requestParams, responseParams } = req.body;

    let api = await ApiConfigs.findOne({ user: req.user.id, project: project, name }).exec();

    if (api) {
        return res.status(409).end();
    }

    console.log('crearing api')
    console.log(req.user)

    api = new ApiConfig({
        name,
        project,    
        user: req.user.id,
        model: new mongoose.Types.ObjectId(model),
        requestParams: requestParams,
        responseParams: responseParams,
        type: type,
    })
    await api.save();
    res.json(api).end();
};

const getApi = async (req,res)=>{
    const {apiId} = req.params;
    
    const data = await ApiConfigs.findOne({user: req.user.id, _id: apiId}).exec();
    res.json(data);
}

const getAPIs = async (req, res) => {
    const {project} = req.body;


    let apis = await ApiConfigs.find({user: req.user.id, project: project}).exec();

    return res.json(apis).status(200).end()
}

const testAPI = async (req, res) => {
    const {name, project, requestParams} = req.body;

    let api = await ApiConfigs.findOne({ user: req.user.id, project: project, name }).exec();

    if (!api) {
        return res.status(404).end();
    }

    const userModel = await mongoose.model(req.modelName)

    const data = await userModel.find(requestParams, api.responseParams)
    return res.json(data).status(200).end()
}

const deployAPI = async (req, res) => {
    const {name, project} = req.params;
    const {requestParams} = req.body;


    let api = await ApiConfigs.findOne({project: project, name: name }).exec();

    if (!api) {
        return res.status(404).end();
    }

    const userModel = await mongoose.model(req.modelName)

    const data = await userModel.find(requestParams, api.responseParams)
    return res.json(data).status(200).end()
}

export {
    getAPIs,
    getApi,
    createAPI,
    testAPI,
    deployAPI
};
