import { Schema, model } from 'mongoose';

const schema = Schema;



const ProjectSchema = new Schema({
    name: {type: String, required: true},
    user: {
        type: schema.Types.ObjectId,
        ref: "Users",
    },
});

const Projects = model('Projects', ProjectSchema);

export default Projects;