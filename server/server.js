const http = require('http');
const fs = require('fs');
const path = require('path');
const { connectToDb } = require('./config/db');
const { handleApiRequest } = require('./routes/api');

const PORT = 80;
const PUBLIC_DIR = path.join(__dirname, '../public');

const CONTENT_TYPES = new Map([
    ['.html', 'text/html; charset=utf-8'],
    ['.css', 'text/css; charset=utf-8'],
    ['.js', 'application/javascript; charset=utf-8'],
    ['.json', 'application/json; charset=utf-8'],
    ['.svg', 'image/svg+xml'],
    ['.png', 'image/png'],
    ['.jpg', 'image/jpeg'],
    ['.jpeg', 'image/jpeg'],
    ['.gif', 'image/gif'],
    ['.webp', 'image/webp'],
    ['.woff', 'font/woff'],
    ['.woff2', 'font/woff2'],
    ['.ttf', 'font/ttf'],
    ['.otf', 'font/otf'],
]);

const JSX_SCRIPTS = [
    'js/main/react/filtersApp.jsx',
    'js/main/react/collectionsApp.utils.jsx',
    'js/main/react/collectionsApp.components.jsx',
    'js/main/react/collectionsApp.mount.jsx',
];

function getContentType(filePath) {
    return CONTENT_TYPES.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream';
}

function safeJoinPublic(requestPathname) {
    const decoded = decodeURIComponent(requestPathname).replace(/\\/g, '/');
    const resolved = path.resolve(path.join(PUBLIC_DIR, decoded));
    return resolved.startsWith(path.resolve(PUBLIC_DIR)) ? resolved : null;
}

function inlineJsxScriptsInHtml(html) {
    let out = html;
    for (const src of JSX_SCRIPTS) {
        try {
            const jsx = fs.readFileSync(path.join(PUBLIC_DIR, src), 'utf8');
            const needle = `<script type="text/babel" src="${src}"></script>`;
            const replacement = `<script type="text/babel">\n${jsx}\n</script>`;
            out = out.includes(needle) ? out.replace(needle, replacement) : out.replace('</head>', `${replacement}\n</head>`);
        } catch (e) {
            console.warn(`Could not read JSX file to inline: ${src}`);
        }
    }
    return out;
}

function sendError(res, code, message) {
    res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(message);
}

function sendHtml(res, code, html) {
    res.writeHead(code, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
}

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log(`${req.method} ${req.url}`);

    if (req.url.startsWith('/api')) {
        await handleApiRequest(req, res);
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname === '/' ? '/main.html' : url.pathname;

    if (pathname === '/main.html') {
        try {
            const html = fs.readFileSync(path.join(PUBLIC_DIR, 'main.html'), 'utf8');
            sendHtml(res, 200, inlineJsxScriptsInHtml(html));
        } catch (e) {
            console.error('Error serving main.html:', e);
            sendError(res, 500, 'Server Error');
        }
        return;
    }

    const filePath = safeJoinPublic(pathname);
    if (!filePath) {
        sendError(res, 400, 'Bad Request');
        return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            err.code === 'ENOENT' ? sendHtml(res, 404, '<h1>404 - Not Found</h1>') : sendError(res, 500, 'Server Error');
            if (err.code !== 'ENOENT') console.error('File read error:', err);
        } else {
            res.writeHead(200, { 'Content-Type': getContentType(filePath) });
            res.end(content);
        }
    });
});

connectToDb((err) => {
    if (err) {
        console.error('Failed to connect to database:', err);
        process.exit(1);
    }
    
    server.listen(PORT, () => {
        console.log(`Server running`);
    });
});
