const http = require('http');
const { connectToDb } = require('./config/db');
const { serveFile } = require('./utils/assets');
const { routeApi } = require('./utils/router');

const PORT = 4000; 

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    console.log(`Pedido: ${req.url}`);

    if (req.url.startsWith('/api')) {
        await routeApi(req, res);
    } else {
        serveFile(req, res);
    }
});

connectToDb((err) => {
    if (!err) {
        server.listen(PORT, () => {
            console.log(`work em http://localhost:${PORT}`);
        });
    }
});