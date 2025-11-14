"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = loadEnv;
const fs_1 = require("fs");
const path_1 = require("path");
function loadEnv(filePath = '.env') {
    const absPath = (0, path_1.resolve)(filePath);
    let content;
    try {
        content = (0, fs_1.readFileSync)(absPath, { encoding: 'utf-8' });
    }
    catch {
        return;
    }
    const lines = content.split('\n');
    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('#'))
            continue;
        const [key, ...rest] = line.split('=');
        if (!key)
            continue;
        let value = rest.join('=').trim();
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        if (process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}
//# sourceMappingURL=env.js.map