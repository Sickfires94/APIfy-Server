import { Schema, model } from 'mongoose';
import ColumTypes from '../Data/ColumTypes.js';

const schema = Schema;

const ColumnSchema = new Schema();

ColumnSchema.add({
    columnName: { type: String, required: true },
    type: { type: String, enum: Object.values(ColumTypes), required: true },
    isRequired: { type: Boolean, default: false },
    isArray: {type: Boolean, default: false},
    objectColums: [ColumnSchema]
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
    colums: [ColumnSchema]
});

const Models = model('Models', ModelSchema);

export default Models;