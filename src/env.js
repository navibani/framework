function getEnvData(envTargets) {
  const numberType = 'number';
  const objectType = 'object';

  const { target, type } = envTargets;

  const string = process.env[target];

  const isUndefined = string === undefined;

  if (isUndefined) {
    const message = `Error loading env using ${target}`;

    const error = new Error(message);

    throw error;
  }

  const isNumber = type === numberType;

  if (isNumber) {
    const number = Number(string);

    return number;
  }

  const isObject = type === objectType;

  if (isObject) {
    const object = JSON.parse(string);

    return object;
  }

  return string;
}

export default function getEnv() {
  const envTargets = {
    port: { target: 'PORT', type: 'number' },
    mimeTypes: { target: 'MIME_TYPES', type: 'object' },
    absoluteUrl: { target: 'ABSOLUTE_URL', type: 'string' },
  };

  const dirPath = import.meta.dirname;

  const port = getEnvData(envTargets.port);

  const mimeTypes = getEnvData(envTargets.mimeTypes);

  const absoluteUrl = getEnvData(envTargets.absoluteUrl);

  return { dirPath, port, mimeTypes, absoluteUrl };
}
