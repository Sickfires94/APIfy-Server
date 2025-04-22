import jwt from "jsonwebtoken";

const TokenParseFlow = (Query, outputs) => {
    // Since there's only 1 token, so only 1 input Connector
    // Get Last one created, just in case of frontend error
    const inputConnector = Query.inputConnectors[Query.inputConnectors.length - 1];
    const token = outputs[inputConnector.valueSources[0].index][inputConnector.valueSources[0].index]

    // unpack and return
    return jwt.verify(token.split(" ")[1], process.env.JWT_SECRET_KEY)

}

export default TokenParseFlow;