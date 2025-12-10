const { getDb } = require('../config/db');

async function handleApiRequest(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const db = getDb();

    if (url.pathname === '/api/fonts' && req.method === 'GET') {
        try {
            const fonts = await db.collection('fonts').find().toArray();
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(fonts));
        } catch (error) {
            console.error('Error fetching fonts:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to fetch fonts' }));
        }
        return;
    }

    if (url.pathname.startsWith('/api/fonts/') && req.method === 'GET') {
        const fontId = url.pathname.split('/')[3];
        
        try {
            const font = await db.collection('fonts').findOne({ _id: fontId });
            
            if (!font) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Font not found' }));
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(font));
        } catch (error) {
            console.error('Error fetching font:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to fetch font' }));
        }
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
}

module.exports = { handleApiRequest };
