import mongoose from "mongoose";
import ColumTypes from "../Data/ColumTypes.js";

// const sampleModel = {

//     "name": "Users",
//     "user": {
//         "$oid": "6714e58bd2fc1fb31ad4f019"
//     },
//     "colums": [
//         {
//             "_id": {
//                 "$oid": "6722126801294c58203d4f33"
//             },
//             "columName": 'namefirst',
//             "type": "string",
//             "isRequired": false,
//             "isArray": false,
//             "objectColums": []
//         },
//         {
//             "_id": {
//                 "$oid": "672894436cee8fc091ae640a"
//             },
//             "columName": "name",
//             "type": "string",
//             "isRequired": false,
//             "isArray": false,
//             "objectColums": []
//         },
//         {
//             "_id": {
//                 "$oid": "6728946e6cee8fc091ae6413"
//             },
//             "columName": "newCol",
//             "type": "string",
//             "isRequired": false,
//             "isArray": false,
//             "objectColums": []
//         },
//         {
//             "type": "object",
//             "columName": "objectColum",
//             "isArray": false,
//             "isRequired": false,
//             "objectColums": [
//                 {
//                     "type": "object",
//                     "isRequired": true,
//                     "columName": "firstCol",
//                     "isArray": false,
//                     "objectColums": [
//                         {
//                             "type": "object",
//                             "isRequired": true,
//                             "isArray": false,
//                             "columName": 'insidefirstcol'
//                         },
//                     ]

//                 },
//             ]
//         }
//     ]
// }

const parseSchema = (colums) => {
    const schemaDefinition = {};

    colums.forEach((colum) => {
        console.log(colum.type)
        let fieldType;

        if (colum.type === ColumTypes.OBJECT && colum.objectColums && colum.objectColums.length > 0) {
            let obj = parseSchema(colum.objectColums);
            if (colum.isArray) {
                schemaDefinition[colum.columName] = [obj]
            }
            else {
                schemaDefinition[colum.columName] = obj
            }
            return
        } else {
            switch (colum.type) {
                case ColumTypes.STRING:
                    fieldType = String;
                    break;
                case ColumTypes.NUMBER:
                    fieldType = Number;
                    break;
                case ColumTypes.BOOLEAN:
                    fieldType = Boolean;
                    break;
                case ColumTypes.DATE:
                    fieldType = Date;
                    break;
                case ColumTypes.OBJECT:
                    fieldType = Object
                    break;
                default:
                    console.log('throwing error because: ', colum.type)
                    throw new Error(`Unsupported column type: ${colum.type}`);
            }
        }

        if (colum.isArray) {
            fieldType = [fieldType];
        }

        schemaDefinition[colum.columName] = {
            type: fieldType,
            required: colum.isRequired,
        };
    });

    return schemaDefinition;
};

export default parseSchema