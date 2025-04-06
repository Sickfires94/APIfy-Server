import { Schema, model } from 'mongoose';

const schema = Schema;

const NodeSchema = new Schema()
    NodeSchema.add({
    x: {type: Number},
    y: {type: Number},
    id: {type: String},
    name: {type: String},
    type: {type: String},
    nodeType: {type: String},
    edges: [{type: String}],
    children: [NodeSchema]
});

const ApiBuilderSchema = new Schema({
    apiConfig: {type: schema.Types.ObjectId, ref: "ApiConfigs", required: true},
    nodes: [NodeSchema]
})

const ApiBuilder = model('ApiBuilder', ApiBuilderSchema);

export default ApiBuilder;