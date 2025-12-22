const { sendJson, sendError } = require('./utils');

async function handleFontsRoutes(req, res, url, db) {
    if (url.pathname === '/api/fonts' && req.method === 'GET') {
        try {
            const fonts = await db.collection('fonts').find().toArray();
            sendJson(res, 200, fonts);
        } catch (error) {
            console.error('Error fetching fonts:', error);
            sendError(res, 500, 'Failed to fetch fonts');
        }
        return true;
    }

    if (url.pathname.startsWith('/api/fonts/') && req.method === 'GET') {
        const fontId = url.pathname.split('/')[3];
        
        try {
            const font = await db.collection('fonts').findOne({ _id: fontId });
            
            if (!font) {
                sendError(res, 404, 'Font not found');
                return true;
            }
            
            sendJson(res, 200, font);
        } catch (error) {
            console.error('Error fetching font:', error);
            sendError(res, 500, 'Failed to fetch font');
        }
        return true;
    }

    return false;
}

module.exports = { handleFontsRoutes };
