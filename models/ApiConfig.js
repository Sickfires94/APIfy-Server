import { Schema, model } from 'mongoose';
import ApiTypes from '../Data/ApiTypes.js';
import ApiOperators from "../Data/ApiOperators.js";
import columTypes from "../Data/ColumTypes.js";
import InputConnectorTypes from "../Data/InputConnectorTypes.js";

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
    valueSources: [Source], // Number is the offset to the input query, array to separate find and update cases
    column: String,
    findOne: Boolean,
    operator: {type: String, enum:Object.values(ApiOperators), default: "$eq"},
    type: { type: String, enum: Object.values(InputConnectorTypes), required: true },
})




const Query = new Schema({
    model: {type: Schema.Types.ObjectId, ref: "Models"},

    inputConnectors: [{type: inputConnector}], // have set/search params with origin
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
    responseParams: [Source],
    queries: [Query],
    deployed: {type: Boolean, default: false},
    middleware: [{type: Schema.Types.ObjectId, ref: "Middlewares", }],
    // type: { type: String, enum: Object.values(ApiTypes), required: true },
});



const ApiConfigs = model('ApiConfigs', ApiSchema);

export default ApiConfigs;