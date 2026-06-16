import { Readable } from 'stream';

class EmojiStream extends Readable {
  #count = 0;

  constructor({ emoji = ':-)', limit = 5 } = {}) {
    super();
    this.emoji = emoji;
    this.limit = limit;
  }

  _read() {
    this.push(this.emoji);
    if (++this.#count === this.limit) {
      this.push(null);
    }
  }
}

const stream = new EmojiStream();

stream.on('data', chunk => console.log(chunk.toString()));
stream.on('end', () => console.log('stream ended'));
