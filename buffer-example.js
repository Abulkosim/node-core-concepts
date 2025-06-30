import fs from 'fs';
import path from 'path';

const filePath = path.join('example.txt');

const fullBuffer = fs.readFileSync(filePath);
console.log(fullBuffer);
