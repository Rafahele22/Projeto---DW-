const { getDb } = require('../config/db');
const { handleFontsRoutes } = require('./fonts');
const { handleAuthRoutes } = require('./auth');
const { handleCollectionsRoutes } = require('./collections');
const { handlePairsRoutes } = require('./pairs');
const { handleFavoritesRoutes } = require('./favorites');
const { sendError } = require('./utils');

async function handleApiRequest(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const db = getDb();

    if (await handleFontsRoutes(req, res, url, db)) return;
    if (await handleAuthRoutes(req, res, url, db)) return;
    if (await handleCollectionsRoutes(req, res, url, db)) return;
    if (await handlePairsRoutes(req, res, url, db)) return;
    if (await handleFavoritesRoutes(req, res, url, db)) return;

    sendError(res, 404, 'Endpoint not found');
}

module.exports = { handleApiRequest };
