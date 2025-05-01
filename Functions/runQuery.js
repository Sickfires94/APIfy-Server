import mongoose from 'mongoose';
import InputConnectorTypes from "../Data/InputConnectorTypes.js"; // Ensure this path is correct
import Models from "../models/Model.js";
import {query} from "express";
import QueryTypes from "../Data/QueryTypes.js";
import CRUD_Query_Flow from "./API Query Flows/CRUDQueryFlow.js";
import CRUDQueryFlow from "./API Query Flows/CRUDQueryFlow.js";
import hashFlow from "./API Query Flows/HashFlow.js";
import TokenGenerateFlow from "./API Query Flows/TokenGenerateFlow.js";
import TokenParseFlow from "./API Query Flows/TokenParseFlow.js";
import IfConditionFlow from "./API Query Flows/IfConditionFlow.js";
import ApiTypes from "../Data/ApiTypes.js"; // Ensure this path is correct

//
// const runQuery = async (Query, outputs, TESTING_FLAG) => {
//     /*
//     1. go through the value sources (inside connectors) and check if any of them are null in the outputs array
//         1.1 if any are null, return null (we are waiting for them to finish)
//     2. loop through the input connectors
//         (The following should have a maximum of 1 of each for each column)
//         (The following could be done simultaneously using the type of the connector)
//         2.1. find the finding connectors and create a mongoose find query
//         2.2. find the updating connectors and create a mongoose update query
//     3. check if the query requires findOne or find, call the correct one
//         3.1 check if the update query is empty
//             3.1.1 if its empty, only call findOne/find
//             3.1.2 if its not empty, call findOneAndUpdate/findAndUpdate
//     4. await the query and return it
//     */
//
//     // 1. Check if all required inputs (value sources) are available in the outputs array
//     for (const connector of Query.inputConnectors) {
//         for (const source of connector.valueSources) {
//
//             if(source === null) continue;
//
//             // Check if the index exists and the value at that index is not null/undefined
//             if (source.index >= outputs.length || outputs[source.index] === null || outputs[source.index] === undefined) {
//                 console.log(`runQuery: Waiting for output dependency from index ${source.index}`);
//                 return null; // Indicate that the query cannot run yet due to missing dependency
//             }
//         }
//     }
//
//     // 2. Prepare find and update queries based on input connectors
//     let findQuery = {};
//     let updateQuery = {};
//     let findOne = false; // Flag to determine if findOne or find/updateMany should be used
//
//     for (const connector of Query.inputConnectors) {
//         let value;
//         if (connector.valueSources.length > 0) {
//             let source = connector.valueSources[0];
//
//             if(source === null) source = connector.valueSources[1];
//
//
//             value = outputs[source.index]?.[source.sourceName] ?? outputs[source.index];
//
//             console.log("value: " + JSON.stringify(value));
//
//             if (value === undefined || value === null) {
//                 console.log(`runQuery: Value for '${source.name}' from output index ${source.index} is unavailable.`);
//                 return null; // Dependency value is unexpectedly not ready or missing
//             }
//         } else {
//             console.log(`runQuery: Connector for column '${connector.column}' has no specified value sources.`);
//             // Determine strategy: skip connector, use a default, or throw an error
//             continue; // Skipping this connector
//         }
//
//         // Build find query parts
//         if (connector.type === InputConnectorTypes.FIND || connector.type === InputConnectorTypes.FIND_ONE || connector.type === InputConnectorTypes.FIND_UPDATE) {
//             if (!findQuery[connector.column]) {
//                 findQuery[connector.column] = {};
//             }
//
//             // Apply the specified operator and value
//             findQuery[connector.column][connector.operator ?? '$eq'] = value; // Default to $eq if operator missing
//             if(connector.type === InputConnectorTypes.FIND_ONE) {
//                 findOne = true; // Mark if any connector implies a single document operation
//             }
//         }
//
//         // Build update query parts
//         if (connector.type === InputConnectorTypes.UPDATE || connector.type === InputConnectorTypes.FIND_UPDATE) {
//             // Typically updates use $set, adjust if other update operators are needed
//             if (!updateQuery.$set) {
//                 updateQuery.$set = {};
//             }
//             console.log("colum set" + connector.column)
//             console.log("type" + connector.type)
//             updateQuery.$set[connector.column] = value;
//         }
//     }
//
//     // 3. Execute the database query
//     // Ensure Query.model holds a reference or name that can resolve to a Mongoose model
//     // You might need to adjust how the model is retrieved, e.g., using project context
//     const modelName = `${Query.model.name}-${Query.model.project}`; // Example: Construct model name if needed
//     console.log("Model Name: " + modelName)
//     const Model = await mongoose.model(modelName);
//     let result;
//
//     try {
//         const isUpdateOperation = Object.keys(updateQuery).length > 0;
//         // Select columns for find operations if specified
//
//         console.log("Query = " + JSON.stringify(Query));
//
//         const projection = Query.outputColumns && Query.outputColumns.length > 0 ? Query.outputColumns.join(' ') : "";
//
//         if (isUpdateOperation) {
//             const options = { new: true }; // Return the modified document
//             if (findOne) { // FIND_UPDATE with findOne preference
//                 console.log(`runQuery: Executing findOneAndUpdate on ${modelName} | find=${JSON.stringify(findQuery)}, update=${JSON.stringify(updateQuery)}`);
//                 await Model.findOneAndUpdate(findQuery, updateQuery);
//                 result = await Model.findOne(findQuery);
//             } else { // FIND_UPDATE with find preference (implies updateMany)
//                 console.log(`runQuery: Executing updateMany on ${modelName} | find=${JSON.stringify(findQuery)}, update=${JSON.stringify(updateQuery)}`);
//                 // updateMany returns operation status, not the documents.
//                 console.log(findQuery)
//                 console.log(updateQuery)
//                 await Model.updateMany(findQuery, updateQuery);
//                 result = await Model.find(findQuery);
//                 // Consider if you need to fetch the updated documents separately
//             }
//         } else { // Read-only operation
//             if (findOne) { // FIND_ONE
//                 console.log(findQuery);
//
//                 // console.log(Model.schema)
//                 console.log(`runQuery: Executing findOne on ${modelName} | find=${JSON.stringify(findQuery)}, projection=${projection}`);
//                // if(modelName === "Books-672ee48bcdadbc179a6c3efd") console.log("*****************************************\n" + await Model.findOne({"authorId": new ObjectId("67f6b4546a73ece013915a74")}))
//                 result = await Model.findOne(findQuery);
//             } else { // FIND
//                 console.log(`runQuery: Executing find on ${modelName} | find=${JSON.stringify(findQuery)}, projection=${projection}`);
//                 result = await Model.find(findQuery);
//             }
//         }
//
//         // 4. Return the result
//         console.log("runQuery: Query execution successful. Result:", result);
//         return result;
//
//     } catch (error) {
//         console.error(`runQuery: Error executing query on ${modelName}:`, error);
//         // Return an error indicator or throw, based on desired error handling strategy
//         return { error: true, message: "Query execution failed", details: error.message };
//     }
// };


