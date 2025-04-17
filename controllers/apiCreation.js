import Model, { checkIfArrayContainsValidColums, getColumnsFromModel } from "../models/Model.js";
import User from "../models/User.js";
import parseModel from "../Functions/parseModel.js";
import mongoose, { Mongoose } from "mongoose";
import ApiConfigs from "../models/ApiConfig.js";
import Models from "../models/Model.js";
import apiConfig from "../models/ApiConfig.js";
import ApiConfig from "../models/ApiConfig.js";
import MiddlewareConfig from "../models/MiddlewareConfig.js";
import MiddlewareConfigs from "../models/MiddlewareConfig.js";
import { GetFlow } from "../Functions/APIs/Get.js";
import { PostFlow } from "../Functions/APIs/Post.js";
import { DeleteFlow } from "../Functions/APIs/Delete.js";
import { UpdateFlow } from "../Functions/APIs/Update.js";
import ApiTypes from "../Data/ApiTypes.js";
import { request, response } from "express";
import { checkParamsExist } from "../Functions/Helper Functions/CheckBodyParams.js";
import { transformOperators } from "../Functions/Helper Functions/TransformOperators.js";
import ApiBuilder from "../models/Node.js";
import {runQuery} from "../Functions/runQuery.js";


const createAPI = async (req, res) => {
    // Add default values and destructure
    const { name, project, model, type, searchParams = [], setParams = [], responseParams = [] } = req.body;

    // Check required parameters
    checkParamsExist(res, [name, project, model, type]);

    // Validate array parameters
    if (!Array.isArray(searchParams)) {
        return res.status(400).json({ error: "searchParams must be an array" }).end();
    }
    if (!Array.isArray(setParams)) {
        return res.status(400).json({ error: "setParams must be an array" }).end();
    }
    if (!Array.isArray(responseParams)) {
        return res.status(400).json({ error: "responseParams must be an array" }).end();
    }

    let api = await ApiConfigs.findOne({ project: project, name: name }).exec();
    if (api) {
        return res.status(409).json({ error: "API already exists" }).end();
    }

    let modelDef = await Model.findOne({ _id: model }).exec();
    if (!modelDef) {
        return res.status(404).json({ error: "Model Not Found" }).end();
    }

    let columns = getColumnsFromModel(modelDef);

    console.log("search Params: " + searchParams);

    if (
        !checkIfArrayContainsValidColums(
            searchParams.map(param => param?.column),
            columns
        ) ||
        !checkIfArrayContainsValidColums(setParams, columns) ||
        !checkIfArrayContainsValidColums(responseParams, columns)
    ) {
        return res.status(400).json({ error: "Invalid parameters" }).end();
    }

    // Existing switch case remains the same
    switch (type) {
        case (ApiTypes.GET):
            break;
        case (ApiTypes.POST):
            if (setParams.length < 1)
                return res.status(403).json({ error: "At least 1 parameter should be set" });
            break;
        case (ApiTypes.UPDATE):
            if (setParams.length < 1)
                return res.status(403).json({ error: "At least 1 parameter should be set" });
            break;
        case (ApiTypes.DELETE):
            if (searchParams.length < 1)
                return res.status(403).json({ error: "At least 1 parameter should be searched for" });
            break;
        case (ApiTypes.AUTH):
            if (searchParams.length < 2 && responseParams.length > 1)
                return res.status(403).json({ error: "Invalid Set of Parameters" });
            break;
        default:
            return res.status(400).json({ error: "Invalid Request Type" }).end();
    }

    const transformedSearchParams = transformOperators(searchParams);

    // Create API Config
    api = new ApiConfig({
        name,
        project,
        user: req.user.id,
        model: model,
        searchParams: transformedSearchParams,
        setParams: setParams,
        responseParams: responseParams,
        type: type,
    });

    let apiBuilder = new ApiBuilder({
        nodes:
            [
                {
                    x: 100,
                    y: 100,
                    id: "1",
                    name: 'Request Parameters',
                    type: 'request',
                    nodeType: 'requestParams',
                    edges: [],
                    children: []
                },
                {
                    x: 700,
                    y: 100,
                    id: "2",
                    name: 'Response',
                    type: 'response',
                    nodeType: 'responseNode',
                    edges: [],
                    children: []
                }

            ],
        apiConfig: api._id
    })



    await apiBuilder.save();
    await api.save();
    res.json(api).end();
};

