import {checkParamsExist} from "../Functions/Helper Functions/CheckBodyParams.js";
import ApiBuilder from "../models/Node.js";
import apiConfig from "../models/ApiConfig.js";
import mongoose from "mongoose";
import ApiBuilderParser2 from "../Functions/ApiBuilderParser.js";


const saveBuilderState = async (req, res) => {
    console.log('Saving Builder state');

    const {nodes} = req.body;
    const {apiConfigId} = req.params;


    if(!checkParamsExist(res, {nodes})) return;
    let saved_state = await ApiBuilder.findOne({apiConfig: apiConfigId});

    if(!saved_state){
        saved_state = new ApiBuilder({apiConfig: apiConfigId, nodes: nodes});
        saved_state.save();
        return res.status(200).json(saved_state).end();
    }

    saved_state.nodes = [...nodes];
    // console.log('display saved nodes')
    // console.log(saved_state.nodes);


    // const {valid, error} = await ApiBuilderParser2(apiConfigId, nodes)
    // saved_state.valid = valid;
    await saved_state.save();

    // if(!valid) return res.status(400).json({error: error, saved_state: saved_state});
    return res.status(200).json(saved_state).end();
};

const getBuilderState = async (req, res) => {
    console.log('getting api builder');
    const {apiConfigId} = req.params;
    console.log(apiConfigId);

    let saved_state = await ApiBuilder.findOne({apiConfig: new mongoose.Types.ObjectId(apiConfigId)})
    console.log(saved_state)
    return res.status(200).json(saved_state).end();
}

const deleteBuilderState = async (req, res) => {
    const {apiConfigId} = req.params;

    let saved_state = ApiBuilder.deleteOne({_id: apiConfigId})
    return res.status(200).json({data: "Api Builder State deleted"}).end();
}



export {
    saveBuilderState,
    getBuilderState,
    deleteBuilderState
};