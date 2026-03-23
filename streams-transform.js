import { Transform } from 'node:stream';
import fs from 'fs';

let lineNumber = 1;
let remainder = '';

const upper = new Transform({
  transform(chunk, enc, callback) {
    const parts = (remainder + chunk).split('\n');
    remainder = parts.pop();

    const out = parts
      .map((line) => `${lineNumber++}. ${line}`.toUpperCase())
      .join('\n');

    callback(null, parts.length ? `${out}\n` : '');
  },
  flush(callback) {
    if (remainder === '') {
      callback();
      return;
    }
    callback(null, `${lineNumber++}. ${remainder}`.toUpperCase() + '\n');
  },
})

fs.createReadStream('input.txt', { encoding: 'utf8' })
  .pipe(upper)
  .pipe(fs.createWriteStream('output.txt'));

