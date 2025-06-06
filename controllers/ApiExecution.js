import ApiConfigs from "../models/ApiConfig.js";
import apiConfig from "../models/ApiConfig.js";
import { runQuery} from "../Functions/runQuery.js";
import Log from "../models/LogEntry.js";
import {httpStatusCodeCategories, logLevels} from "../Enums/Logger.js";

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
    const TESTING_FLAG = requestInputs["TestingFlag"] ?? false;

    const api = await ApiConfigs.findOne({name: name, project: project}).lean()
    if(!api) return res.status(404).json({"error": "Api Not Found"})


    // Initialize Logging
    const startTime = Date.now();
    const log = await new Log({apiName: name, project: project, testingFlag: TESTING_FLAG});
    log.errorsList = []
    const errorsList = log.errorsList;
    await log.save()


    let outputs = new Array(api.queries.length + 1).fill(null);
    outputs[0] = {}  // To initialize request Params

    try{
        for(const paramSource of api.requestParams){
            if(!requestInputs[paramSource.name]){
                console.log("Parameter not found")
                log.status = httpStatusCodeCategories.CLIENT_ERROR;
                errorsList.push({message: `Request Parameter ${paramSource.name} not found.`});
                continue;
            }
            outputs[0][paramSource.name] = requestInputs[paramSource.name]
        }
    }
    catch (e) {
        console.error(`Error while initialising Request Params, ${e}`);
    }

    if(errorsList.length > 0){
        log.responseMessage = "one or more request Parameters are missing"
        await log.save();
        return res.status(400).json({message: "one or more request Parameters are missing", "errors": errorsList});
    }

    const outputsOffset = 1; // 1 to account for request Params at index 0

    // Run Queries until resolved or not making any progress
    let madeProgress
    do {
        madeProgress = false
        for(let i = 0; i < api.queries.length; i++){
            if(outputs[i + outputsOffset] !== null) continue; // +1 to account for request Params at index 0
            const {output, error} = await runQuery(api.queries[i], outputs, TESTING_FLAG, errorsList);
            if(error){
                console.log("BIGGGG ERRRORRR")
                errorsList.push(error);
                log.status = httpStatusCodeCategories.SERVER_ERROR;
            }

            if(output !== null) {
                madeProgress = true
                console.log("Marking Progress")
            }
            outputs[i + outputsOffset] = output;

        }

        console.log("Made Progress: " + madeProgress);
    }
    while(madeProgress)

    const response = {}

    console.log("Final Outputs: " + JSON.stringify(outputs));


    // keep track of which response to send
    let responseIndex = -1;

    for (let i = 0; i < api.responses.length; i++){
        let responseValid = true;

        const response = api.responses[i];

        if(response.conditionConnectors.length > 0){
            for (const connector of response.conditionConnectors){
                const source = connector.valueSources[0]
                if(!outputs[source.index] || !outputs[source.index][source.sourceName]){
                    console.log(`Response at ${i} invalid`)
                    responseValid = false;
                    break;
                }
            }
            if(responseValid) responseIndex = i;
        }
        if(!responseValid) continue;

        for(const param of response.params){
            if(!outputs[param.index] || !outputs[param.index][param.sourceName]){
                responseValid = false;
                console.log(`Response at ${i} invalid`)
                break;
            }
        }
        if(responseValid){
            responseIndex = i;
            break;
        }
    }


    let message;
    let httpCode;

    if(responseIndex === -1) {
        //res.status(500).json({"error": "API did not function completely"}).end()
        message = "API did not function completely"
        httpCode = 500
    }


    // // Build the response
    else {
        for(const param of api.responses[responseIndex].params) {
            if(outputs[param.index] === null || outputs[param.index] === undefined) return res.status(500).json({"error": "API did not function completely"}).end()
            response[param.name] = outputs[param.index][param.sourceName]
        }

        message = api.responses[responseIndex].message;
        httpCode = api.responses[responseIndex].httpCode;
    }



    if(errorsList.length > 0){

        console.log(`Errors: ${errorsList}`)

        log.responseMessage = "API did not function completely";
        log.status = httpStatusCodeCategories.SERVER_ERROR;
        log.level = logLevels.ERROR

    }
    else {
        log.status = httpStatusCodeCategories.SUCCESS;
    }
    log.statusCode = httpCode;
    log.responseMessage = message;
    log.responseTimeMs = Date.now() - startTime;
    await log.save();

    return res.status(httpCode).json({message: message, data: response, errors: errorsList}).end()

}

export {
    runApi2
};