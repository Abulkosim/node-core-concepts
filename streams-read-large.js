import { createReadStream } from 'node:fs';

const read = (name) => {
  let lines = 0;
  let words = 0;
  let lineRemainder = '';
  let wordRemainder = '';

  const stream = createReadStream(name, {
    encoding: 'utf-8',
    highWaterMark: 64 * 1024,
  });

  stream.on('data', (chunk) => {
    const lineParts = (lineRemainder + chunk).split('\n');
    lineRemainder = lineParts.pop();
    lines += lineParts.length;

    const wordParts = (wordRemainder + chunk).split(/\s+/);
    wordRemainder = wordParts.pop();
    words += wordParts.filter(Boolean).length;


    const mem = process.memoryUsage();
    console.log(`heapUsed: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  });

  stream.on('end', () => {
    if (lineRemainder.length > 0) lines++;
    if (wordRemainder.trim().length > 0) words++;
    console.log('lines:', lines);
    console.log('words:', words);
  });

  stream.on('error', (err) => {
    console.error(err);
  });
}

read('big.txt');