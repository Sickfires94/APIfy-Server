import { Schema, model } from 'mongoose';

const schema = Schema;


const ConfigurationSchema = new Schema({
    queryType: { type: String },
    type: { type: String },
    outputColums: [String],
    operator: { type: String },
  }, { _id: false });
  
  const EdgeSchema = new Schema({
    id: {type: String},
    type: {type: String}
  }, {_id: false});


const NodeSchema = new Schema()
    NodeSchema.add({
    x: {type: Number},
    y: {type: Number},
    id: {type: String},
    name: {type: String},
    type: {type: String},
    nodeType: {type: String},
    edges: [EdgeSchema],
    edgesFrom: [EdgeSchema],
    configuration: ConfigurationSchema, 
    children: [NodeSchema]
});


const ApiBuilderSchema = new Schema({
    apiConfig: {type: schema.Types.ObjectId, ref: "ApiConfigs", required: true},
    nodes: [NodeSchema]
})

const ApiBuilder = model('ApiBuilder', ApiBuilderSchema);

export default ApiBuilder;