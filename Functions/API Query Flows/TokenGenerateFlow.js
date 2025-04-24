import jwt from "jsonwebtoken";

const TokenGenerateFlow = async (Query, outputs) => {

    if(Query.inputConnectors.length === 0) return null

    let output = {}
    let data = {}

    for(const connector of Query.inputConnectors) {
        console.log(`Connector: ${JSON.stringify(connector)}`)
        data[connector.valueSources[0].name] = outputs[connector.valueSources[0].index][connector.valueSources[0].sourceName]
    }

    console.log(`Token Data: ${JSON.stringify(data)}`)

    output["Generate Token"] = jwt.sign(data, process.env.JWT_SECRET_KEY)
    return output
}

export default TokenGenerateFlow;