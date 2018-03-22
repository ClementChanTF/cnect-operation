let { connectToDatabase } = require('./connect-to-database')

const getSamSungTags = async (resolvedObject) => {

    let { db } = resolvedObject;

    return new Promise((resolve, reject) => {   
        let collection = db.collection('Tags');
        return collection.aggregate([
            { $match : { _p_product : 'Products$349cdb9434726c34671e' } }
            ,{$unwind : "$codes"}
            ,{$lookup: { from: 'TagCodes', localField: 'codes.objectId' , foreignField: '_id', as: 'code_from_tagCodes' }}
            ,{$unwind : "$code_from_tagCodes" }
            // ,{$project : { "_id" : 0, "code_from_tagCodes.code" : 1} }
            ])
            .toArray((err, cursor) => {
                // console.log()

                let linking_error = cursor.filter((item, index) => {
                    return item.codes.objectId !== item.code_from_tagCodes._id;
                })

                return resolve(cursor)
            })
    })
}


connectToDatabase({})
.then(getSamSungTags)
.then(r => {
    // console.log(r)
    r.forEach((item, index) => {
        console.log(item.code_from_tagCodes.code);
    })
    process.exit(0)
})
.catch(error => {
    console.log(error)
    process.exit(-1)
})


