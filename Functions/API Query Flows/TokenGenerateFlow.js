const TokenGenerateFlow = async (Query, outputs) => {
    let data = {}

    for(const connector of Query.inputConnectors) {
        // Make a string of spaced values for easy debugging incase of multiple inputs
        data[connector.name] = outputs[connector.valueSources[0].index][connector.valueSources[0].index]
    }

    return jwt.sign(data, process.env.JWT_SECRET_KEY)
}

export default TokenGenerateFlow;