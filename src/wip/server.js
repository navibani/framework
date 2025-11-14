"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const fs_1 = require("fs");
const path_1 = require("path");
const env_1 = require("./env");
const PORT_NUMBER = Number(process.env.PORT) || 3000;
const ROOT_DIR = (0, path_1.resolve)(__dirname);
const server = (0, http_1.createServer)(async (req, res) => {
    try {
        (0, env_1.loadEnv)();
        if (process.env.FILE_TYPES === undefined) {
            throw new Error('FILE_TYPES environment variable is not defined');
        }
        const FILE_TYPES = JSON.parse(process.env.FILE_TYPES);
        const { url, method, headers } = req;
        const hasUrl = url !== undefined;
        const hasMethod = method !== undefined;
        const hasHostHeader = headers.host !== undefined;
        if (!hasUrl) {
            throw new Error('Request URL is missing');
        }
        else if (!hasMethod) {
            throw new Error('Request method is missing');
        }
        else if (!hasHostHeader) {
            throw new Error('Host header is missing');
        }
        const isGetMethod = method.toUpperCase() === 'GET';
        if (isGetMethod) {
            const formattedUrl = new URL(url, `http://${headers.host || 'localhost'}`);
            const parsedPathname = formattedUrl.pathname || '/';
            const pathname = parsedPathname === '/' ? '/index.html' : parsedPathname;
            const cleanedPath = pathname.replace(/^\/+/, '');
            const absolutePath = (0, path_1.resolve)(ROOT_DIR, cleanedPath);
            const relativePath = (0, path_1.relative)(ROOT_DIR, absolutePath);
            if (relativePath === '' || !relativePath.startsWith('..')) {
                const filePath = absolutePath;
                const stats = await fs_1.promises.stat(filePath).catch(() => null);
                const hasStat = stats !== null;
                const isFile = hasStat && stats.isFile();
                if (isFile === false) {
                    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                    res.end('Not Found');
                }
                const ext = (0, path_1.extname)(filePath).toLowerCase();
                const contentType = FILE_TYPES[ext] || 'application/octet-stream';
                res.writeHead(200, {
                    'Content-Type': contentType,
                    'Cache-Control': 'no-cache',
                    'Access-Control-Allow-Origin': '*',
                });
                const data = await fs_1.promises.readFile(filePath);
                res.end(data);
            }
            else {
                throw new Error('Forbidden');
            }
        }
    }
    catch (err) {
        console.error('Serve error:', err);
        const code = err.message === 'Forbidden' ? 403 : 500;
        res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(code === 403 ? 'Forbidden' : 'Internal Server Error');
    }
});
server.listen(PORT_NUMBER, 'localhost', () => {
    console.log(`Server running at http://localhost:${PORT_NUMBER}/`);
    console.log(`Serving files from ${ROOT_DIR}`);
});
//# sourceMappingURL=server.js.map