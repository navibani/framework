"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ...existing code...
const http_1 = require("http");
const fs_1 = require("fs");
const path_1 = require("path");
const PORT = Number(process.env.PORT) || 3000;
// Serve from the folder where this file is located (compiled JS side)
// if you run server.ts with ts-node, __dirname will be the ts-file folder
const ROOT = (0, path_1.resolve)(__dirname);
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.map': 'application/octet-stream',
};
function safeResolve(root, requestPath) {
    const clean = requestPath.replace(/^\/+/, '');
    const full = (0, path_1.resolve)(root, clean);
    if (!(full === root || full.startsWith(root + path_1.sep)))
        throw new Error('Forbidden');
    return full;
}
const server = (0, http_1.createServer)(async (req, res) => {
    try {
        const { url, method, headers } = req;
        if (!url || !method)
            throw new Error('Invalid request');
        const parsedUrl = new URL(url, `http://${headers.host || 'localhost'}`);
        let pathname = parsedUrl.pathname || '/';
        // serve index.html for root
        if (pathname === '/')
            pathname = '/index.html';
        // Resolve and protect from directory traversal
        const filePath = safeResolve(ROOT, pathname);
        console.log('Request Path:', pathname, '->', filePath);
        const stat = await fs_1.promises.stat(filePath).catch(() => null);
        if (!stat || !stat.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not Found');
            return;
        }
        const ext = (0, path_1.extname)(filePath).toLowerCase();
        const contentType = MIME[ext] || 'application/octet-stream';
        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*',
        });
        const data = await fs_1.promises.readFile(filePath);
        res.end(data);
    }
    catch (err) {
        console.error('Serve error:', err);
        const code = err.message === 'Forbidden' ? 403 : 500;
        res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(code === 403 ? 'Forbidden' : 'Internal Server Error');
    }
});
server.listen(PORT, 'localhost', () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Serving files from ${ROOT}`);
});
//# sourceMappingURL=server.js.map