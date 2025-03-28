import {Schema, model, Model} from 'mongoose';
import ColumTypes from '../Data/ColumTypes.js';

const schema = Schema;

const ColumSchema = new Schema();

ColumSchema.add({
    columName: { type: String, required: true },
    type: { type: String, enum: Object.values(ColumTypes), required: true },
    isRequired: { type: Boolean, default: false },
    isArray: {type: Boolean, default: false},
    objectColums: [String]
})

const ModelSchema = new Schema({
    project: {
        type: schema.Types.ObjectId,
        ref: 'Projects',
    },
    name: {type: String, required: true},
    user: {
        type: schema.Types.ObjectId,
        ref: "Users",
    },
    colums: [ColumSchema]
});


export const getColumnsFromModel = (modelDef) => {
    console.log("Model: " + modelDef);
    let columns = []
    for (let col of modelDef.colums) {
        columns.push(col.columName)
    }
    return columns
}

export const checkIfArrayContainsValidColums = (params, columns) => {
    console.log("Params: " + params)
    console.log("columns: " + columns);
    for(let i = 0; i < params.length; i++) {
        if(!columns.includes(params[i])) {
            console.log(" Parameter not found")
            return false;
        }
    }
    return true;
}

const Models = model('Models', ModelSchema);

export default Models;