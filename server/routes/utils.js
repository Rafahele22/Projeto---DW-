const { ObjectId } = require('mongodb');

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

function toObjectId(id) {
    try {
        return new ObjectId(id);
    } catch (e) {
        return null;
    }
}

function buildIdQuery(id) {
    const objId = toObjectId(id);
    if (objId) {
        return { $or: [{ _id: objId }, { _id: String(id) }] };
    }
    return { _id: String(id) };
}

function sendJson(res, code, data) {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

function sendError(res, code, message) {
    sendJson(res, code, { error: message });
}

function sendSuccess(res, data = { success: true }) {
    sendJson(res, 200, data);
}

module.exports = {
    parseBody,
    toObjectId,
    buildIdQuery,
    sendJson,
    sendError,
    sendSuccess
};
