import User from "../models/User.js";
import Project from '../models/Project.js';

export const createProject = async (req, res) => {
  console.log('creating project');

  if(!req.query || !req.query.name){
    return res.status(400).end();
  }
  const project = Project.findOne({
    user: req.user.id,
    name: req.query.name
  })
  if (project){
    return res.status(409).end();
  }
  project = new Project({
    name: req.query.name,
    user: req.user.id
  })
  console.log(project);
  project.save();

  res.json(project);
};

export const getAllProjects = async (req,res)=>{
  const {userId} = req.params;
  if(!userId){
    return res.status(400).end();
  }
  const projects = await Project.find({user: userId}).exec();
  return res.json(projects).end()
}

export default {
  createProject,
  getAllProjects
};