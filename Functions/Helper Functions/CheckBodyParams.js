export const checkParamsExist = (res, params) => {
    console.log(`Params = ${params} \nParams Length: ${params.length}`)
    for (let i = 0; i < params.length; i++){
        if(!params[i]){ 
            res.status(400).json({error: "Incomplete Request"});
            console.log("ending response: " + i + " : " + params[i])
            return false
        }
    }
    return true
} 