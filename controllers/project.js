import User from "../models/User.js";
import Project from '../models/Project.js';
import { get } from "mongoose";

export const createProject = async (req, res) => {
  console.log('creating project');

  console.log("name: " + req.body.name);
  if(!req.body || !req.body.name){
    return res.status(400).end();
  }
  let project = await Project.findOne({
    user: req.user.id,
    name: req.body.name
  })
  if (project){
    console.log(project);
    return res.status(409).end();
  }
  project = new Project({
    name: req.body.name,
    user: req.user.id
  })
  console.log(project);
  project.save();

  res.json(project);
};

export const getAllProjects = async (req,res)=>{
  const userId = req.user.id;
  if(!userId){
    return res.status(400).end();
  }
  const projects = await Project.find({user: userId}).exec();
  return res.json(projects).end()
}

export const getProject = async (req, res) => {
  const userId = req.user.id;
  const {name} = req.params;


  const project = await Project.findOne({user: userId, name: name}, {user: 0});

  if (!project){
    return res.status(404).end();
  }
  console.log(project);
  return res.json(project).status(200).end();
}

export const getProjectById = async (req, res) => {
  const { id } = req.body;
  const project = await Project.findOne({ _id: id });
  if (!project) {
    console.log("project not found");
    return res.status(404).end();
  }
  return res.json(project.name).status(200).end();
}

export default {
  createProject,
  getAllProjects,
  getProject,
  getProjectById
};