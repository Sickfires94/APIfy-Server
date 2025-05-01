
// Query Types decided by checking nodeType and Name (for functionNode2)

const QueryTypes = Object.freeze({
    FIND_ALL: "findAll",
    FIND_ONE: "findOne",
    DELETE: 'delete',
    INSERT: 'create',
    UPDATE: 'update',
    TOKEN_PARSE: 'tokenParse',
    TOKEN_GENERATE: 'tokenGenerate',
    HASH: 'hash',
    IF: 'if'
});

export default QueryTypes