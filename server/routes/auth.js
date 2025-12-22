const { parseBody, sendJson, sendError, sendSuccess } = require('./utils');

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

async function handleAuthRoutes(req, res, url, db) {
    if (url.pathname === '/api/login' && req.method === 'POST') {
        try {
            const body = await parseBody(req);
            const { mail, password } = body;

            if (!mail || !password) {
                sendError(res, 400, 'Email e password são obrigatórios');
                return true;
            }

            const user = await db.collection('user').findOne({ mail, password });

            if (!user) {
                sendError(res, 401, 'Credenciais inválidas');
                return true;
            }

            sendJson(res, 200, { 
                success: true, 
                user: { 
                    _id: user._id, 
                    username: user.username, 
                    mail: user.mail 
                } 
            });
        } catch (error) {
            console.error('Error during login:', error);
            sendError(res, 500, 'Erro no servidor');
        }
        return true;
    }

    if (url.pathname === '/api/register' && req.method === 'POST') {
        try {
            const body = await parseBody(req);
            const { username, mail, password } = body;

            if (!username || !mail || !password) {
                sendError(res, 400, 'Username, email e password são obrigatórios');
                return true;
            }

            const existingUser = await db.collection('user').findOne({ mail });

            if (existingUser) {
                sendError(res, 409, 'Email já registado');
                return true;
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
                        userId: String(newUser._id),
                        name: 'Favourites',
                        type: 'fonts',
                        items: [],
                        createdAt: now,
                    },
                    {
                        userId: String(newUser._id),
                        name: 'Pairs',
                        type: 'pairs',
                        items: [],
                        createdAt: now,
                    },
                ]);
            } catch (e) {
                await db.collection('collections').deleteMany({ userId: String(newUser._id) });
                await db.collection('user').deleteOne({ _id: newUser._id });
                throw e;
            }

            sendJson(res, 201, { 
                success: true, 
                user: { 
                    _id: newUser._id,
                    username: newUser.username, 
                    mail: newUser.mail 
                } 
            });
        } catch (error) {
            console.error('Error during registration:', error);
            sendError(res, 500, 'Erro no servidor');
        }
        return true;
    }

    return false;
}

module.exports = { handleAuthRoutes };
