import fs from 'fs';

const readStream = fs.createReadStream('example.txt', { encoding: 'utf-8' });

readStream.on('data', (chunk) => {
  console.log(chunk);
});

readStream.on('end', () => {
  console.log('Finished reading file');
});

readStream.on('error', (err) => {
  console.error(`Failed to read file: ${err.message}`);
});
