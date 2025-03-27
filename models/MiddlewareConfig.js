import { Schema, model } from 'mongoose';
import ApiTypes from '../Data/ApiTypes.js';

const schema = Schema;

const MiddlewareSchema = new Schema({
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
    role_col: String,
    accessible_roles: [String],
});

const MiddlewareConfigs = model('MiddlewareConfigs', MiddlewareSchema);

export default MiddlewareConfigs;