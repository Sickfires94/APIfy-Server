import checkIfCondition from "../Helper Functions/checkIfCondition.js";

const IfConditionFlow = async (Query, outputs) => {

    console.log("************** Entered If Condition Flow *************************")

    let output = {
        true: false,
        false: false,
    }


    let inputSource = Query.inputConnectors[0].valueSources[0]
    let input = outputs[inputSource.index][inputSource.sourceName]

    let comparator = Query.constant;
    if(!comparator){
        let comparatorSource = Query.inputConnectors[1].valueSources[0]
        comparator = outputs[comparatorSource.index][comparatorSource.sourceName]
    }

    if(checkIfCondition(input, comparator, Query.inputConnectors[1].operator)) output.true = true;
    else output.false = true;

    return output;
}

export default IfConditionFlow