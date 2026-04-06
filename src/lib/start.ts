import copyFiles from './copy.js';
import loadEnv from './env.js';
import startWatcher from './watch.js';
import createServer from './server.js';

function start() {
  const env = loadEnv();

  copyFiles(env.dir.SOURCE, env.dir.BUILD);

  startWatcher(env.dir.SOURCE, env.dir.BUILD);

  const server = createServer(env.dir.CLIENT, env.server.MIME_TYPES);

  server.listen(env.server.PORT, () => {
    const messageOne = `\n Server ready at ${env.server.ABSOLUTE_URL}:${env.server.PORT}`;

    const messageTwo = `Serving files from: ${env.dir.CLIENT}.`;

    console.log(messageOne);

    console.log(messageTwo);
  });

  const message = `System started on port: ${env.server.PORT}`;

  console.log(message);
}

start();
