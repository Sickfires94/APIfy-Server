import { Schema, model } from 'mongoose';

const userRoles = ['admin', 'user'];
const schema = Schema;



const UserSchema = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    firstName: { type: String,required: true},
    lastName: { type: String ,required: true},
    role: { type: String, enum: userRoles, required: true },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status : {
        type: String, enum: ['active', 'inactive'],
        default: 'active'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: schema.Types.ObjectId,
        ref: "Users",
    },
    isDeleted : {
        type: Boolean, default: false
    },
    deletedAt: {
        type : Date
    },
    deletedBy: {
        type: schema.Types.ObjectId,
        ref: "Users",
    },
});

const Users = model('Users', UserSchema);

export default Users;