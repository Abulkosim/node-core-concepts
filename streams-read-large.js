import { createReadStream } from 'node:fs';

const read = (name) => {
  const stream = createReadStream(name, {
    encoding: 'utf-8', 
    highWaterMark: 64 * 1024, 
  });
  
  stream.on('data', (chunk) => {
    console.log(chunk);
  })
  
  stream.on('end', () => {
    console.log('\n');
  })
  
  stream.on('error', (err) => {
    console.log(err)
  })
}

read('big.txt');