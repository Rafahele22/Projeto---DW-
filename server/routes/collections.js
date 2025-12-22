const { parseBody, buildIdQuery, sendJson, sendError, sendSuccess } = require('./utils');

async function handleCollectionsRoutes(req, res, url, db) {
    if (url.pathname === '/api/collections' && req.method === 'GET') {
        try {
            const userIdRaw = url.searchParams.get('userId');
            const query = userIdRaw ? { userId: String(userIdRaw) } : {};

            const collections = await db.collection('collections').find(query).toArray();

            sendJson(res, 200, collections);
        } catch (error) {
            console.error('Error fetching collections:', error);
            sendError(res, 500, 'Failed to fetch collections');
        }
        return true;
    }

    if (url.pathname === '/api/collections' && req.method === 'POST') {
        try {
            const body = await parseBody(req);
            const { userId, name, type } = body;

            if (!userId || !name) {
                sendError(res, 400, 'userId and name are required');
                return true;
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

            sendJson(res, 201, newCollection);
        } catch (error) {
            console.error('Error creating collection:', error);
            sendError(res, 500, 'Failed to create collection');
        }
        return true;
    }

    const collectionsMatch = url.pathname.match(/^\/api\/collections\/([^\/]+)$/);
    
    if (collectionsMatch && req.method === 'DELETE') {
        try {
            const collectionId = collectionsMatch[1];
            const query = buildIdQuery(collectionId);

            const collection = await db.collection('collections').findOne(query);
            
            if (!collection) {
                sendError(res, 404, 'Collection not found');
                return true;
            }

            if (collection.name === 'Favourites' || collection.name === 'Pairs' || collection.name === 'pairs') {
                sendError(res, 403, 'Cannot delete system collections');
                return true;
            }

            await db.collection('collections').deleteOne({ _id: collection._id });
            
            sendJson(res, 200, { success: true, deletedId: collectionId });
        } catch (error) {
            console.error('Error deleting collection:', error);
            sendError(res, 500, 'Failed to delete collection');
        }
        return true;
    }

    if (collectionsMatch && req.method === 'PUT') {
        try {
            const collectionId = collectionsMatch[1];
            const body = await parseBody(req);
            const { name } = body;

            if (!name || !name.trim()) {
                sendError(res, 400, 'name is required');
                return true;
            }

            const query = buildIdQuery(collectionId);
            const collection = await db.collection('collections').findOne(query);
            
            if (!collection) {
                sendError(res, 404, 'Collection not found');
                return true;
            }

            if (collection.name === 'Favourites' || collection.name === 'Pairs' || collection.name === 'pairs') {
                sendError(res, 403, 'Cannot rename system collections');
                return true;
            }

            await db.collection('collections').updateOne(
                { _id: collection._id }, 
                { $set: { name: name.trim() } }
            );
            
            sendJson(res, 200, { success: true, id: collectionId, name: name.trim() });
        } catch (error) {
            console.error('Error renaming collection:', error);
            sendError(res, 500, 'Failed to rename collection');
        }
        return true;
    }

    const fontInCollectionMatch = url.pathname.match(/^\/api\/collections\/([^\/]+)\/fonts\/([^\/]+)$/);
    if (fontInCollectionMatch && req.method === 'DELETE') {
        try {
            const collectionId = fontInCollectionMatch[1];
            const fontId = fontInCollectionMatch[2];

            const query = buildIdQuery(collectionId);
            const collection = await db.collection('collections').findOne(query);
            
            if (!collection) {
                sendError(res, 404, 'Collection not found');
                return true;
            }

            await db.collection('collections').updateOne(
                { _id: collection._id },
                { $pull: { items: { fontId: String(fontId) } } }
            );
            
            sendJson(res, 200, { success: true, collectionId, fontId });
        } catch (error) {
            console.error('Error removing font from collection:', error);
            sendError(res, 500, 'Failed to remove font from collection');
        }
        return true;
    }

    if (url.pathname === '/api/collections/toggle-font' && req.method === 'POST') {
        try {
            const body = await parseBody(req);
            const { userId, collectionName, fontId } = body;

            if (!userId || !collectionName || !fontId) {
                sendError(res, 400, 'userId, collectionName and fontId are required');
                return true;
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
                sendJson(res, 200, { added: false, fontId: fontIdStr, collectionName });
            } else {
                await db.collection('collections').updateOne(
                    { _id: collection._id },
                    { $push: { items: { fontId: fontIdStr, addedAt: new Date() } } }
                );
                sendJson(res, 200, { added: true, fontId: fontIdStr, collectionName });
            }
        } catch (error) {
            console.error('Error toggling font in collection:', error);
            sendError(res, 500, 'Failed to toggle font in collection');
        }
        return true;
    }

    return false;
}

module.exports = { handleCollectionsRoutes };
