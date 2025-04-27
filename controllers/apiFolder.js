import ApiFolder from "../models/apiFolder.js";

export const createFolder = async (req, res) => {
  try {
    const { folderName, projectId } = req.body;

    if (!folderName || !projectId) {
      return res.status(400).json({ success: false, message: "Folder name and project ID are required" });
    }

    const newFolder = new ApiFolder({
      folderName: folderName,
      project: projectId,
      apis: [],
    });

    await newFolder.save();

    return res.status(201).json({ success: true, data: newFolder });
  } catch (error) {
    console.error("Create Folder Error:", error);   // <-- Important for debugging!
    return res.status(500).json({ success: false, message: "Server " });
  }
};

export const getAllFolders = async (req, res) => {
  try {
    const folders = await ApiFolder.find({ project: req.body.projectId });
    return res.status(200).json({ success: true, data: folders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getFolderApis = async (req, res) => {
  try {
    const folder = await ApiFolder.findById(req.body.folderId).populate('apis');
    if (!folder) {
      return res.status(404).json({ success: false, message: "Folder not found" });
    }
    return res.status(200).json({ success: true, data: folder.apis });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const addApiToFolder = async (req, res) => {
  try {
    const { folderId, apiId } = req.body;
    const folder = await ApiFolder.findByIdAndUpdate(
      folderId,
      { $push: { apis: apiId } },
      { new: true }
    );
    if (!folder) {
      return res.status(404).json({ success: false, message: "Folder not found" });
    }
    return res.status(200).json({ success: true, data: folder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export default {
  createFolder,
  getAllFolders,
  getFolderApis,
  addApiToFolder,
};
