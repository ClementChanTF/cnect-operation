let { connectToDatabase } = require('./connect-to-database');
const _  = require ('lodash');
let queryTagsForParentCallback;

const {
    isOfSameLength,
    hasSingleElement,
    isEmpty,
    isInteger,
    isIdentical,
    getIntervalNode,
    processStartEndRange,
    processOverlapRange,
} = require('../buffer/proper')

const queryTagsForParentProductWithId = async (resolvedObject) => {

    let { db } = resolvedObject;
   
    // if (typeof product_id  === "undefined" && typeof options.product_id === "undefined") {
    //     return ( resolvedObject );
    // } 

    if (!isProductIdDefined(resolvedObject)) {
        return ( resolvedObject )
    }

    let product_id_match_term = `Products$${retrieveProductId(resolvedObject)}`;

    return new Promise((resolve, reject) => {
        // query tags with product ID
        return db.collection('Tags').aggregate([
            { $match : { _p_product : product_id_match_term } }
            ,{$unwind : "$codes"}
            ,{$lookup: { from: 'TagCodes', localField: 'codes.objectId' , foreignField: '_id', as: 'code_from_tagCodes' }}
            ,{$unwind : "$code_from_tagCodes" }
        ]).toArray((err, cursor) => {
    
            if (err) {
                return reject(error)
            }

            if (isEmpty(cursor))
                return reject(`error: product id ${retrieveProductId(resolvedObject)} not exists in database`);

            let linking_error = cursor.filter((tag,index) => {
                return tag.codes.objectId !== tag.code_from_tagCodes._id 
            })

            if (!isEmpty(linking_error)) 
                return reject (`error found linking error in joining tag and tagCodes documents`)
            
            let product_tags = {}
            product_tags.name = (typeof product_name === "undefined") ? 'not specified' : product_name;
            product_tags.id = product_id_match_term;
            product_tags.array = [...cursor]

            let newResolvedObject = {...resolvedObject, product_tags};
            return resolve(newResolvedObject);
 
        })
  
    });
  
}

const queryTagsForParentProductWithName = async (resolvedObject) => {

    let { parent_product, db, options } = resolvedObject;
    let { product_name } = options;
    
    if (typeof product_name === "undefined") {
        return (resolvedObject)
    }

    //let { type, payload } =  parent_product;

    return new Promise((resolve, reject) => {
        // translate product name into product_id, then query tags with product ID
        return db.collection('Products').find(  
             { name: product_name }
        ).toArray((err, cursor) => {

            if (err) {
                return reject(err);
            }
            if (isEmpty(cursor) || cursor[0].name !== product_name){
                return reject(`error: product name (${product_name}) not exists in database`);
            }

            if (!isEmpty(cursor) && !hasSingleElement(cursor)) {
                return reject(`error: more than 1 product is found with the same name`)
            }

            let newResolvedObject = {...resolvedObject, product_name, product_id : cursor[0]._id }
            return resolve(newResolvedObject)
        })
    });
}

const checkSplitBlockIsSubsetOfDatabase = async (resolvedObject) => {
    let { product_id, product_tags, properPairs, options } = resolvedObject;

    // if (typeof product_id  === "undefined" && typeof options.product_id === "undefined") {
    //     return ( resolvedObject );
    // } 

    if (!isProductIdDefined(resolvedObject)) {
        return ( resolvedObject );
    } 

    let productArray = product_tags.array.map((item, index) => {
        return item.code_from_tagCodes.code.trim();
    });
    let csvTagArray = properPairs.reduce( (accum, item, index) => {
        return [...accum, ...item.block]
    }, [])

    let intersection_set = _.intersection(productArray, csvTagArray);
    let inclusiveStatus = (intersection_set.length === csvTagArray.length);
    let difference = Math.abs(intersection_set.length - csvTagArray.length);
    let splitError = (inclusiveStatus) ? '' :  `(${difference}) Tag ID${difference > 1 ? 's' : ''} missing from the database`

    return new Promise( (resolve, reject ) => {
        return resolve({...resolvedObject, inclusiveStatus, splitError});
    }).catch(error => reject(error));
}

const validateParentProduct = async (resolvedObject) => {

    let { result, properPairs, options, db } = resolvedObject;
    let {product_name, product_id} = options;
    let parent_product = { type: null, payload: null};
    
    // if (typeof product_name === "undefined" 
    //     && typeof product_id === "undefined" ) {
    if (!isProductIdDefined(resolvedObject)) {
        //
        // short-circuit the entire chain because parent product info are not provided
        //
        Promise.resolve( { result, properPairs, options} );
    } 
    
    if (!product_name && !product_id) {
        // if both arguments present, id takes precedence
        parent_product['type'] = "_id";
        parent_product['payload'] = product_id;

    } else {
        // otherwise, one must be defined
        parent_product['type'] = (!product_name) 
                                 ? "_id" : "name";

        parent_product['payload'] = (!product_name)
                                ? product_id 
                                : product_name;
    }

    // integrate parent product
    resolvedObject = {...resolvedObject, parent_product};

    return connectToDatabase(resolvedObject)
           .then(queryTagsForParentProductWithName)
           .then(queryTagsForParentProductWithId)
           .then(checkSplitBlockIsSubsetOfDatabase)
        //    .catch(error => {
        //         Promise.reject (error);
        //    })
}

const isProductIdDefined = (resolvedObj) => {
    let { product_id, options } = resolvedObj;
    return (typeof product_id !== "undefined" || (typeof options.product_id  !== "undefined"))
}

const retrieveProductId = (resolvedObj) => {
    let { product_id, options } = resolvedObj;
    return (typeof product_id !== "undefined") ?  product_id :  options.product_id;
}

/*
 * simple test for product 
 */

// let { resolvedObject } = require('./resolved-object');
// validateParentProduct( resolvedObject)
// .then(r => {
//     debugger;
//     console.log(`the tag uids set in .csv file is a valid subset of the record of the product`);
// })
// .catch( error => {
//     console.log(error);
// })

module.exports = {
    validateParentProduct,
    isProductIdDefined,
    retrieveProductId,
}