const http = require('http');
const fs = require('fs');
const path = require('path');
const { connectToDb } = require('./config/db');
const { handleApiRequest } = require('./routes/api');

const PORT = 4000;

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log(`${req.method} ${req.url}`);

    if (req.url.startsWith('/api')) {
        await handleApiRequest(req, res);
        return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Not Found</h1>');
            } else {
                res.writeHead(500);
                res.end('Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

connectToDb((err) => {
    if (err) {
        console.error('Failed to connect to database:', err);
        process.exit(1);
    }
    
    server.listen(PORT, () => {
        console.log(`Server running on c`);
    });
});
