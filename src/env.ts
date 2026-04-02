import path from 'path';
import fs from 'fs';

export default function loadEnv() {
  const envPath = '.env';
  const cwd = process.cwd();
  const characterEncode = 'utf-8';
  const lineEnd = '\n';
  const localHost = 'http://localhost';
  const objectType = '{}';

  const filePath = path.resolve(cwd, envPath);

  const pathExists = fs.existsSync(filePath);

  if (!pathExists) {
    const message = `File cannot be found at ${envPath}.`;

    throw new Error(message);
  }

  const fileContent = fs.readFileSync(filePath, characterEncode);

  const fileLines = fileContent.split(lineEnd);

  fileLines.forEach((line) => {
    const emptyLine = '';
    const commentDelimiter = '#';
    const keyValueDelimiter = '=';

    const trimmedLine = line.trim();

    const isEmptyLine = trimmedLine === emptyLine;

    const isCommentLine = trimmedLine.startsWith(commentDelimiter);

    const isInvalidLine = isEmptyLine || isCommentLine;

    if (!isInvalidLine) {
      const commentRegex = /^['"]|['"]$/g;

      const [key, ...values] = trimmedLine.split(keyValueDelimiter);
      const trimmedKey = key.trim();
      const value = values.join(keyValueDelimiter);
      const trimmedValue = value.trim();

      const hasKey = trimmedKey !== emptyLine;

      if (hasKey) {
        const cleanedValues = trimmedValue.replace(commentRegex, emptyLine);

        process.env[trimmedKey] = cleanedValues;
      }
    }
  });

  const port = Number(process.env.PORT) || 3000;

  const absoluteUrl = process.env.ABSOLUTE_URL || localHost;

  const mimeTypes: Record<string, string> = JSON.parse(
    process.env.MIME_TYPES || objectType
  );

  return { port, absoluteUrl, mimeTypes };
}
