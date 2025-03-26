import Model, {checkIfArrayContainsValidColums, getColumnsFromModel} from "../models/Model.js";
import User from "../models/User.js";
import parseModel from "../Functions/parseModel.js";
import mongoose, {Mongoose} from "mongoose";
import ApiConfigs from "../models/ApiConfig.js";
import Models from "../models/Model.js";
import apiConfig from "../models/ApiConfig.js";
import ApiConfig from "../models/ApiConfig.js";
import MiddlewareConfig from "../models/MiddlewareConfig.js";
import MiddlewareConfigs from "../models/MiddlewareConfig.js";
import {GetFlow} from "../Functions/APIs/Get.js";
import {PostFlow} from "../Functions/APIs/Post.js";
import {DeleteFlow} from "../Functions/APIs/Delete.js";
import {UpdateFlow} from "../Functions/APIs/Update.js";
import ApiTypes from "../Data/ApiTypes.js";
import {request, response} from "express";
import {checkParamsExist} from "../Functions/CheckBodyParams.js";


const createAPI = async (req, res) => {
    const { name, project, model, type, searchParams, setParams, responseParams } = req.body;
    checkParamsExist(res, [name, project, model, type]);


    console.log(req.body);

    let api = await ApiConfigs.findOne({project: project, name: name }).exec();
    if (api) {
        return res.status(409).json({error: "API already exists"}).end();
    }

    let modelDef = await Model.findOne({_id: model}).exec();
    if(!modelDef) {
        return res.status(404).json({error: "Model Not Found"}).end();
    }

    let columns = getColumnsFromModel(modelDef);

    if (!checkIfArrayContainsValidColums(searchParams, columns) ||
        !checkIfArrayContainsValidColums(setParams, columns) ||
        !checkIfArrayContainsValidColums(responseParams, columns)) {
        return res.status(404).json({error: "Parameter Not Found"}).end();
    }

    // APPLY ANY CHECKS TO API CREATION REQUEST HERE
    switch (type) {
        case (ApiTypes.GET):
            break;
        case (ApiTypes.POST):
            if(setParams.length < 1)
                return res.status(403).json({error: "At least 1 parameter should be set"});
            break;
        case (ApiTypes.UPDATE):
            if (setParams.length < 1)
                return res.status(403).json({error: "At least 1 parameter should be set"});
            break;
        case (ApiTypes.DELETE):
            if(searchParams.length < 1)
                return res.status(403).json({error: "At least 1 parameter should be searched for"});
            break;
        case (ApiTypes.AUTH):
            if(searchParams.length < 2 && responseParams.length > 1)
                return res.status(403).json({error: "Invalid Set of Parameters"});
            break;
        default:
            return res.status(400).json({error: "Invalid Request Type"}).end();

    }

    // CREATE API CONFIG
    api = new ApiConfig({
        name,
        project,
        user: req.user.id,
        model: model,
        searchParams: searchParams,
        setParams: setParams,
        responseParams: responseParams,
        type: type,
    })
    await api.save();
    res.json(api).end();
};

const getAPIs = async (req, res) => {
    const {project} = req.body;
    checkParamsExist(res, [project])

    let apis = await ApiConfigs.find({project: project}).exec();

    return res.json(apis).status(200).end()
}

const testAPI = async (req, res) => {
    const {name, project, requestParams} = req.body;
    checkParamsExist(res, [name, project])

    let api = await ApiConfigs.findOne({project: project, name }).exec();

    if (!api) {
        return res.status(404).end();
    }

    const userModel = await mongoose.model(req.modelName)

    const data = await userModel.find(requestParams, api.responseParams)
    return res.json(data).status(200).end()
}

const deployAPI = async (req, res) => {
    const {name, project} = req.params;
    const {searchParams, setParams} = req.body;
    
    checkParamsExist(res, [name, project])
    console.log("params: ", req.params);

    let api = await ApiConfigs.findOne({project: project, name: name }).exec();

    console.log("API: ", api);
    if (!api) {
        return res.status(404).end();
    }

    for(let i = 0; i < api.searchParams.length; i++) {
        if(!(searchParams.hasOwnProperty(api.searchParams[i].column))) {
            return res.status(400).json({error: api.searchParams[i] + " missing"}).end();
        }
    }

    for(let i = 0; i < api.setParams.length; i++) {
        if(!(searchParams.hasOwnProperty(api.setParams[i]))) {
            return res.status(400).json({error: api.setParams[i] + " missing"}).end();
        }
    }


    switch (api.type) {
        case ApiTypes.GET:
            GetFlow(api, req.modelName, searchParams, res)
            break;
        case ApiTypes.POST:
            PostFlow(api, req.modelName, setParams, res)
            break;
        case ApiTypes.DELETE:
            DeleteFlow(api, req.modelName, searchParams, res)
            break;
        case ApiTypes.UPDATE:
            UpdateFlow(api, req.modelName, searchParams, setParams, res)
            break;
        case ApiTypes.AUTH:
            AuthFlow(api, project, req.modelName, searchParams, res)
            break;
    }
}

const createMiddleware = async (req, res) => {
    const { name, project, model, role_col, accessible_roles } = req.body;
    checkParamsExist(res, [name, project, model, role_col, accessible_roles]);
    console.log(req.body);

    let middleware = await MiddlewareConfigs.findOne({ user: req.user.id, project: project, name }).exec();

    if (middleware) {
        return res.status(409).end();
    }


    middleware = new MiddlewareConfig({
        name,
        project,
        user: req.user.id,
        model: model,
        role_col: role_col,
        accessible_roles: accessible_roles,
    })
    await middleware.save();
    res.json(middleware).end();
};

const addMiddleware = async (req, res) => {
    const {middleware_id, api_id} = req.body;

    const middleware = await MiddlewareConfigs.findOne({_id: middleware_id})
    if(!middleware) {
        res.json({error: "Middleware Not Found"}).status(404).end()
    }

    const api = await ApiConfigs.findOne({_id: api_id});
    if(!api) {
        res.json({error: "API Not Found"}).status(404).end();
    }

    await api.middlewares.push(middleware);
    await api.save();
    res.json(api).status(200).end();


}

const applyMiddlewares = async (req, res, next) => {
    const { name, project } = req.query;
    const api = await ApiConfigs.findOne({project: project, name:name})

    if(!api.middleware) next();

    const middleware = await MiddlewareConfigs.findOne({_id: api.middleware})
    if(!middleware) {
        res.json({error: "Middleware not found"}).status(404).end();
    }





}

export {
    getAPIs,
    createAPI,
    testAPI,
    deployAPI
};
