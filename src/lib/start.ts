import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import copyFiles from './copy.js';
import loadEnv from './env.js';
import startWatcher from './watch.js';
import createServer from './server.js';

function start(envFileName: string = '.env') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const projectRoot = resolve(__dirname, '../../');

  const envPath = resolve(projectRoot, envFileName);
  const env = loadEnv(envPath);

  copyFiles(projectRoot);

  startWatcher(projectRoot);

  const server = createServer(projectRoot, env.mimeTypes);

  server.listen(env.port, () => {
    console.log(`\n Server ready at ${env.absoluteUrl}:${env.port}`);
    console.log(`Serving files from: ${resolve(projectRoot, 'dist/client')}`);
  });

  console.log(`System started on port: ${env.port}`);
}

start();
