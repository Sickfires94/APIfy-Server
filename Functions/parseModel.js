import mongoose from "mongoose";
import ColumTypes from "../Data/ColumTypes.js";



const parseSchema = (colums) => {
    const schemaDefinition = {};

    colums.forEach((colum) => {
        let fieldType;

        if (colum.type === ColumTypes.OBJECT && colum.objectColums && colum.objectColums.length > 0) {
            let obj = parseSchema(colum.objectColums);
            if (colum.isArray) {
                schemaDefinition[colum.columName] = [obj];
            } else {
                schemaDefinition[colum.columName] = obj;
            }
            return;
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
                    fieldType = Object;
                    break;
                case ColumTypes.ENUM:
                    fieldType = String;
                    break;
                default:
                    console.log('throwing error because: ', colum.type);
                    throw new Error(`Unsupported column type: ${colum.type}`);
            }
        }

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

        schemaDefinition[colum.columName] = fieldOptions;
    });

    return schemaDefinition;
};

export default parseSchema;