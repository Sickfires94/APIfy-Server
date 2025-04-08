


const runQuery = async (Query, outputs) => {
        /*

        1. go through the value sources (inside connectors) and check if any of them are null in the outputs array
            1.1 if any are null, return null (we are waiting for them to finish)
        2. loop through the input connectors
            (The following should have a maximum of 1 of each for each column)
            (The following could be done simultaneously using the type of the connector)
            2.1. find the finding connectors and create a mongoose find query
            2.2. find the updating connectors and create a mongoose update query
        3. check if the query requires findOne or find, call the correct one
            3.1 check if the update query is empty
                3.1.1 if its empty, only call findOne/find
                3.1.2 if its not empty, call findOneAndUpdate/findAndUpdate
        4. await the query and return it

         */
}