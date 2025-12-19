const { getDb } = require('../config/db');

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

async function getNextUserId(db) {
    const result = await db.collection('user')
        .aggregate([
            { $match: { _id: { $type: 'string', $regex: /^[0-9]+$/ } } },
            { $addFields: { n: { $toInt: '$_id' } } },
            { $sort: { n: -1 } },
            { $limit: 1 },
            { $project: { _id: 0, n: 1 } },
        ])
        .toArray();

    const last = result[0]?.n;
    const next = Number.isFinite(last) ? last + 1 : 1;
    return String(next);
}

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

    if (url.pathname === '/api/collections' && req.method === 'GET') {
        try {
            const userIdRaw = url.searchParams.get('userId');
            const query = userIdRaw ? { userId: String(userIdRaw) } : {};

            const collections = await db.collection('collections').find(query).toArray();

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(collections));
        } catch (error) {
            console.error('Error fetching collections:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to fetch collections' }));
        }
        return;
    }

    if (url.pathname === '/api/top-pairs' && req.method === 'GET') {
        try {
            const limit = parseInt(url.searchParams.get('limit') || '4', 10);
            
            const pairsCollections = await db.collection('collections').find({ type: 'pairs' }).toArray();
            
            const pairCounts = new Map();
            
            for (const col of pairsCollections) {
                const items = Array.isArray(col.items) ? col.items : [];
                for (let i = 0; i < items.length; i++) {
                    const headingId = String(items[i]?.fontId || '');
                    const bodyId = String(items[(i + 1) % items.length]?.fontId || '');
                    if (!headingId || !bodyId || headingId === bodyId) continue;
                    
                    const key = `${headingId}|${bodyId}`;
                    pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
                }
            }
            
            const sorted = [...pairCounts.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, limit);
            
            const topPairs = sorted.map(([key, count]) => {
                const [headingFontId, bodyFontId] = key.split('|');
                return { headingFontId, bodyFontId, count };
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(topPairs));
        } catch (error) {
            console.error('Error fetching top pairs:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to fetch top pairs' }));
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

    // LOGIN
    if (url.pathname === '/api/login' && req.method === 'POST') {
        try {
            const body = await parseBody(req);
            const { mail, password } = body;

            if (!mail || !password) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Email e password são obrigatórios' }));
                return;
            }

            const user = await db.collection('user').findOne({ mail, password });

            if (!user) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Credenciais inválidas' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                user: { 
                    _id: user._id, 
                    username: user.username, 
                    mail: user.mail 
                } 
            }));
        } catch (error) {
            console.error('Error during login:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Erro no servidor' }));
        }
        return;
    }

    if (url.pathname === '/api/register' && req.method === 'POST') {
        try {
            const body = await parseBody(req);
            const { username, mail, password } = body;

            if (!username || !mail || !password) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Username, email e password são obrigatórios' }));
                return;
            }

            const existingUser = await db.collection('user').findOne({ mail });

            if (existingUser) {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Email já registado' }));
                return;
            }

            const nextUserId = await getNextUserId(db);

            const newUser = {
                _id: nextUserId,
                username,
                mail,
                password,
                uploads: [],
                createdAt: new Date()
            };

            await db.collection('user').insertOne(newUser);

            try {
                const now = new Date();
                await db.collection('collections').insertMany([
                    {
                        userId: newUser._id,
                        name: 'Favourites',
                        type: 'fonts',
                        items: [],
                        createdAt: now,
                    },
                    {
                        userId: newUser._id,
                        name: 'pairs',
                        type: 'pairs',
                        items: [],
                        createdAt: now,
                    },
                ]);
            } catch (e) {
                await db.collection('collections').deleteMany({ userId: newUser._id });
                await db.collection('user').deleteOne({ _id: newUser._id });
                throw e;
            }

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                user: { 
                    _id: newUser._id,
                    username: newUser.username, 
                    mail: newUser.mail 
                } 
            }));
        } catch (error) {
            console.error('Error during registration:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Erro no servidor' }));
        }
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
}

module.exports = { handleApiRequest };
