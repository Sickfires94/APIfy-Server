import Models from "../../models/Model.js";
import mongoose from "mongoose";
import {query} from "express";
import QueryTypes from "../../Enums/QueryTypes.js";

const CrudQueryFlow = async (Query, outputs, TESTING_FLAG) => {

    // Get Model for Query
    const modelDef = await Models.findById(Query.model);
    const modelName = modelDef.name + "-" + modelDef.project;
    const model = await mongoose.model(modelName)


    if(!model) {
        console.log(`runQuery: Failed to find model with id ${query.id}`);
        return null;
    }

    let findQuery = null;
    let updateQuery = null;

    // MODIFY if updateOne or DeleteOne is implemented separately
    let findOne = (Query.type === QueryTypes.FIND_ONE); // Flag to determine if findOne or find/updateMany should be used
    let output = null;


    for (const connector of Query.inputConnectors) {
        if(connector.valueSources[0]) findQuery = addToQuery(connector.valueSources[0], findQuery, outputs);
        if(connector.valueSources[1]) updateQuery = addToQuery(connector.valueSources[1], updateQuery, outputs);
    }

    // console.log("Find Query: " + JSON.stringify(findQuery));
    // console.log("Update Query: " + JSON.stringify(updateQuery));
    // console.log("Find One: " + findOne)


    if(findOne) {
        if(updateQuery !== null) console.log("update result: " + JSON.stringify(await model.updateOne(findQuery, updateQuery)));
        output = await model.findOne(findQuery, {"_id": 0});
        if(!output) {
            output = {}
            for (const colum of modelDef.colums) {
                output[colum.columName] = null
            }
        }
        return output
    }

    output = {} // Make output an object instead of seperate fields
    if(Query.type !== QueryTypes.INSERT) output["output"]= await model.find(findQuery, {"_id": 0});

    switch (Query.type){
        case (QueryTypes.UPDATE):
            if(updateQuery !== null && !TESTING_FLAG)
                await model.updateMany(findQuery, updateQuery);
            break;

        case (QueryTypes.DELETE):
            if(findQuery !== null && !TESTING_FLAG)
                await model.deleteMany(findQuery, {"_id": 0});
            break;

        // case (QueryTypes.FIND_ALL):
        //     await model.find(findQuery, {"_id": 0});
        //     break;

        case (QueryTypes.INSERT):
            console.log("************ Running Insert **********************")
            // if(TESTING_FLAG) {
            //     output["output"] = updateQuery;
            //     return output;
            // }
            if(updateQuery !== null){
                output["output"] = new model(updateQuery);
                try{
                    await output["output"].save();
                }
                catch (e) {
                    output["output"] = e;
                }

        }
    }
    console.log(`output: ${JSON.stringify(output)}`);
    return output
}

const addToQuery = (source, operationQuery, outputs) => {
    if(operationQuery === null) operationQuery = {};
    // console.log(`sourceIndex: ${source.index} - sourceName: ${source.sourceName}`);
    // console.log("Outputs in CRUD: " + JSON.stringify(outputs));
    operationQuery[source.name] = outputs[source.index][source.sourceName];

    // console.log("Adding query: " + operationQuery[source.name]);

    return operationQuery;
}

export default CrudQueryFlow;