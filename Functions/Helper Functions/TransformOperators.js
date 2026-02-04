import ApiOperators from "../../Enums/ApiOperators.js";

export const transformOperators = (searchParams) => {

    for(let i = 0; i < searchParams.length; i++) {
        if(searchParams[i].operator)
            searchParams[i].operator = ApiOperators[searchParams[i].operator.toUpperCase()];
    }

    return searchParams;

    // return searchParams.map(param => {
    //     const originalOperator = param.operator;
    //     const newOperator = ApiOperators[originalOperator.toUpperCase()];
    //
    //     if (newOperator) {
    //         return { ...param, operator: newOperator };
    //     } else {
    //         console.warn(`Warning: Operator "${originalOperator}" not found in ApiOperators.`);
    //         return param; // Or handle the case where the operator is not found differently
    //     }
    // });
}

