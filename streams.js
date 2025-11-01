import fs from "fs";

// const readableStream = fs.createReadStream('input.txt', 'utf8');
// const writableStream = fs.createWriteStream('output.txt');

// readableStream.pipe(writableStream);

// writableStream.on('finish', () => {
//   console.log('File copy completed!');
// });

// readableStream.on('error', (err) => {
//   console.error('Error reading file:', err);
// });

// writableStream.on('error', (err) => {
//   console.error('Error writing file:', err);
// });


const readableStream = fs.createReadStream('input.txt', {
  encoding: 'utf8',
  highWaterMark: 1 * 1024 
});

readableStream.on('data', (chunk) => {
  console.log(`Received ${chunk.length} bytes of data.`);
  console.log(chunk);
});

readableStream.on('end', () => {
  console.log('No more data to read.');
});

readableStream.on('error', (err) => {
  console.error('Error reading from stream:', err);
});