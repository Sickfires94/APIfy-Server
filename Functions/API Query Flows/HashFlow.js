import {hash} from "bcrypt";

const HashFlow = async (Query, outputs) => {

    console.log("Entered Hash flow")

    if(Query.inputConnectors.length === 0) return null

    let output = {}
    let value = "";

    for(const connector of Query.inputConnectors) {
        // Make a string of spaced values for easy debugging incase of multiple inputs
        value += outputs[connector.valueSources[0].index][connector.valueSources[0].index] + " "
    }

    output.hash = await hash(value, 5);
    return output;

}

export default HashFlow