import { Transform } from 'stream';

function makeLineTransform(handleLine) {
  let leftover = '';

  return new Transform({
    transform(chunk, enc, cb) {
      const text = leftover + chunk.toString('utf8');
      const lines = text.split('\n');
      leftover = lines.pop(); 
      
      for (const line of lines) {
        this.push(handleLine(line) + '\n');
      }

      cb();
    },

    flush(cb) {
      if (leftover) {
        this.push(handleLine(leftover) + '\n');
      }
      cb();
    }
  });
}