const getApi = async (req, res) => {
    const { apiId } = req.params;

    const data = await ApiConfigs.findOne({ user: req.user.id, _id: apiId }).exec();
    res.json(data);
}

const getAPIs = async (req, res) => {
    const { project } = req.body;
    checkParamsExist(res, [project])

    let apis = await ApiConfigs.find({ project: project }).exec();

    return res.json(apis).status(200).end()
}

const testAPI = async (req, res) => {
    const { name, project, requestParams } = req.body;
    checkParamsExist(res, [name, project])

    let api = await ApiConfigs.findOne({ project: project, name }).exec();

    if (!api) {
        return res.status(404).end();
    }

    const userModel = await mongoose.model(req.modelName)

    const data = await userModel.find(requestParams, api.responseParams)
    return res.json(data).status(200).end()
}

const deployAPI = async (req, res) => {
    const { name, project } = req.params;
    const { searchParams, setParams } = req.body;

    checkParamsExist(res, [name, project])
    console.log("params: ", req.params);

    let api = await ApiConfigs.findOne({ project: project, name: name }).exec();

    if (!api) {
        return res.status(404).end();
    }

    for (let i = 0; i < api.searchParams.length; i++) {
        if (!(searchParams.hasOwnProperty(api.searchParams[i].column))) {
            return res.status(400).json({ error: api.searchParams[i] + " missing" }).end();
        }
    }

    for (let i = 0; i < api.setParams.length; i++) {
        if (!(searchParams.hasOwnProperty(api.setParams[i]))) {
            return res.status(400).json({ error: api.setParams[i] + " missing" }).end();
        }
    }


    switch (api.type) {
        case ApiTypes.GET:
            GetFlow(api, req.modelName, searchParams, res)
            break;
        case ApiTypes.POST:
            PostFlow(api, req.modelName, setParams, res)
            break;
        case ApiTypes.DELETE:
            DeleteFlow(api, req.modelName, searchParams, res)
            break;
        case ApiTypes.UPDATE:
            UpdateFlow(api, req.modelName, searchParams, setParams, res)
            break;
        case ApiTypes.AUTH:
            AuthFlow(api, req.modelName, searchParams, res)
            break;
    }
}

