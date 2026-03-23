import { Transform } from 'node:stream';
import fs from 'fs';

let remainder = '';

const email = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function redactEmails(s) {
  return s.replace(email, '[REDACTED]');
}

const upper = new Transform({
  transform(chunk, enc, callback) {
    const parts = (remainder + chunk).split('\n');
    remainder = parts.pop();

    const out = parts.map((line) => redactEmails(line)).join('\n');

    callback(null, parts.length ? `${out}\n` : '');
  },
  flush(callback) {
    if (remainder === '') {
      callback();
      return;
    }
    callback(null, redactEmails(remainder) + '\n');
  },
})

fs.createReadStream('input.txt', { encoding: 'utf8' })
  .pipe(upper)
  .pipe(fs.createWriteStream('output.txt'));

