import mongoose from 'mongoose';
import InputConnectorTypes from "../Data/InputConnectorTypes.js"; // Ensure this path is correct
import { buildMongooseQuery } from "./Helper Functions/MongooseQueryBuilder.js"; // Ensure this path is correct

const ObjectId = mongoose.Types.ObjectId;


const runQuery = async (Query, outputs) => {
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

    // 1. Check if all required inputs (value sources) are available in the outputs array
    for (const connector of Query.inputConnectors) {
        for (const source of connector.valueSources) {
            // Check if the index exists and the value at that index is not null/undefined
            if (source.index >= outputs.length || outputs[source.index] === null || outputs[source.index] === undefined) {
                console.log(`runQuery: Waiting for output dependency from index ${source.index}`);
                return null; // Indicate that the query cannot run yet due to missing dependency
            }
        }
    }

    // 2. Prepare find and update queries based on input connectors
    let findQuery = {};
    let updateQuery = {};
    let findOne = false; // Flag to determine if findOne or find/updateMany should be used

    for (const connector of Query.inputConnectors) {
        let value;
        // Simplified assumption: the first valueSource provides the necessary value.
        // This might need complex logic if multiple sources interact.
        if (connector.valueSources.length > 0) {
            const source = connector.valueSources[0];
            // Attempt to access the value from the dependency output based on source details
            // Adjust the access logic (e.g., outputs[source.index][source.name]) based on the actual structure of elements in 'outputs'
            value = outputs[source.index]?.[source.name] ?? outputs[source.index];

            if (value === undefined || value === null) {
                console.log(`runQuery: Value for '${source.name}' from output index ${source.index} is unavailable.`);
                return null; // Dependency value is unexpectedly not ready or missing
            }
        } else {
            console.log(`runQuery: Connector for column '${connector.column}' has no specified value sources.`);
            // Determine strategy: skip connector, use a default, or throw an error
            continue; // Skipping this connector
        }

        // Build find query parts
        if (connector.type === InputConnectorTypes.FIND || connector.type === InputConnectorTypes.FIND_ONE || connector.type === InputConnectorTypes.FIND_UPDATE) {
            if (!findQuery[connector.column]) {
                findQuery[connector.column] = {};
            }
            // Apply the specified operator and value
            findQuery[connector.column][connector.operator || '$eq'] = value; // Default to $eq if operator missing
            if(connector.type === InputConnectorTypes.FIND_ONE) {
                findOne = true; // Mark if any connector implies a single document operation
            }
        }

        // Build update query parts
        if (connector.type === InputConnectorTypes.UPDATE || connector.type === InputConnectorTypes.FIND_UPDATE) {
            // Typically updates use $set, adjust if other update operators are needed
            if (!updateQuery.$set) {
                updateQuery.$set = {};
            }
            console.log("colum set" + connector.column)
            console.log("type" + connector.type)
            updateQuery.$set[connector.column] = value;
        }
    }

    // 3. Execute the database query
    // Ensure Query.model holds a reference or name that can resolve to a Mongoose model
    // You might need to adjust how the model is retrieved, e.g., using project context
    const modelName = `${Query.model.name}-${Query.model.project}`; // Example: Construct model name if needed
    console.log("Model Name: " + modelName)
    const Model = await mongoose.model(modelName);
    let result;

    try {
        const isUpdateOperation = Object.keys(updateQuery).length > 0;
        // Select columns for find operations if specified
        const projection = Query.outputColumns && Query.outputColumns.length > 0 ? Query.outputColumns.join(' ') : null;

        if (isUpdateOperation) {
            const options = { new: true }; // Return the modified document
            if (findOne) { // FIND_UPDATE with findOne preference
                console.log(`runQuery: Executing findOneAndUpdate on ${modelName} | find=${JSON.stringify(findQuery)}, update=${JSON.stringify(updateQuery)}`);
                await Model.findOneAndUpdate(findQuery, updateQuery);
                result = await Model.findOne(findQuery, projection);
            } else { // FIND_UPDATE with find preference (implies updateMany)
                console.log(`runQuery: Executing updateMany on ${modelName} | find=${JSON.stringify(findQuery)}, update=${JSON.stringify(updateQuery)}`);
                // updateMany returns operation status, not the documents.
                console.log(findQuery)
                console.log(updateQuery)
                await Model.updateMany(findQuery, updateQuery);
                result = await Model.find(findQuery, projection);
                // Consider if you need to fetch the updated documents separately
            }
        } else { // Read-only operation
            if (findOne) { // FIND_ONE
                console.log(findQuery);

                // console.log(Model.schema)
                console.log(`runQuery: Executing findOne on ${modelName} | find=${JSON.stringify(findQuery)}, projection=${projection}`);
               // if(modelName === "Books-672ee48bcdadbc179a6c3efd") console.log("*****************************************\n" + await Model.findOne({"authorId": new ObjectId("67f6b4546a73ece013915a74")}))
                result = await Model.findOne(findQuery, projection);
            } else { // FIND
                console.log(`runQuery: Executing find on ${modelName} | find=${JSON.stringify(findQuery)}, projection=${projection}`);
                result = await Model.find(findQuery, projection);
            }
        }

        // 4. Return the result
        console.log("runQuery: Query execution successful. Result:", result);
        return result;

    } catch (error) {
        console.error(`runQuery: Error executing query on ${modelName}:`, error);
        // Return an error indicator or throw, based on desired error handling strategy
        return { error: true, message: "Query execution failed", details: error.message };
    }
};

// Ensure the function is exported for use in other modules
export default runQuery;