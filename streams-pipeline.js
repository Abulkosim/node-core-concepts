import { createReadStream, createWriteStream } from 'node:fs';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createGzip } from 'node:zlib';

const sourceFile = 'input.txt';
const destinationFile = 'output-redacted.txt.gz';
const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function createEmailRedactionStream() {
  let remainder = '';

  return new Transform({
    decodeStrings: false,
    transform(chunk, encoding, callback) {
      const parts = (remainder + chunk).split('\n');
      remainder = parts.pop() ?? '';

      const redacted = parts
        .map((line) => line.replace(emailPattern, '[REDACTED]'))
        .join('\n');

      callback(null, parts.length > 0 ? `${redacted}\n` : '');
    },
    flush(callback) {
      if (remainder.length === 0) {
        callback();
        return;
      }

      callback(null, `${remainder.replace(emailPattern, '[REDACTED]')}\n`);
    },
  });
}

async function run() {
  await pipeline(
    createReadStream(sourceFile, { encoding: 'utf8' }),
    createEmailRedactionStream(),
    createGzip(),
    createWriteStream(destinationFile)
  );

  console.log(`Pipeline complete: ${sourceFile} -> ${destinationFile}`);
}

run().catch((error) => {
  console.error('Pipeline failed:', error);
  process.exitCode = 1;
});
