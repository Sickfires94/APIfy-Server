import { Schema, model } from 'mongoose';
import ApiTypes from '../Enums/ApiTypes.js';
import ApiOperators from "../Enums/ApiOperators.js";
import columTypes from "../Enums/ColumTypes.js";
import InputConnectorTypes from "../Enums/InputConnectorTypes.js";
import QueryTypes from "../Enums/QueryTypes.js";
import ColumTypes from "../Enums/ColumTypes.js";
import IfConditionDataTypes from "../Enums/IfConditionDataTypes.js";

const schema = Schema;

// const ParametersSchema = new Schema({
//     modelName: {
//         type: String,
//     },
//     columnNames: [{
//         type: "String",
//         default: ""
//     }]
// })

// While running api, maintain a list of outputs from each query so next queries can access

const Source = new Schema({
    name: String,
    type: {type: String, enum: Object.values(columTypes)},
    index: {type: Number},
    sourceName: String,
})

const inputConnector = new Schema({
    valueSources: [Source], // Number is the index to the input query, array to separate find and update cases
    column: String,
    operator: {type: String, enum:Object.values(ApiOperators), default: "$eq"},
})

const Response = new Schema({
    conditionConnectors: [inputConnector],
    message: String,
    httpCode: Number,
    params: [Source]
})

const Constant = new Schema({
    type: {type: String, enum: Object.values(IfConditionDataTypes)},
    value: Schema.Types.Mixed,
})

const Query = new Schema({
    model: {type: Schema.Types.ObjectId, ref: "Models"},
    findOne: Boolean,
    type: {type: String, enum: Object.values(QueryTypes)},
    conditionConnectors: [inputConnector],
    constant: Constant,
    inputConnectors: [{type: inputConnector, required: false}], // have set/search params with origin
    outputColumns: [String]
})


const ApiSchema = new Schema({
    name: {type: String, required: true},
    project: {
        type: schema.Types.ObjectId,
        ref: "Projects",
    },
    user: {
        type: schema.Types.ObjectId,
        ref: "Users",
    },
    requestParams: [Source],
    responses: [Response],
    queries: [Query],
    deployed: {type: Boolean, default: false},
    middleware: [{type: Schema.Types.ObjectId, ref: "Middlewares", }],
    // type: { type: String, enum: Object.values(ApiTypes), required: true },
});



const ApiConfigs = model('ApiConfigs', ApiSchema);

export default ApiConfigs;