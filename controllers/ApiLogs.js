import Log from "../models/LogEntry.js";
import Project from "./project.js";
import Projects from "../models/Project.js";

const getLogs = async (req, res) => {
    try {

        const {projectId} = req.params;
        console.log(`Retrieving logs for project ID: ${projectId}`);
        const project = await Projects.findById(projectId);

        if(!project) return res.status(404).send("Project Not Found");

        if(!project.user.equals(req.user.id)) return res.status(401).json({error: "Unauthorized access for this project"});

        // --- Filtering Options ---
        const {
            apiName,
            level,
            statusCode,
            search, // General search term for message
            startDate,
            endDate
        } = req.query;

        let filter = {};

        if(apiName){
            filter.apiName = apiName;
        }

        if(statusCode){
            filter.statusCode = statusCode;
        }

        if (level) {
            filter.level = level;
        }


        if (search) {
            // Case-insensitive partial match for message
            filter.responseMessage = {
                $regex: search,
                $options: 'i'
            };
        }

        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) {
                filter.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                // Ensure endDate includes the entire day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.timestamp.$lte = end;
            }
        }

        console.log(`Logs retrieval filter: ${JSON.stringify(filter)}`);

        // --- Sorting Options ---
        const {
            sortBy = 'timestamp', // Default sort by timestamp
            sortOrder = 'desc' // Default sort order descending
        } = req.query;

        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1; // 1 for ascending, -1 for descending

        // --- Pagination Options ---
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 20; // Default to 10 logs per page
        const skip = (page - 1) * limit;

        // --- Fetch Logs ---
        const logs = await Log.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        // --- Get Total Count for Pagination Metadata ---
        const totalLogs = await Log.countDocuments(filter);

        res.status(200).json({
            status: 'success',
            results: logs.length,
            page,
            limit,
            totalPages: Math.ceil(totalLogs / limit),
            totalLogs,
            data: logs,
        });

    } catch (error) {
        console.error('Error retrieving logs:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve logs',
            error: error.message
        });
    }
};

export {getLogs}