const ApiBuilderParser = async (states) => {
    /*

    if this fails, set builderschema.valid == false

        1.convert the "table" (node/nodetype) nodes into and array of queries
            1.1. only have models and outputColumns initially
        2. go through the edges in each node and generate input connectors
            2.1. for offsets, use relative locations in the queries array
        3. map request and response params to the correct params (again use nodeType)
        4. save the config

    if successful, set builderschema.valid == true

     */
}