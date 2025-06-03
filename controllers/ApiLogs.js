import ApiFolders from "../models/ApiFolder.js";
import Log from "../models/LogEntry.js";
import Projects from "../models/Project.js";
import {logTimeUnit} from "../Enums/Logger.js";
import CircularJSON from "qs";

const getLogs = async (req, res) => {
    try {

        const {projectId} = req.params;
        console.log(`Retrieving logs for project ID: ${projectId}`);
        const project = await Projects.findById(projectId);

        if(!project) return res.status(404).send("Project Not Found");

        if(!project.user.equals(req.user.id)) return res.status(401).json({error: "Unauthorized access for this project"});

        // --- Filtering Options ---
        let {
            apiName,
            level,
            statusCode,
            search, // General search term for message
            startDate,
            endDate,
            apiFolder
        } = req.query;


        // console.log(`apiName: ${apiName}`)

        if (apiName && !Array.isArray(apiName)) {
            apiName = [apiName];
        }


        if(!apiName) apiName = [];

        let filter = {};

        filter.project = projectId;

        if(apiFolder){
            const folder = await ApiFolders.findOne({folderName: apiFolder, project: projectId}, {apis: 1}).populate("apis", {_id: 0, name: 1});
            if(!folder) return res.status(404).send("Folder does not exist");



            for(const api of folder.apis){
                apiName.push(api.name);
            }

        }

        if(apiName.length > 0){
            filter.apiName = {'$in' : apiName};
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

        // console.log(`Logs retrieval filter: ${JSON.stringify(filter)}`);

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

const getLogCountByRange = async (req, res) => {
    try {
        const { projectId } = req.params;
        // 'period' is a number, 'unit' can be 'hours', 'days', or 'months'
        const period = parseInt(req.query.period);
        const unit = req.query.unit;
        let apiName = req.query.apiName ?? []; // Get apiName from query, default to empty string
        const apiFolder = req.query.apiFolder


        // Authentication and authorization checks
        const project = await Projects.findById(projectId);
        if (!project) return res.status(404).send("Project Not Found");
        if (!project.user.equals(req.user.id)) return res.status(401).json({ error: "Unauthorized access for this project" });

        if (isNaN(period) || period <= 0) {
            return res.status(400).json({ error: "Invalid 'period' specified. It must be a positive number." });
        }
        // Validate unit against the defined enum values
        if (!Object.values(logTimeUnit).includes(unit)) {
            return res.status(400).json({ error: `Invalid 'unit' specified. Valid units are '${Object.values(logTimeUnit).join("', '")}'.` });
        }

        let startDate;
        let endDate = new Date(); // Default end date to now
        let groupById; // For $group _id to define the time unit for aggregation
        let dateFormat; // For $dateToString format

        switch (unit) {
            case logTimeUnit.HOUR:
                // Calculate start date for the specified number of hours
                startDate = new Date(endDate.getTime() - (period * 60 * 60 * 1000));
                // Group by year, month, day, and hour for hourly counts
                groupById = {
                    year: { $year: "$requestTime" }, // Changed from $timestamp
                    month: { $month: "$requestTime" }, // Changed from $timestamp
                    day: { $dayOfMonth: "$requestTime" }, // Changed from $timestamp
                    hour: { $hour: "$requestTime" } // Changed from $timestamp
                };
                dateFormat = "%Y-%m-%dT%H:00";
                break;
            case logTimeUnit.DAY:
                // Calculate start date for the specified number of days
                startDate = new Date(endDate.getTime() - (period * 24 * 60 * 60 * 1000));
                // Group by year, month, and day for daily counts
                groupById = {
                    year: { $year: "$requestTime" }, // Changed from $timestamp
                    month: { $month: "$requestTime" }, // Changed from $timestamp
                    day: { $dayOfMonth: "$requestTime" } // Changed from $timestamp
                };
                dateFormat = "%Y-%m-%d";
                break;
            case logTimeUnit.MONTH:
                // Calculate start date for the specified number of months ago (start of that month)
                startDate = new Date(endDate.getFullYear(), endDate.getMonth() - period, 1);
                // Group by year and month for monthly counts
                groupById = {
                    year: { $year: "$requestTime" }, // Changed from $timestamp
                    month: { $month: "$requestTime" } // Changed from $timestamp
                };
                dateFormat = "%Y-%m";
                break;
        }

        // Build the match filter dynamically
        const matchFilter = {
            project: project._id,
            requestTime: { // Changed from timestamp
                $gte: startDate,
                $lte: endDate
            }
        };

        if (apiName && !Array.isArray(apiName)) {
            apiName = [apiName];
        }

        if(apiFolder){
            const folder = await ApiFolders.findOne({folderName: apiFolder, project: projectId}, {apis: 1}).populate("apis", {_id: 0, name: 1});
            if(!folder) return res.status(404).send("Folder does not exist");

            for(const api of folder.apis){
                apiName.push(api.name);
            }

        }

        if(apiName.length > 0){
            matchFilter.apiName = {'$in' : apiName};
        }

        // Define the aggregation pipeline
        const aggregationPipeline = [
            {
                // Stage 1: Filter documents by project ID, requestTime range, and optionally apiName
                $match: matchFilter
            },
            {
                // Stage 2: Group documents by the defined time unit (hour, day, or month)
                $group: {
                    _id: groupById, // Grouping key based on the period
                    count: { $sum: 1 } // Count documents in each group
                }
            },
            {
                // Stage 3: Sort the results chronologically
                $sort: {
                    '_id.year': 1,
                    '_id.month': 1,
                    '_id.day': 1, // Sort by day is relevant for daily/hourly grouping
                    '_id.hour': 1 // Sort by hour is relevant only for hourly grouping
                }
            },
            {
                // Stage 4: Project the final output to format the time unit and include the count
                $project: {
                    _id: 0, // Exclude the default _id field from the output
                    timeUnit: {
                        $dateToString: {
                            format: dateFormat,
                            date: {
                                // Reconstruct a date object from the grouped _id components
                                $dateFromParts: {
                                    year: "$_id.year",
                                    month: "$_id.month",
                                    day: "$_id.day",
                                    // Hour is only relevant for hourly grouping
                                    hour: unit === logTimeUnit.HOUR ? "$_id.hour" : 0
                                }
                            }
                        }
                    },
                    count: "$count" // Include the count of logs
                }
            }
        ];

        // Execute the aggregation pipeline
        const logCounts = await Log.aggregate(aggregationPipeline);

        console.log(`Pipeline: ${JSON.stringify(aggregationPipeline)}`);

        // Send a successful response with the aggregated log counts
        res.status(200).json({
            status: 'success',
            period: `${period} ${unit}`, // Reflect the requested period and unit
            results: logCounts.length,
            data: logCounts
        });

    } catch (error) {
        // Handle any errors during the process
        console.error('Error retrieving log counts by range:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve log counts by range',
            error: error.message
        });
    }
};


export {getLogs, getLogCountByRange}