const runQuery = async (Query, outputs, TESTING_FLAG) => {

    /*
1. go through the value sources (inside connectors) and check if any of them are null in the outputs array
    1.1 if any are null, return null (we are waiting for them to finish)
2. loop through the input connectors
    (The following should have a maximum of 1 of each for each column)
    (The following could be done simultaneously using the type of the connector)
    2.1. find the finding connectors and create a mongoose find query
    2.2. find the updating connectors and create a mongoose update query
3. check if the query requires findOne or find, call the correct one
    3.1 check if the update query is empty
        3.1.1 if its empty, only call findOne/find
        3.1.2 if its not empty, call findOneAndUpdate/findAndUpdate
4. await the query and return it
*/

    // Check if query should be blocked by if conditions


    if(Query.conditionConnectors.length > 0){
        for (const connector of Query.conditionConnectors){
            const source = connector.valueSources[0]

            if(!outputs[source.index] || !outputs[source.index][source.sourceName]){
                console.log(`Skipping Query: ${JSON.stringify(Query)}`);
                return null;
            }
        }
    }

    // Check if all dependencies are fulfilled
    for (const connector of Query.inputConnectors) {
        for (const source of connector.valueSources) {

            if(source === null) continue;

            // Check if the index exists and the value at that index is not null/undefined
            if (source.index >= outputs.length || outputs[source.index] === null || outputs[source.index] === undefined) {
                console.log(`runQuery: Waiting for output dependency from index ${source.index}`);
                return null; // Indicate that the query cannot run yet due to missing dependency
            }
        }
    }

    let output = null

    if(Query.model) { // If Query has model, it wants to perform a crud operation
        output = CRUDQueryFlow(Query, outputs, TESTING_FLAG)
        return output;
    }

    switch (Query.type){
        case (QueryTypes.HASH):
            output = await hashFlow(Query, outputs)
            break;
        case (QueryTypes.TOKEN_PARSE):
            output = await TokenParseFlow(Query, outputs)
            break;
        case (QueryTypes.TOKEN_GENERATE):
            output = await TokenGenerateFlow(Query, outputs)
            break;
        case (QueryTypes.IF):
            output = await IfConditionFlow(Query, outputs)
            break;
    }

    // console.log(`Outputs: ${JSON.stringify(outputs)}`);

    return output;

}


const addToQuery = (source, operationQuery, outputs) => {
    if(operationQuery === null) operationQuery = {};
    operationQuery[source.name] = outputs[source.index][source.sourceName];

    // console.log("Adding query: " + operationQuery[source.name]);

    return operationQuery;
}


// Ensure the function is exported for use in other modules
export {runQuery};