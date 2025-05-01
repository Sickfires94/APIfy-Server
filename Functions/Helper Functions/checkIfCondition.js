import ApiOperators from "../../Data/ApiOperators.js";

const checkIfCondition = (input, comparator, operator) => {
    console.log(`Operator: ${operator}`)
    switch (operator) {
        case ApiOperators.EQUALS:
            return input === comparator;
        case ApiOperators.GREATER:
            return input > comparator;
        case ApiOperators.GREATER_EQUAL:
            return input >= comparator;
        case ApiOperators.LESSER:
            return input < comparator;
        case ApiOperators.LESSER_EQUAL:
            return input <= comparator;
        case ApiOperators.LENGTH_EQUAL:
            if (typeof input === 'string' || Array.isArray(input)) {
                return input.length === comparator;
            }
        return false; // Or throw an error: throw new Error("Input must be a string or array for $lengthEqual");// Or throw an error
    }
};

export default checkIfCondition;