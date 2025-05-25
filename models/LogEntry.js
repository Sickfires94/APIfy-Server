import {Schema, model, Model} from 'mongoose';
import QueryTypes from "../Enums/QueryTypes.js";
import {httpStatusCodeCategories, logLevels} from "../Enums/Logger.js";

const schema = Schema;

const data = new Schema({
    name: {String},
    value: {type: Schema.Types.Mixed,}
})

const errorQuery = new Schema({
    type: {type: String, enum:QueryTypes, required: true},
    model: {type: schema.Types.ObjectId, ref: 'Models' },
    inputs: {type: data},
    outputs: {type: data},
})


const errorSchema = new Schema({
    message: {String},
    errorQuery: {String}
})

const LogSchema = new Schema({
    apiName: { type: String, required: true },
    project: { type: schema.Types.ObjectId, ref: 'Projects', required: true },
    requestTime: {type: Date,
        default: Date.now
    },
    responseTimeMs: {type: Number },
    status: {type:String, enum: httpStatusCodeCategories, default: httpStatusCodeCategories.IN_PROGRESS},
    level: {type: String, enum: logLevels, default: logLevels.INFO},
    statusCode: {type: Number},
    responseMessage: {type: String},
    errorsList: { type: [errorSchema], default: [] },
    testingFlag: {type: Boolean, default: false},
});

const Log = model('Log', LogSchema);
export default Log;