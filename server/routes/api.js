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
            const withFont = url.searchParams.get('withFont') || '';
            
            const pairsCollections = await db.collection('collections').find({ type: 'pairs' }).toArray();
            
            const pairCounts = new Map();
            
            for (const col of pairsCollections) {
                const items = Array.isArray(col.items) ? col.items : [];
                for (let i = 0; i < items.length - 1; i += 2) {
                    const headingItem = items[i];
                    const bodyItem = items[i + 1];
                    if (!headingItem || !bodyItem) continue;
                    
                    const headingId = String(headingItem.fontId || '');
                    const bodyId = String(bodyItem.fontId || '');
                    if (!headingId || !bodyId || headingId === bodyId) continue;
                    
                    if (withFont && headingId !== withFont && bodyId !== withFont) continue;
                    
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
                        userId: String(newUser._id),
                        name: 'Favourites',
                        type: 'fonts',
                        items: [],
                        createdAt: now,
                    },
                    {
                        userId: String(newUser._id),
                        name: 'pairs',
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

    if (url.pathname === '/api/collections' && req.method === 'POST') {
        try {
            const body = await parseBody(req);
            const { userId, name, type } = body;

            if (!userId || !name) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'userId and name are required' }));
                return;
            }

            const newCollection = {
                userId: String(userId),
                name: String(name),
                type: type || 'fonts',
                items: [],
                createdAt: new Date()
            };

            const result = await db.collection('collections').insertOne(newCollection);
            newCollection._id = result.insertedId;

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newCollection));
        } catch (error) {
            console.error('Error creating collection:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to create collection' }));
        }
        return;
    }

    const collectionsMatch = url.pathname.match(/^\/api\/collections\/([^\/]+)$/);
    if (collectionsMatch && req.method === 'DELETE') {
        try {
            const collectionId = collectionsMatch[1];
            const { ObjectId } = require('mongodb');
            
            let query;
            try {
                query = { _id: new ObjectId(collectionId) };
            } catch (e) {
                query = { _id: collectionId };
            }

            const collection = await db.collection('collections').findOne(query);
            
            if (!collection) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Collection not found' }));
                return;
            }

            if (collection.name === 'Favourites' || collection.name === 'pairs') {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Cannot delete system collections' }));
                return;
            }

            await db.collection('collections').deleteOne(query);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, deletedId: collectionId }));
        } catch (error) {
            console.error('Error deleting collection:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to delete collection' }));
        }
        return;
    }

    if (collectionsMatch && req.method === 'PUT') {
        try {
            const collectionId = collectionsMatch[1];
            const body = await parseBody(req);
            const { name } = body;
            const { ObjectId } = require('mongodb');

            if (!name || !name.trim()) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'name is required' }));
                return;
            }

            let query;
            try {
                query = { _id: new ObjectId(collectionId) };
            } catch (e) {
                query = { _id: collectionId };
            }

            const collection = await db.collection('collections').findOne(query);
            
            if (!collection) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Collection not found' }));
                return;
            }

            if (collection.name === 'Favourites' || collection.name === 'pairs') {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Cannot rename system collections' }));
                return;
            }

            await db.collection('collections').updateOne(query, { $set: { name: name.trim() } });
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, id: collectionId, name: name.trim() }));
        } catch (error) {
            console.error('Error renaming collection:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to rename collection' }));
        }
        return;
    }

    const fontInCollectionMatch = url.pathname.match(/^\/api\/collections\/([^\/]+)\/fonts\/([^\/]+)$/);
    if (fontInCollectionMatch && req.method === 'DELETE') {
        try {
            const collectionId = fontInCollectionMatch[1];
            const fontId = fontInCollectionMatch[2];
            const { ObjectId } = require('mongodb');

            let query;
            try {
                query = { _id: new ObjectId(collectionId) };
            } catch (e) {
                query = { _id: collectionId };
            }

            const collection = await db.collection('collections').findOne(query);
            
            if (!collection) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Collection not found' }));
                return;
            }

            await db.collection('collections').updateOne(
                query,
                { $pull: { items: { fontId: String(fontId) } } }
            );
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, collectionId, fontId }));
        } catch (error) {
            console.error('Error removing font from collection:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to remove font from collection' }));
        }
        return;
    }

    if (url.pathname === '/api/collections/toggle-font' && req.method === 'POST') {
        try {
            const body = await parseBody(req);
            const { userId, collectionName, fontId } = body;

            if (!userId || !collectionName || !fontId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'userId, collectionName and fontId are required' }));
                return;
            }

            let collection = await db.collection('collections').findOne({
                userId: String(userId),
                name: collectionName,
                type: 'fonts'
            });

            if (!collection) {
                const newCollection = {
                    userId: String(userId),
                    name: collectionName,
                    type: 'fonts',
                    items: [],
                    createdAt: new Date()
                };
                const result = await db.collection('collections').insertOne(newCollection);
                collection = { ...newCollection, _id: result.insertedId };
            }

            const items = Array.isArray(collection.items) ? collection.items : [];
            const fontIdStr = String(fontId);
            const exists = items.some(item => String(item.fontId) === fontIdStr);

            if (exists) {
                await db.collection('collections').updateOne(
                    { _id: collection._id },
                    { $pull: { items: { fontId: fontIdStr } } }
                );
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ added: false, fontId: fontIdStr, collectionName }));
            } else {
                await db.collection('collections').updateOne(
                    { _id: collection._id },
                    { $push: { items: { fontId: fontIdStr, addedAt: new Date() } } }
                );
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ added: true, fontId: fontIdStr, collectionName }));
            }
        } catch (error) {
            console.error('Error toggling font in collection:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to toggle font in collection' }));
        }
        return;
    }

    if (url.pathname === '/api/pairs/save' && req.method === 'POST') {
        try {
            const body = await parseBody(req);
            const { userId, headingFontId, bodyFontId } = body;

            if (!userId || !headingFontId || !bodyFontId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'userId, headingFontId and bodyFontId are required' }));
                return;
            }

            const userIdStr = String(userId);
            let pairsCollection = await db.collection('collections').findOne({
                userId: userIdStr,
                type: 'pairs'
            });

            if (!pairsCollection) {
                try {
                    const { ObjectId } = require('mongodb');
                    if (ObjectId.isValid(userId)) {
                        pairsCollection = await db.collection('collections').findOne({
                            userId: new ObjectId(userId),
                            type: 'pairs'
                        });
                        if (pairsCollection) {
                            await db.collection('collections').updateOne(
                                { _id: pairsCollection._id },
                                { $set: { userId: userIdStr } }
                            );
                            pairsCollection.userId = userIdStr;
                        }
                    }
                } catch (e) {}
            }

            if (!pairsCollection) {
                const newCollection = {
                    userId: userIdStr,
                    name: 'pairs',
                    type: 'pairs',
                    items: [],
                    createdAt: new Date()
                };
                const result = await db.collection('collections').insertOne(newCollection);
                pairsCollection = { ...newCollection, _id: result.insertedId };
            }

            const items = Array.isArray(pairsCollection.items) ? pairsCollection.items : [];
            const headingStr = String(headingFontId);
            const bodyStr = String(bodyFontId);
            
            const pairExists = items.some((item, idx) => {
                if (String(item.fontId) !== headingStr) return false;
                const nextItem = items[idx + 1];
                return nextItem && String(nextItem.fontId) === bodyStr;
            });

            if (pairExists) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ added: false, message: 'Pair already exists' }));
            } else {
                await db.collection('collections').updateOne(
                    { _id: pairsCollection._id },
                    { 
                        $push: { 
                            items: { 
                                $each: [
                                    { fontId: headingStr, role: 'heading', addedAt: new Date() },
                                    { fontId: bodyStr, role: 'body', addedAt: new Date() }
                                ]
                            } 
                        } 
                    }
                );
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ added: true, headingFontId: headingStr, bodyFontId: bodyStr }));
            }
        } catch (error) {
            console.error('Error saving pair:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to save pair' }));
        }
        return;
    }

    if (url.pathname === '/api/pairs/remove' && req.method === 'POST') {
        try {
            const body = await parseBody(req);
            const { userId, headingFontId, bodyFontId } = body;

            if (!userId || !headingFontId || !bodyFontId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'userId, headingFontId and bodyFontId are required' }));
                return;
            }

            const userIdStr = String(userId);
            let pairsCollection = await db.collection('collections').findOne({
                userId: userIdStr,
                type: 'pairs'
            });

            if (!pairsCollection) {
                try {
                    const { ObjectId } = require('mongodb');
                    if (ObjectId.isValid(userId)) {
                        pairsCollection = await db.collection('collections').findOne({
                            userId: new ObjectId(userId),
                            type: 'pairs'
                        });
                        if (pairsCollection) {
                            await db.collection('collections').updateOne(
                                { _id: pairsCollection._id },
                                { $set: { userId: userIdStr } }
                            );
                            pairsCollection.userId = userIdStr;
                        }
                    }
                } catch (e) {}
            }

            if (!pairsCollection) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Pairs collection not found' }));
                return;
            }

            const items = Array.isArray(pairsCollection.items) ? pairsCollection.items : [];
            const headingStr = String(headingFontId);
            const bodyStr = String(bodyFontId);
            
            const newItems = [];
            let i = 0;
            while (i < items.length) {
                const current = items[i];
                const next = items[i + 1];
                
                if (String(current.fontId) === headingStr && next && String(next.fontId) === bodyStr) {
                    i += 2;
                } else {
                    newItems.push(current);
                    i += 1;
                }
            }

            await db.collection('collections').updateOne(
                { _id: pairsCollection._id },
                { $set: { items: newItems } }
            );

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ removed: true, headingFontId: headingStr, bodyFontId: bodyStr }));
        } catch (error) {
            console.error('Error removing pair:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to remove pair' }));
        }
        return;
    }

    if (url.pathname === '/api/favorites/toggle' && req.method === 'POST') {
        try {
            const body = await parseBody(req);
            const { userId, fontId } = body;

            if (!userId || !fontId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'userId and fontId are required' }));
                return;
            }

            const favCollection = await db.collection('collections').findOne({
                userId: String(userId),
                name: 'Favourites',
                type: 'fonts'
            });

            if (!favCollection) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Favourites collection not found' }));
                return;
            }

            const items = Array.isArray(favCollection.items) ? favCollection.items : [];
            const fontIdStr = String(fontId);
            const exists = items.some(item => String(item.fontId) === fontIdStr);

            if (exists) {
                await db.collection('collections').updateOne(
                    { _id: favCollection._id },
                    { $pull: { items: { fontId: fontIdStr } } }
                );
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ added: false, fontId: fontIdStr }));
            } else {
                await db.collection('collections').updateOne(
                    { _id: favCollection._id },
                    { $push: { items: { fontId: fontIdStr, addedAt: new Date() } } }
                );
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ added: true, fontId: fontIdStr }));
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to toggle favorite' }));
        }
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
}

module.exports = { handleApiRequest };
