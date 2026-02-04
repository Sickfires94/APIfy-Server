import jwt from "jsonwebtoken";

const TokenParseFlow = (Query, outputs) => {

    if(Query.inputConnectors.length === 0) return null

    // Since there's only 1 token, so only 1 input Connector
    // Get Last one created, just in case of frontend error
    const inputConnector = Query.inputConnectors[Query.inputConnectors.length - 1];

    const token = outputs[inputConnector.valueSources[0].index][inputConnector.valueSources[0].sourceName]
    console.log(`Token: ${token}`)
    const output = jwt.verify(token, process.env.JWT_SECRET_KEY)
    console.log(`JWT Token Parsed: ${JSON.stringify(output)}`)
    // unpack and return
    return output

}

export default TokenParseFlow;