import { Schema, model } from 'mongoose';
import ApiTypes from '../Data/ApiTypes.js';

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
    model: {
        type: Schema.Types.ObjectId,
        ref: "Models",
    },
    searchParams: [String],
    setParams: [String],
    responseParams: [String],
    deployed: {type: Boolean, default: false},
    middleware: {type: Schema.Types.ObjectId, ref: "Middlewares", },
    type: { type: String, enum: Object.values(ApiTypes), required: true },
});

const ApiConfigs = model('ApiConfigs', ApiSchema);

export default ApiConfigs;