const { parseBody, sendJson, sendError } = require('./utils');

async function handleFavoritesRoutes(req, res, url, db) {
    if (url.pathname === '/api/favorites/toggle' && req.method === 'POST') {
        try {
            const body = await parseBody(req);
            const { userId, fontId } = body;

            if (!userId || !fontId) {
                sendError(res, 400, 'userId and fontId are required');
                return true;
            }

            const userIdStr = String(userId);
            const fontIdStr = String(fontId);

            let favCollection = await db.collection('collections').findOne({
                userId: userIdStr,
                name: 'Favourites',
                type: 'fonts'
            });

            if (!favCollection) {
                const newCollection = {
                    userId: userIdStr,
                    name: 'Favourites',
                    type: 'fonts',
                    items: [],
                    createdAt: new Date()
                };
                const result = await db.collection('collections').insertOne(newCollection);
                favCollection = { ...newCollection, _id: result.insertedId };
            }

            const items = Array.isArray(favCollection.items) ? favCollection.items : [];
            const exists = items.some(item => String(item.fontId) === fontIdStr);

            if (exists) {
                await db.collection('collections').updateOne(
                    { _id: favCollection._id },
                    { $pull: { items: { fontId: fontIdStr } } }
                );
                sendJson(res, 200, { added: false, fontId: fontIdStr });
            } else {
                await db.collection('collections').updateOne(
                    { _id: favCollection._id },
                    { $push: { items: { fontId: fontIdStr, addedAt: new Date() } } }
                );
                sendJson(res, 200, { added: true, fontId: fontIdStr });
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            sendError(res, 500, 'Failed to toggle favorite');
        }
        return true;
    }

    return false;
}

module.exports = { handleFavoritesRoutes };
