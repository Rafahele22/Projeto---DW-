const { getDb } = require('../config/db');

async function routeApi(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const db = getDb();

    if (url.pathname === '/api/fonts' && req.method === 'GET') {
        try {
            const fonts = await db.collection('fonts').find().toArray();
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(fonts));
        } catch (error) {
            console.error(error);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Erro ao buscar dados' }));
        }
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'dont existe' }));
}

module.exports = { routeApi };