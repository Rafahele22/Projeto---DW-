const { parseBody, sendJson, sendError } = require('./utils');

async function handlePairsRoutes(req, res, url, db) {
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

            sendJson(res, 200, topPairs);
        } catch (error) {
            console.error('Error fetching top pairs:', error);
            sendError(res, 500, 'Failed to fetch top pairs');
        }
        return true;
    }

    if (url.pathname === '/api/pairs/save' && req.method === 'POST') {
        try {
            const body = await parseBody(req);
            const { userId, headingFontId, bodyFontId } = body;

            if (!userId || !headingFontId || !bodyFontId) {
                sendError(res, 400, 'userId, headingFontId and bodyFontId are required');
                return true;
            }

            const userIdStr = String(userId);
            let pairsCollection = await db.collection('collections').findOne({
                userId: userIdStr,
                type: 'pairs'
            });

            if (!pairsCollection) {
                const newCollection = {
                    userId: userIdStr,
                    name: 'Pairs',
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
            
            let pairExists = false;
            for (let i = 0; i < items.length - 1; i += 2) {
                if (String(items[i].fontId) === headingStr && String(items[i + 1].fontId) === bodyStr) {
                    pairExists = true;
                    break;
                }
            }

            if (pairExists) {
                sendJson(res, 200, { added: false, message: 'Pair already exists' });
            } else {
                await db.collection('collections').updateOne(
                    { _id: pairsCollection._id },
                    { 
                        $push: { 
                            items: { 
                                $each: [
                                    { fontId: headingStr, weight: 0 },
                                    { fontId: bodyStr, weight: 0 }
                                ]
                            } 
                        } 
                    }
                );
                sendJson(res, 200, { added: true, headingFontId: headingStr, bodyFontId: bodyStr });
            }
        } catch (error) {
            console.error('Error saving pair:', error);
            sendError(res, 500, 'Failed to save pair');
        }
        return true;
    }

    if (url.pathname === '/api/pairs/remove' && req.method === 'POST') {
        try {
            const body = await parseBody(req);
            const { userId, headingFontId, bodyFontId } = body;

            if (!userId || !headingFontId || !bodyFontId) {
                sendError(res, 400, 'userId, headingFontId and bodyFontId are required');
                return true;
            }

            const userIdStr = String(userId);
            const pairsCollection = await db.collection('collections').findOne({
                userId: userIdStr,
                type: 'pairs'
            });

            if (!pairsCollection) {
                sendError(res, 404, 'Pairs collection not found');
                return true;
            }

            const items = Array.isArray(pairsCollection.items) ? pairsCollection.items : [];
            const headingStr = String(headingFontId);
            const bodyStr = String(bodyFontId);
            
            const newItems = [];
            for (let i = 0; i < items.length; i += 2) {
                const heading = items[i];
                const body = items[i + 1];
                if (!heading || !body) continue;
                
                if (String(heading.fontId) === headingStr && String(body.fontId) === bodyStr) {
                    continue;
                }
                newItems.push(heading, body);
            }

            await db.collection('collections').updateOne(
                { _id: pairsCollection._id },
                { $set: { items: newItems } }
            );

            sendJson(res, 200, { removed: true, headingFontId: headingStr, bodyFontId: bodyStr });
        } catch (error) {
            console.error('Error removing pair:', error);
            sendError(res, 500, 'Failed to remove pair');
        }
        return true;
    }

    return false;
}

module.exports = { handlePairsRoutes };
