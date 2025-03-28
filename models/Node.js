import { Schema, model } from 'mongoose';

const schema = Schema;

const NodeSchema = new Schema({
    x: {type: Number, required: true},
    y: {type: String, required: true},
    id: {type: String, required: true},
    name: {type: String, required: true},
    type: {type: String, required: true},
    nodeType: {type: String, required: true},
    edges: [{type: String}],
    children: [NodeSchema]
});

const ApiBuilderSchema = new Schema({
    apiConfig: {type: schema.Types.ObjectId, ref: "ApiConfigs", required: true},
    nodes: [NodeSchema]
})

const ApiBuilder = model('ApiBuilder', ApiBuilderSchema);

export default ApiBuilder;