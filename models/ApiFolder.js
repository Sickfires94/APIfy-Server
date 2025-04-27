import {Schema, model, Model} from 'mongoose';

const schema = Schema;

const apiFolderSchema = new Schema({
  folderName: { type: String, required: true },
  project: { type: schema.Types.ObjectId, ref: 'Projects', required: true },
  apis: [{ type: schema.Types.ObjectId, ref: 'ApiConfigs' }] 
});

const ApiFolders = model('ApiFolder', apiFolderSchema);
export default ApiFolders;