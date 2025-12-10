const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:3000';
const client = new MongoClient(url);

let dbConnection;

async function connectToDb(cb) {
    try {
        await client.connect();
        dbConnection = client.db('data');
        console.log('Connected to MongoDB successfully');
        return cb();
    } catch (err) {
        console.error('MongoDB connection error:', err);
        return cb(err);
    }
}

function getDb() {
    if (!dbConnection) {
        throw new Error('Database not connected');
    }
    return dbConnection;
}

module.exports = { connectToDb, getDb };
