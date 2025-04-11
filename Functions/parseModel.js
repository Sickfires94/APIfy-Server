import mongoose, {Schema as schema} from "mongoose";
import ColumTypes from "../Data/ColumTypes.js";



const parseSchema = (colums) => {
    const schemaDefinition = {};

    colums.forEach((colum) => {
        let fieldType;

        // if (colum.type === ColumTypes.OBJECT && colum.objectColums && colum.objectColums.length > 0) {
        //     let obj = parseSchema(colum.objectColums);
        //     if (colum.isArray) {
        //         schemaDefinition[colum.columName] = [obj];
        //     } else {
        //         schemaDefinition[colum.columName] = obj;
        //     }
        //     return;
        // } else {
            console.log("column: " + colum)
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
                    console.log("reached")
                    fieldType = schema.Types.ObjectId;
                    break;
                case ColumTypes.ENUM:
                    fieldType = String;
                    break;
                default:
                    console.log('throwing error because: ', colum.type);
                    throw new Error(`Unsupported column type: ${colum.type}`);
            }
        // }

        if (colum.isArray) {
            fieldType = [fieldType];
        }

        // FIXED: Added const declaration
        const fieldOptions = {
            type: fieldType,
            required: colum.isRequired,
        };

        if (colum.type === ColumTypes.ENUM) {
            fieldOptions.enum = colum.objectColums;
        }

        if(colum.type === ColumTypes.OBJECT) {
            fieldOptions.ref = colum.objectColums[0]
        }

        schemaDefinition[colum.columName] = fieldOptions;
    });

    return schemaDefinition;
};

function printObjectDetails(obj) {
    if (typeof obj === 'object' && obj !== null) {
        console.log(JSON.stringify(obj, null, 2)); // Use JSON.stringify for formatted output
    } else {
        console.log(obj); // If it's not an object, just print it
    }
}

export default parseSchema;