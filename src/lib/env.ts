import fs from 'node:fs';

function parseData(envData: string) {
  const newLineChar = /\r?\n/;
  const keyValueChar = '=';
  const quoteStripRegex = /^(['"])(.*)\1$/;
  const valueCaptureRegex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^#\s]+)/;

  const fileLines = envData.split(newLineChar);

  fileLines.forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }

    const [key, ...values] = trimmedLine.split(keyValueChar);
    const trimmedKey = key.trim();

    if (trimmedKey) {
      const rawValue = values.join(keyValueChar).trim();

      const match = rawValue.match(valueCaptureRegex);
      let finalValue = match ? match[1] : '';

      finalValue = finalValue.replace(quoteStripRegex, '$2');

      process.env[trimmedKey] = finalValue;
    }
  });
}

function evaluateKV() {
  const defaultDomain = 'http://localhost';
  const objectType = '{}';

  const rawPort = process.env.PORT;
  const parsedPort = parseInt(rawPort || '', 10);
  const isValidPort =
    !Number.isNaN(parsedPort) && parsedPort > 0 && parsedPort <= 65535;

  const port = isValidPort ? parsedPort : 3000;

  const absoluteUrl = process.env.ABSOLUTE_URL || defaultDomain;

  const mimeTypes: Record<string, string> = JSON.parse(
    process.env.MIME_TYPES || objectType
  );

  return { port, absoluteUrl, mimeTypes };
}

export default function loadEnv(absoluteEnvPath: string) {
  if (!fs.existsSync(absoluteEnvPath)) {
    throw new Error(`File cannot be found at ${absoluteEnvPath}`);
  }

  const envData = fs.readFileSync(absoluteEnvPath, 'utf-8');
  parseData(envData);
  return evaluateKV();
}