const runApi = async (req, res) => {
    /*
    1. Find Api config
    2. Find parameters required for api (defined in request node/requestParams)
        2.1 create array for outputs with initial values null (output array)
        2.2 place initial request parameters in index 0
    3. go through the Query array in the config
        3.1 call runQuery for each query, passing the current outputs array
            3.1.1 if runQuery returns null, it means a dependency isn't met yet. Skip and try again in the next loop iteration.
            3.1.2 if runQuery returns a result, save its output in the outputs array at the query's index + 1 (since index 0 is request params)
        3.2 check if all the queries are run (check if all elements in outputs array, except index 0, are non-null)
            3.2.1 if not all run, repeat step 3. Add a loop limit to prevent infinite loops.
        3.3 create the response based on apiConfig.responseParams
        3.4 send the response
    */

    const { name, project } = req.params;
    console.log("Entered flow")
    // Combine body, query, and potentially params as initial inputs
    const requestInputs = { ...req.body, ...req.query, ...req.params }; // Using all potential input sources

    try {
        // 1. Find Api config, populate necessary details
        const apiConfig = await ApiConfigs.findOne({ project: project, name: name })
            .populate('queries.model') // Populate model details needed by runQuery
            .lean(); // Use .lean() for performance if modifications aren't needed

        if (!apiConfig) {
            console.error(`runApi: API configuration not found for project='${project}', name='${name}'`);
            return res.status(404).json({ error: "API configuration not found" });
        }
        if (!apiConfig.queries || !Array.isArray(apiConfig.queries)) {
            console.error(`runApi: API configuration for '${name}' is missing or has invalid 'queries'.`);
            return res.status(500).json({ error: "Invalid API configuration: missing queries." });
        }

        console.log("Step 2")

        // 2. Prepare outputs array (size = number of queries + 1 for initial params)
        const numQueries = apiConfig.queries.length;
        let outputs = new Array(numQueries + 1).fill(null);

        // 2.2 Place validated initial request parameters at index 0
        let initialParams = {};
        if (apiConfig.requestParams && apiConfig.requestParams.length > 0) {
            for (const param of apiConfig.requestParams) {
                if (requestInputs.hasOwnProperty(param.name)) {
                    initialParams[param.name] = requestInputs[param.name];
                } else {
                    // Handle missing required request parameters strictly
                    console.error(`runApi: Missing required request parameter '${param.name}' for API '${name}'.`);
                    return res.status(400).json({ error: `Missing required request parameter: ${param.name}` });
                }
            }
        } else {
            // If no requestParams are defined in config, maybe no input is expected?
            console.log(`runApi: No specific request parameters defined for API '${name}'. Proceeding without initial parameters.`);
            // initialParams = {}; // Or potentially use all requestInputs if that's the desired default
        }
        outputs[0] = initialParams;
        console.log(`runApi: Initial parameters (outputs[0]):`, initialParams);


        console.log("Step 3")

        // 3. Execute queries iteratively, handling dependencies
        let allQueriesCompleted = (numQueries === 0); // True if there are no queries
        let attempts = 0;
        // Set a reasonable attempt limit based on query count to prevent infinite loops
        const maxAttempts = numQueries * 2 + 2; // Allow some retries

        while (!allQueriesCompleted && attempts < maxAttempts) {
            let queriesNewlyCompleted = 0;
            console.log(`runApi: Starting attempt ${attempts + 1} to run queries.`);

            for (let i = 0; i < numQueries; i++) {
                // Only try to run if not already completed in a previous attempt
                if (outputs[i + 1] === null) {
                    const queryConfig = apiConfig.queries[i];
                    // Ensure the model details are populated correctly for runQuery
                    if (!queryConfig.model || !queryConfig.model.name || !queryConfig.model.project) {
                        console.error(`runApi: Query ${i} has incomplete model information.`);
                        return res.status(500).json({ error: `Configuration error in query ${i}: missing model details.` });
                    }

                    const result = await runQuery(queryConfig, outputs);

                    if (result !== null) {
                        // Check if runQuery returned an error structure
                        if (result && result.error) {
                            console.error(`runApi: Query ${i} failed execution. Error: ${result.message}`, result.details);
                            return res.status(500).json({ error: `Execution failed for query ${i}`, details: result.message });
                        }

                        // Store successful result (index is i+1)
                        outputs[i + 1] = result;
                        queriesNewlyCompleted++;
                        console.log(`runApi: Query ${i} completed successfully in attempt ${attempts + 1}.`);
                    } else {
                        console.log(`runApi: Query ${i} deferred in attempt ${attempts + 1} (dependency not met).`);
                    }
                }
            }

            // Check if all queries are now completed
            // All slots from index 1 up to numQueries must be non-null
            allQueriesCompleted = outputs.slice(1).every(output => output !== null);

            // If no queries were completed in this iteration, and we are not done, it implies a deadlock or unresolvable dependency
            if (queriesNewlyCompleted === 0 && !allQueriesCompleted) {
                console.error(`runApi: No progress made in query execution attempt ${attempts + 1}. Possible circular dependency or missing input.`);
                return res.status(500).json({ error: "API execution stalled. Check dependencies." });
            }

            attempts++;
        }

        if (!allQueriesCompleted) {
            console.error(`runApi: Failed to complete all API queries within ${maxAttempts} attempts for API '${name}'.`);
            return res.status(500).json({ error: "API execution failed: Could not resolve query dependencies." });
        }

        // 3.3 Construct the final response based on apiConfig.responseParams
        let finalResponse = {};
        console.log(`runApi: Constructing final response for API '${name}'.`);
        if (apiConfig.responseParams && apiConfig.responseParams.length > 0) {
            apiConfig.responseParams.forEach(param => {


                // Ensure source index is valid
                if (param.index >= 0 && param.index < outputs.length) {

                    // if findOne used, works
                    // if find used, sourceOutput is an array and need to loop through it
                    // requires more testing to see if it works properly
                    const sourceOutput = outputs[param.index][0];


                    console.log('param:', param);
                    console.log("sourceOutput: ", sourceOutput)

                    // Handle potential nested property access if sourceOutput is an object
                    if (sourceOutput !== null && typeof sourceOutput === 'object' && param.sourceName in sourceOutput) {
                        finalResponse[param.name] = sourceOutput[param.sourceName];
                        console.log(`runApi: Mapping response param '${param.name}' from output index ${param.index}.`);
                    }
                    else if (sourceOutput !== null && param.index > 0 && typeof sourceOutput !== 'object' && !param.name) {
                        // Case: Source output is likely a primitive, and no specific name is required by responseParam config.
                        // Requires a convention for naming. Using a generic name.
                        const responseKey = `output_${param.index}`;
                        finalResponse[responseKey] = sourceOutput;
                        console.log(`runApi: Mapping primitive output from index ${param.index} to response key '${responseKey}'.`);
                    }
                    else {
                        console.warn(`runApi: Response parameter '${param.sourceName || '(no name specified)'}' could not be sourced from output index ${param.index}. Output was:`, sourceOutput);
                        // Optionally include null or skip missing response parameters
                        // finalResponse[param.name] = null;
                    }
                } else {
                    console.warn(`runApi: Invalid index ${param.index} specified for response parameter '${param.name}'.`);
                }
            });
        } else {
            // Default response if no responseParams are defined: use the last query's output or a standard message
            finalResponse = outputs[numQueries] ?? { message: "API executed successfully." };
            console.log(`runApi: No specific response parameters defined. Using default response.`);
        }

        // 3.4 Send the final constructed response
        console.log(`runApi: Sending final response for API '${name}'.`);
        return res.status(200).json(finalResponse);

    } catch (error) {
        console.error(`runApi: Unhandled exception during execution of API '${name}':`, error);
        return res.status(500).json({ error: "Internal server error during API execution", details: error.message });
    }
};

