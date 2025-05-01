import ApiConfig from "../models/ApiConfig.js"; // Adjust path if needed
import ApiConfigs from "../models/ApiConfig.js";
import InputConnectorTypes from "../Data/InputConnectorTypes.js"; // Adjust path if needed
import mongoose from "mongoose";
import NodeTypes from "../Data/NodeTypes.js";
import nodeTypes from "../Data/NodeTypes.js";
import Models from "../models/Model.js";
import sourceTypes from "../Data/sourceTypes.js";
import QueryTypes from "../Data/QueryTypes.js";
import ApiTypes from "../Data/ApiTypes.js";
import FunctionTypes from "../Data/FunctionTypes.js";
import NodeFunctionNames from "../Data/FunctionTypes.js";
import ApiOperators from "../Data/ApiOperators.js";

//
// // Helper function to find a node by its ID within the nodes array
//     const findNodeById = (nodes, id) => nodes.find(n => n.id === id);
//
// // --- Placeholder Edge Parsing Logic ---
// // Adjust this function based on your actual edge identifier format.
// // Assumes format: "edge-sourceNodeId-targetNodeId-sourceHandle-targetHandle"
// // - sourceHandle: Represents the specific output name (column/param) from the source node.
// // - targetHandle: Represents the specific input name (column/param) on the target node.
//     const parseEdge = (edgeString) => {
//         const parts = edgeString.split('-');
//         // Expecting at least 5 parts: "edge", sourceId, targetId, sourceHandle, targetHandle
//         if (parts.length >= 5 && parts[0] === 'edge') {
//             return {
//                 sourceId: parts[1],
//                 targetId: parts[2],
//                 sourceHandle: parts[3],
//                 targetHandle: parts[4]
//             };
//         }
//         console.warn(`ApiBuilderParser: Could not parse edge string format: ${edgeString}`);
//         return null;
//     };
// // --- End Placeholder ---
//
//
//     /**
//      * Parses the node-based structure from ApiBuilder state into a functional ApiConfig.
//      * @param {object} builderState - The ApiBuilder document instance, containing nodes and apiConfig reference.
//      * @returns {Promise<{success: boolean, apiConfig?: object, error?: string}>} - Result object indicating success/failure.
//      */
//     const ApiBuilderParser = async (builderState) => {
//         /*
//         if this fails, set builderschema.valid == false
//
//             1. convert the "table" (node/nodetype) nodes into an array of queries
//                 1.1. only have models and outputColumns initially
//             2. go through the edges in each node and generate input connectors
//                 2.1. for offsets, use relative locations in the queries array
//             3. map request and response params to the correct params (again use nodeType)
//             4. save the config
//
//         if successful, set builderschema.valid == true
//         */
//
//         // Ensure builderState and nodes are provided
//         if (!builderState || !builderState.nodes || !builderState.apiConfig) {
//             console.error("ApiBuilderParser: Invalid builderState provided.");
//             // Optionally update validity if builderState object exists but is incomplete
//             if (builderState) {
//                 builderState.valid = false;
//                 await builderState.save().catch(e => console.error("Failed to save invalid builder state", e));
//             }
//             return { success: false, error: "Invalid or incomplete builder state provided." };
//         }
//
//         const { nodes, apiConfig: apiConfigId } = builderState;
//         const apiConfig = await ApiConfig.findById(apiConfigId);
//
//         if (!apiConfig) {
//             console.error("ApiBuilderParser: Could not find ApiConfig with ID:", apiConfigId);
//             builderState.valid = false;
//             await builderState.save().catch(e => console.error("Failed to save builder state for missing ApiConfig", e));
//             return { success: false, error: "Associated ApiConfig not found." };
//         }
//
//         // Initialize structures to build the new config parts
//         let generatedQueries = [];
//         let generatedRequestParams = [];
//         let generatedResponseParams = [];
//         let queryNodeMap = new Map(); // Maps query node ID to its index in generatedQueries
//
//         try {
//             console.log(`ApiBuilderParser: Starting parsing for ApiConfig ID: ${apiConfigId}`);
//             // --- Step 1 & Part of 3: Identify nodes and initialize basic structures ---
//
//             // Find Request Params Node and extract expected parameters
//             const requestNode = nodes.find(n => n.nodeType === 'requestParams');
//             if (requestNode?.configuration?.outputColumns) {
//                 generatedRequestParams = requestNode.configuration.outputColumns.map(colName => ({
//                     name: colName,
//                     // Assumption: Type information might be stored alongside outputColumns or needs default/lookup
//                     type: requestNode.configuration?.paramTypes?.[colName] || 'string',
//                     index: 0 // Request params are always source index 0 for runApi's outputs array
//                 }));
//                 console.log("ApiBuilderParser: Found request params:", generatedRequestParams.map(p => p.name));
//             } else {
//                 console.log("ApiBuilderParser: No 'requestParams' node with outputColumns found.");
//             }
//
//             // Find Query Nodes (e.g., type 'table'), map them, and store their index
//             let queryIndex = 0;
//             nodes.forEach(node => {
//                 // Assumption: 'table' nodeType represents a database query step. Adjust if different.
//                 if (node.nodeType === 'table' && node.configuration) {
//                     const modelObjectId = node.configuration.modelId ? new mongoose.Types.ObjectId(node.configuration.modelId) : null;
//                     if (!modelObjectId) {
//                         throw new Error(`Node ${node.id} (type 'table') is missing required 'modelId' in configuration.`);
//                     }
//
//                     const query = {
//                         model: modelObjectId, // Store as ObjectId
//                         inputConnectors: [], // To be populated later by edge processing
//                         outputColumns: node.configuration.outputColumns || [] // Get outputs from config
//                     };
//                     generatedQueries.push(query);
//                     queryNodeMap.set(node.id, queryIndex); // Store mapping: node.id -> index in generatedQueries
//                     console.log(`ApiBuilderParser: Mapped node ${node.id} (type 'table') to query index ${queryIndex}`);
//                     queryIndex++;
//                 }
//             });
//
//             // --- Step 2: Process Edges to create Input Connectors ---
//             console.log("ApiBuilderParser: Processing edges to create input connectors...");
//             for (const node of nodes) { // Iterate through all nodes to find edges
//                 if (node.edges && node.edges.length > 0) {
//                     for (const edgeString of node.edges) {
//                         const edgeInfo = parseEdge(edgeString); // Get source/target IDs and handles
//                         if (!edgeInfo) continue; // Skip if edge string is invalid
//
//                         const targetNode = findNodeById(nodes, edgeInfo.targetId);
//                         const sourceNode = findNodeById(nodes, edgeInfo.sourceId);
//
//                         // Focus on edges connecting *to* query ('table') nodes
//                         if (targetNode && targetNode.nodeType === 'table') {
//                             const targetQueryIndex = queryNodeMap.get(targetNode.id);
//                             // Ensure target is a mapped query node
//                             if (targetQueryIndex === undefined) continue;
//
//                             const targetQuery = generatedQueries[targetQueryIndex];
//                             let sourceIndexInOutputs = -1; // Index in runApi's conceptual outputs array
//                             let sourceParamName = '';     // Name of the output column/param from the source
//
//                             // Determine source index and name based on source node type
//                             if (sourceNode.nodeType === 'requestParams') {
//                                 sourceIndexInOutputs = 0;
//                                 sourceParamName = edgeInfo.sourceHandle; // Assumes handle = param name
//                                 // Validate against defined request params
//                                 if (!generatedRequestParams.some(p => p.name === sourceParamName)) {
//                                     console.warn(`ApiBuilderParser: Edge (${edgeString}): Source handle '${sourceParamName}' not found in defined request params.`);
//                                     continue; // Skip edge if source param doesn't exist
//                                 }
//                             } else if (sourceNode.nodeType === 'table') {
//                                 const sourceQueryIndex = queryNodeMap.get(sourceNode.id);
//                                 if (sourceQueryIndex === undefined) continue; // Source node isn't a mapped query
//                                 sourceIndexInOutputs = sourceQueryIndex + 1; // Query outputs start at index 1
//                                 sourceParamName = edgeInfo.sourceHandle; // Assumes handle = output column name
//                                 // Validate sourceParamName against the source query's outputColumns
//                                 const sourceQueryConfig = generatedQueries[sourceQueryIndex];
//                                 if (!sourceQueryConfig.outputColumns.includes(sourceParamName)) {
//                                     console.warn(`ApiBuilderParser: Edge (${edgeString}): Source handle '${sourceParamName}' not found in output columns of source query node ${sourceNode.id}.`);
//                                     continue;
//                                 }
//                             } else {
//                                 // Skip edges originating from non-data source nodes (like 'responseNode')
//                                 continue;
//                             }
//
//                             // Determine target column and connector details
//                             // Assumes target handle = target column name
//                             const targetColumnName = edgeInfo.targetHandle;
//
//                             // *** CRITICAL: Determine connector type and operator ***
//                             // This logic MUST be adapted based on your UI/node configuration.
//                             // Example: Read from target node's config or infer from handle/edge type.
//                             let connectorType = targetNode.configuration?.queryType || InputConnectorTypes.FIND; // Default or from config
//                             let operator = targetNode.configuration?.operator || '$eq'; // Default or from config
//
//                             // Placeholder: Check if target handle indicates an update operation
//                             // e.g., if target handle is "SET-fieldName"
//                             if (targetColumnName.toUpperCase().startsWith('SET-')) {
//                                 // Adjust type and extract actual column name
//                                 connectorType = InputConnectorTypes.UPDATE; // Or FIND_UPDATE if finding first is intended
//                                 // targetColumnName = targetColumnName.substring(4); // Remove "SET-" prefix
//                                 console.warn(`ApiBuilderParser: Edge (${edgeString}): Target handle '${edgeInfo.targetHandle}' suggests an update. Type/Operator logic needs verification.`);
//                             }
//                             // *** End Critical Section ***
//
//                             // Create the input connector
//                             const inputConnector = {
//                                 valueSources: [{
//                                     name: sourceParamName, // Specific output name from source
//                                     index: sourceIndexInOutputs // Index in runApi's outputs array
//                                     // 'type' of source value might be needed? Assumed handled by Mongoose for now.
//                                 }],
//                                 column: targetColumnName, // Target column in the target query's model
//                                 operator: operator,       // Mongoose operator (e.g., '$eq', '$gt')
//                                 type: connectorType       // Connector purpose (FIND, UPDATE, FIND_ONE, FIND_UPDATE)
//                             };
//
//                             targetQuery.inputConnectors.push(inputConnector);
//                             console.log(`ApiBuilderParser: Created connector for edge ${edgeString} targetting query ${targetQueryIndex}`);
//                         }
//                     }
//                 }
//             }
//
//
//             // --- Step 3 (Response Params): Find response node and map its inputs ---
//             console.log("ApiBuilderParser: Processing response node inputs...");
//             const responseNode = nodes.find(n => n.nodeType === 'responseNode');
//             if (responseNode) {
//                 // Find all edges terminating at the response node
//                 for (const node of nodes) { // Check every node as a potential source
//                     if (node.edges && node.edges.length > 0) {
//                         for (const edgeString of node.edges) {
//                             const edgeInfo = parseEdge(edgeString);
//                             // Ensure edge is valid and targets the response node
//                             if (!edgeInfo || edgeInfo.targetId !== responseNode.id) continue;
//
//                             const sourceNode = findNodeById(nodes, edgeInfo.sourceId);
//                             let sourceIndexInOutputs = -1;
//                             let sourceParamName = '';
//
//                             // Determine source index/name (similar logic to input connectors)
//                             if (sourceNode.nodeType === 'requestParams') {
//                                 sourceIndexInOutputs = 0;
//                                 sourceParamName = edgeInfo.sourceHandle;
//                                 if (!generatedRequestParams.some(p => p.name === sourceParamName)) continue;
//                             } else if (sourceNode.nodeType === 'table') {
//                                 const sourceQueryIndex = queryNodeMap.get(sourceNode.id);
//                                 if (sourceQueryIndex === undefined) continue;
//                                 sourceIndexInOutputs = sourceQueryIndex + 1;
//                                 sourceParamName = edgeInfo.sourceHandle;
//                                 const sourceQueryConfig = generatedQueries[sourceQueryIndex];
//                                 if (!sourceQueryConfig.outputColumns.includes(sourceParamName)) continue;
//                             } else {
//                                 continue; // Skip edges from unknown/non-data source types
//                             }
//
//                             // Assumption: Target handle on response node maps to the final output JSON key
//                             const responseKeyName = edgeInfo.targetHandle;
//
//                             generatedResponseParams.push({
//                                 name: responseKeyName, // Name in the final API response JSON
//                                 // 'type' might be derived from source or schema lookup? Defaulting for now.
//                                 // type: 'string',
//                                 index: sourceIndexInOutputs, // Index in runApi outputs providing the value
//                                 // It's ambiguous here if 'name' should refer to the sourceParamName or the responseKeyName.
//                                 // Assuming 'name' here is for the final JSON key, and runApi uses the index + sourceParamName.
//                             });
//                             console.log(`ApiBuilderParser: Mapped edge ${edgeString} to response parameter '${responseKeyName}' from output index ${sourceIndexInOutputs}`);
//                         }
//                     }
//                 }
//                 console.log("ApiBuilderParser: Generated response params:", generatedResponseParams.map(p => p.name));
//             } else {
//                 console.log("ApiBuilderParser: No 'responseNode' found.");
//             }
//
//
//             // --- Step 4: Update and Save the ApiConfig ---
//             apiConfig.queries = generatedQueries;
//             apiConfig.requestParams = generatedRequestParams;
//             apiConfig.responseParams = generatedResponseParams;
//             // Explicitly mark paths as modified for Mongoose if using complex nested structures
//             apiConfig.markModified('queries');
//             apiConfig.markModified('requestParams');
//             apiConfig.markModified('responseParams');
//
//             await apiConfig.save();
//             console.log(`ApiBuilderParser: Successfully updated and saved ApiConfig ID: ${apiConfigId}`);
//
//             // Update builder state validity
//             builderState.valid = true;
//             await builderState.save();
//             console.log(`ApiBuilderParser: Marked builderState as valid.`);
//
//             return { success: true, apiConfig: apiConfig.toObject() }; // Return plain object
//
//         } catch (error) {
//             console.error("ApiBuilderParser: CRITICAL ERROR during parsing:", error);
//             // Attempt to mark builder state as invalid on error
//             try {
//                 builderState.valid = false;
//                 await builderState.save();
//                 console.log(`ApiBuilderParser: Marked builderState as invalid due to error.`);
//             } catch (saveError) {
//                 console.error("ApiBuilderParser: Failed to save builder state after parse error:", saveError);
//             }
//             return { success: false, error: error.message || "An unknown error occurred during parsing." };
//         }
//     };


    const ApiBuilderParser = async (apiConfig, nodes) => {
        /*

    if this fails, set builderschema.valid == false and apiConfig.deployed == false

        1.convert the "table" (node/nodetype) nodes into an array of queries
            1.1. only have models and outputColumns initially
        2. go through the edges in each node and generate input connectors
            2.1. for input index, use locations in the queries array + 1
        3. map request and response params to the correct params (again use nodeType)
        4. save the config

    if successful, set builderschema.valid == true

     */

        let valid = true;
        let error = ""

        const api = await ApiConfigs.findById(apiConfig)
        if(!api) {
            valid = false;
            error += "Api Config Not Found\n"
        }

        // Initialize map to map edges for fast indexing
        let map = new Map();


        // Get Request Node
        let requestParams = []
        let requestNode = nodes[0]

        // Parse Request Node
        if(!(requestNode.nodeType === "requestParams")) {
            valid = false;
            error += "Request Instance type not correct\n"
        }

        for (const param of requestNode.children) {
            let reqParam = {}
            reqParam.name = param.name;
            reqParam.type = param.type;

            map.set(param.id, {index: 0, name: param.name});

            requestParams.push(reqParam);
        }




        // Generate initial queries (only populate models and output Columns)
        let queries = []
        let offset = 1;

        // Initialize list to dump all possible Responses into
        let responses = [];

        for(let i = offset; i < nodes.length; i++){
            let query = {}
            let node = nodes[i]
            query.outputColumns = []

            switch (node.nodeType) {
                case NodeTypes.TABLE_NODE:
                    console.log("Found Table node")
                    const model = await Models.findOne({project: api.project, name: node.name})
                    query.model = model._id;


                    console.log(`${node.name} : ${node.configuration.queryType}`);

                    switch (node.configuration.queryType) {
                        case(QueryTypes.FIND_ONE):
                            for (const output of node.children) {
                                if(output.nodeType === nodeTypes.TABLE_OUTPUT) continue;
                                query.outputColumns.push(output.name);
                            }
                            break;
                        case (QueryTypes.FIND_ALL):
                            query.outputColumns.push(node.name);
                            break;
                    }
                    break;



                case NodeTypes.FUNCTION_NODE_DIAMOND:
                    query.outputColumns.push("output")
                    break;

                case NodeTypes.FUNCTION_NODE_TABLE:
                    for(let i = 1; i < node.children.length; i++){ // Start from 1 to account for the input child at index 0
                        query.outputColumns.push(node.children[i].name)
                }

            }


            // The Following is not optimal but easier to work with in case of different node types
            // Mapping Node Children for future reference
            for (const child of node.children) {
                await map.set(child.id, {index: i, name: child.name});
            }

            // Mapping Node name for possible reference
            await map.set(node.id, {index: i, name: node.name});

            queries.push(query);
        }

        // Print Created Maps
        // Only Leave Uncommented when debugging
        printMap(map)


        for(let i = offset; i < nodes.length; i++){
            let connectors = [];
            let conditionConnectors = [];
            switch(nodes[i].nodeType){


                // Nodes where Edges are connected to children
                case(NodeTypes.RESPONSE_NODE):{
                    let response = {}
                    response.params = []

                    // Store If activation edges (They are stored in the node itself, not the children)
                    for(const edge of nodes[i].edgesFrom){
                        let connector = {}
                        connector.valueSources = [null, null]
                        let source = {}

                        source.index = await map.get(edge.id).index;
                        source.sourceName = await map.get(edge.id).name;
                        source.name = source.sourceName;

                        connector.valueSources[0] = source;
                        console.log(`Connector: ${JSON.stringify(connector)}`);
                        conditionConnectors.push(connector);
                    }

                    response.conditionConnectors = conditionConnectors;

                    for(const child of nodes[i].children) {
                        let source = {}

                        if(!child.edgesFrom[0]) continue;

                        console.log(`Response child: ${JSON.stringify(child)}`);

                        const edge = await map.get(child.edgesFrom[0].id)
                        console.log("****************************************")
                        console.log(`Edge: ${JSON.stringify(edge)}`);
                        source.name = child.name;
                        source.index = edge.index;
                        source.sourceName = edge.name;
                        source.type = child.type;

                        response.params.push(source)
                    }
                    console.log(`Response: ${JSON.stringify(response)}`);
                    responses.push(response);
                    console.log(`Responses List: ${JSON.stringify(responses)}`);
                 break;
                }

                case(NodeTypes.LOGIC_NODE): {
                    // Input at index 0
                    {

                        let connector = {}
                        connector.valueSources = [null, null]
                        const edge = nodes[i].children[0].edgesFrom[0] // Get the "ONLY" edge from child 0
                        if(!edge) continue;
                        let source = {}
                        source.name = await map.get(edge.id).name;
                        source.sourceName = source.name;
                        source.index = await map.get(edge.id).index

                        connector.valueSources[0] = source;
                        connectors.push(connector);
                    }


                    // Comparator at index 1 if it exists
                    {
                        let connector = {}
                        connector.valueSources = [null, null]


                        // Check if its a dynamic value or constant value
                        if(nodes[i].children[1].edgesFrom.length > 0){
                            const edge = nodes[i].children[1].edgesFrom[0];
                            let source = {}
                            source.name = await map.get(edge.id).name
                            source.sourceName = source.name;
                            source.index = await map.get(edge.id).index

                            connector.valueSources[0] = source;

                        }
                        else {
                            let constant = {}
                            constant.value = nodes[i].children[1].value
                            constant.type = nodes[i].children[1].type;
                            queries[i - offset].constant = constant;
                        }


                        connector.operator = ApiOperators[nodes[i].comparision.toUpperCase()];
                        console.log(`Connector: ${JSON.stringify(connector)}`);
                        console.log(`Connector-Operator: ${nodes[i].comparision}`);
                        connectors.push(connector);
                    }
                    break;
                }

                case(NodeTypes.TABLE_NODE): case(NodeTypes.FUNCTION_NODE_TABLE): {
                    // Store If activation edges (They are stored in the node itself, not the children)
                    for(const edge of nodes[i].edgesFrom){
                        let connector = {};

                        let source = {}
                        connector.valueSources = [null, null]

                        // source.type = column.type;
                        source.index = await map.get(edge.id).index;
                        source.sourceName = await map.get(edge.id).name;
                        source.name = source.sourceName;

                        connector.valueSources[0] = source;

                        conditionConnectors.push(connector);
                    }

                    queries[i - offset].conditionConnectors = conditionConnectors;


                    // Store Children Edges for dependencies
                    for (const column of nodes[i].children) {
                        if (!column.edgesFrom || column.edgesFrom.length === 0) continue;
                        let connector = {}
                        let valueSources = [null, null]

                        for (const edge of column.edgesFrom) {
                            let source = {}
                            source.name = column.name;
                            // source.type = column.type;
                            source.index = await map.get(edge.id).index;
                            source.sourceName = await map.get(edge.id).name;
                            switch (edge.type) {
                                case (sourceTypes.FIND):
                                case (sourceTypes.INPUT): {
                                    valueSources[0] = source;
                                    connector.operator = ApiTypes[edge.operator];
                                    break;
                                }

                                case (sourceTypes.UPDATE):
                                case (sourceTypes.INSERT): {
                                    valueSources[1] = source;
                                    break;
                                }

                                default: {
                                    valid = false;
                                    error += `edge type invalid: ${edge.type} \n`

                                }
                            }
                        }
                        connector.valueSources = valueSources;
                        connector.column = column.name;
                        connectors.push(connector);
                    }
                    break;
                }


                // Nodes where edges are connected to the node itself
                case(NodeTypes.FUNCTION_NODE_DIAMOND): {
                    for (const edge of nodes[i].edgesFrom) {
                        let connector = {}
                        let valueSources = [null, null]

                        console.log(`Edge: ${JSON.stringify(edge)}`)

                        let source = {}
                        source.name = await map.get(edge.id).name;
                        connector.name = source.name;
                        // source.type = column.type;
                        source.index = await map.get(edge.id).index;
                        source.sourceName = await map.get(edge.id).name;
                        valueSources[0] = source;
                        connector.operator = ApiTypes[edge.operator];
                        connector.valueSources = valueSources;

                        console.log(`Connector Created: ${JSON.stringify(connector)}`)

                        connectors.push(connector);
                    }
                    break;
                }

                default: {
                    console.log("Node Type not implemented yet")
                }

            }
            if(nodes[i].type !== NodeTypes.RESPONSE_PARAMS)
                queries[i - offset].inputConnectors = connectors;

            switch (nodes[i].nodeType){
                case(NodeTypes.TABLE_NODE):
                    queries[i - offset].type = nodes[i].configuration.queryType;
                    break;
                case(NodeTypes.FUNCTION_NODE_TABLE): case(NodeTypes.FUNCTION_NODE_DIAMOND):
                    queries[i - offset].type = QueryTypes[getEnumKeyByValue(NodeFunctionNames,nodes[i].name)];
                    break;
                case(NodeTypes.LOGIC_NODE):
                    queries[i - offset].type = QueryTypes.IF;
                    break;
                default:
                    console.log(`Invalid Node Type for ${nodes[i].name} : ${nodes[i].nodeType}`)

            }
            // Enable and modify the following line if findOne is not just 1 queryType
            // queries[i - 2].findOne = nodes[i].configuration.queryType === InputConnectorTypes.FIND_ONE
        }

        console.log("valid: " + valid + ", " + error)
        if(valid) {

            api.requestParams = requestParams;
            api.responses = responses;
            api.queries = queries;


            await api.save()
            console.log("Api Config Saved/Updated ")
        }

        return {valid: valid, error: error};
    }

    const printMap = (map) => {
        const keys = Array.from(map.keys()); // Convert keys to an array
        for (const key of keys) {
            const value = map.get(key);
            console.log(`Key: ${key}, Value: ${JSON.stringify(value)}`);
        }
    }

function getEnumKeyByValue(Enum, value) {
    return Object.keys(Enum).find(key => Enum[key] === value);
}

// Make sure to export the function
 export default ApiBuilderParser;
