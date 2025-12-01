const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:3000'; 
const client = new MongoClient(url);

let dbConnection;

async function connectToDb(cb) {
    try {
        await client.connect();
        
        dbConnection = client.db('data'); 
        console.log(' Conectado ao MongoDB com sucesso!');
        return cb();
    } catch (err) {
        console.error('Erro ao conectar ao MongoDB:', err);
        return cb(err);
    }
}

function getDb() {
    return dbConnection;
}

module.exports = { connectToDb, getDb };