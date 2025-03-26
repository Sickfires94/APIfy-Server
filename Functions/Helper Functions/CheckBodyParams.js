export const checkParamsExist = (res, params) => {
    for (let i = 0; i < params.length; i++){
        if(!params[i]) return res.status(400).json({error: "Incomplete Request : " + params[i]}).end();
    }
}