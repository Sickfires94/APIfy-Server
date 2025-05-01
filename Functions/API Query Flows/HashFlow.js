import {hash} from "bcrypt";

import crypto from "crypto";

const HashFlow = async (Query, outputs) => {
    if(Query.inputConnectors.length === 0) return null

    let output = {}
    let value = "";

    for(const connector of Query.inputConnectors) {
        value += outputs[connector.valueSources[0].index][connector.valueSources[0].index] + " "
    }

    const hash = crypto.createHash('sha256');
    hash.update(value);
    output.hash = hash.digest('hex');


    return output;

}

export default HashFlow