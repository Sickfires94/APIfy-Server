export const buildMongooseQuery = (api, searchParams) => {
    let query = {};

    if (!api || !api.searchParams || !Array.isArray(api.searchParams)) {
        return query; // Or handle the error appropriately
    }

    for (const searchParam of api.searchParams) {
        if (searchParam && searchParam.column && searchParam.operator && searchParams.hasOwnProperty(searchParam.column)) {
            const columnName = searchParam.column;
            const operator = searchParam.operator;
            const value = searchParams[columnName];


            if (!query[columnName]) {
                query[columnName] = {};
            }
            query[columnName][operator] = value;
        } else {
            console.warn("Invalid search parameter encountered:", searchParam);
        }
    }
    return query;
};