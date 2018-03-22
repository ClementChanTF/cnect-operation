require('dotenv').config({ silent: true });
const MongoClient = require('mongodb').MongoClient;
const SERVER_URI = process.env.DATABASE_URI || 'mongodb://localhost:27017/thinfilm_dev';
const SOURCE_DB = process.env.SOURCE_DB || 'thinfilm_dev'; 

const connectToDatabase = async (resolvedObject) => {
    let { server, database } = resolvedObject;
    server = (typeof server !== "undefined") ? server :  SERVER_URI;
    database = (typeof database !== "undefined") ? database : SOURCE_DB

    return new Promise((resolve, reject) => {
       MongoClient.connect(server)
        .then((client)=>{
            let dbh = client.db(database)
            resolvedObject.db = dbh;
            return resolve(resolvedObject)
        })
        .catch(error =>{
            return reject(error);
        })
    });
}

module.exports = {
    connectToDatabase,
}