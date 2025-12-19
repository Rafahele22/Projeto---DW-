const http = require('http');
const fs = require('fs');
const path = require('path');
const { connectToDb } = require('./config/db');
const { handleApiRequest } = require('./routes/api');

const PORT = 4000;

const PUBLIC_DIR = path.join(__dirname, '../public');

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.html':
            return 'text/html; charset=utf-8';
        case '.css':
            return 'text/css; charset=utf-8';
        case '.js':
            return 'application/javascript; charset=utf-8';
        case '.json':
            return 'application/json; charset=utf-8';
        case '.svg':
            return 'image/svg+xml';
        case '.png':
            return 'image/png';
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.gif':
            return 'image/gif';
        case '.webp':
            return 'image/webp';
        case '.woff':
            return 'font/woff';
        case '.woff2':
            return 'font/woff2';
        case '.ttf':
            return 'font/ttf';
        case '.otf':
            return 'font/otf';
        default:
            return 'application/octet-stream';
    }
}

function safeJoinPublic(requestPathname) {
    const decoded = decodeURIComponent(requestPathname);
    const normalized = decoded.replace(/\\/g, '/');
    const joined = path.join(PUBLIC_DIR, normalized);
    const resolved = path.resolve(joined);
    const resolvedPublic = path.resolve(PUBLIC_DIR);

    if (!resolved.startsWith(resolvedPublic)) {
        return null;
    }
    return resolved;
}

function inlineJsxScriptsInHtml(html) {
    const scriptsToInline = [
        'js/main/react/filtersApp.jsx',
        'js/main/react/collectionsApp.utils.jsx',
        'js/main/react/collectionsApp.components.jsx',
        'js/main/react/collectionsApp.mount.jsx',
    ];

    let out = html;
    for (const src of scriptsToInline) {
        const absPath = path.join(PUBLIC_DIR, src);
        let jsx;
        try {
            jsx = fs.readFileSync(absPath, 'utf8');
        } catch (e) {
            console.warn(`Could not read JSX file to inline: ${src}`);
            continue;
        }

        const needle = `<script type="text/babel" src="${src}"></script>`;
        const replacement = `<script type="text/babel">\n${jsx}\n</script>`;

        if (out.includes(needle)) {
            out = out.replace(needle, replacement);
        } else {
            out = out.replace('</head>', `${replacement}\n</head>`);
        }
    }
    return out;
}

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
            const htmlPath = path.join(PUBLIC_DIR, 'main.html');
            const html = fs.readFileSync(htmlPath, 'utf8');
            const injected = inlineJsxScriptsInHtml(html);
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(injected);
        } catch (e) {
            console.error('Error serving main.html:', e);
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Server Error');
        }
        return;
    }

    const filePath = safeJoinPublic(pathname);
    if (!filePath) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Bad Request');
        return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 - Not Found</h1>');
            } else {
                console.error('File read error:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Server Error');
            }
        } else {
            const contentType = getContentType(filePath);
            res.writeHead(200, { 'Content-Type': contentType });
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
