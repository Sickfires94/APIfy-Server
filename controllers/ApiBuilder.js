
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


export default {
    createProject,
};