const runApi2 = async (req, res) => {
    /*
    1. Find Api config
    2. Find parameters required for api (defined in request node/requestParams)
        2.1 create array for outputs with initial values null (output array)
        2.2 place initial request parameters in index 0
    3. go through the Query array in the config
        3.1 call runQuery for each query, passing the current outputs array
            3.1.1 if runQuery returns null, it means a dependency isn't met yet. Skip and try again in the next loop iteration.
            3.1.2 if runQuery returns a result, save its output in the outputs array at the query's index + 1 (since index 0 is request params)
        3.2 check if all the queries are run (check if all elements in outputs array, except index 0, are non-null)
            3.2.1 if not all run, repeat step 3. Add a loop limit to prevent infinite loops.
        3.3 create the response based on apiConfig.responseParams
        3.4 send the response
    */

    const { name, project } = req.params;
    console.log("Entered flow")
    // Combine body, query, and potentially params as initial inputs
    const requestInputs = { ...req.body, ...req.query, ...req.params }; // Using all potential input sources

    const api = await ApiConfigs.findOne({name: name, project: project}).lean()
    if(!api) return res.status(404).json({"error": "Api Not Found"})

    let outputs = new Array(api.queries.length + 1).fill(null);

    output[0] = {}  // To initialize request Params

    try{
        for(const paramSource of api.requestParams){
            output[0][paramSource.name] = requestInputs[paramSource.name]
        }
    }
    catch (e) {
        console.error(`Error while initialising Request Params, ${e}`);
    }


    // Run Queries until resolved or error
    let madeProgress

    do {
        madeProgress = false
    }
    while(madeProgress)

}

const createMiddleware = async (req, res) => {
    const { name, project, model, role_col, accessible_roles } = req.body;
    checkParamsExist(res, [name, project, model, role_col, accessible_roles]);
    console.log(req.body);

    let middleware = await MiddlewareConfigs.findOne({ user: req.user.id, project: project, name }).exec();

    if (middleware) {
        return res.status(409).end();
    }


    middleware = new MiddlewareConfig({
        name,
        project,
        user: req.user.id,
        model: model,
        role_col: role_col,
        accessible_roles: accessible_roles,
    })
    await middleware.save();
    res.json(middleware).end();
};



const addMiddleware = async (req, res) => {
    const { middleware_id, api_id } = req.body;

    const middleware = await MiddlewareConfigs.findOne({ _id: middleware_id })
    if (!middleware) {
        res.json({ error: "Middleware Not Found" }).status(404).end()
    }

    const api = await ApiConfigs.findOne({ _id: api_id });
    if (!api) {
        res.json({ error: "API Not Found" }).status(404).end();
    }

    await api.middlewares.push(middleware);
    await api.save();
    res.json(api).status(200).end();


}

const applyMiddlewares = async (req, res, next) => {
    const { name, project } = req.query;
    const api = await ApiConfigs.findOne({ project: project, name: name })

    if (!api.middleware) next();

    const middleware = await MiddlewareConfigs.findOne({ _id: api.middleware })
    if (!middleware) {
        res.json({ error: "Middleware not found" }).status(404).end();
    }
}

export {
    getAPIs,
    getApi,
    createAPI,
    testAPI,
    deployAPI,
    runApi
};
