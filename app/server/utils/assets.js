const fs = require('fs');
const path = require('path');

function serveFile(req, res) {
    const publicPath = path.join(__dirname, '../../public'); 
    let filePath = path.join(publicPath, req.url === '/' ? 'indexTeste.html' : req.url);

    const extname = path.extname(filePath);
    let contentType = 'text/html';

    // Tipos de ficheiros permitidos
    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;
        case '.svg': contentType = 'image/svg+xml'; break;
        case '.ttf': contentType = 'font/ttf'; break;
        case '.otf': contentType = 'font/otf'; break;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404: File Not Found');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

module.exports = { serveFile };