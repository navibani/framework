"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const PORT = 3000;
const server = (0, http_1.createServer)((req, res) => {
    try {
        const { url, method, headers } = req;
        if (url === undefined || method === undefined) {
            throw new Error('Invalid request');
        }
        const parsedUrl = new URL(url, `http://${headers.host}`);
        const pathname = parsedUrl.pathname || '/';
        console.log('Request Path:', pathname);
        console.group(url + ' ' + method);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('Hello, World!\n');
    }
    catch (error) { }
});
server.listen(PORT, 'localhost', () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
//# sourceMappingURL=server.js.map