// import fs from 'fs';

// console.log('A');

// fs.readFile('file.txt', 'utf8', (err, data) => {
//   console.log('C');
// });

// console.log('B');

// console.log('A');

// process.nextTick(() => console.log('B'));

// console.log('C');

// console.log('start');

// process.nextTick(() => console.log('nextTick'));
// Promise.resolve().then(() => console.log('promise'));

// console.log('end');

async function check() {
  setTimeout(() => console.log('timeout'), 0);
  return 'checked';
}

async function main() {
  const result = check();
  console.log(result);
}

main();

import os from 'os';

console.log(os.networkInterfaces());