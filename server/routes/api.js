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

    // REGISTER
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

            const newUser = {
                username,
                mail,
                password,
                uploads: [],
                createdAt: new Date()
            };

            const result = await db.collection('user').insertOne(newUser);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                user: { 
                    _id: result.insertedId, 
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
