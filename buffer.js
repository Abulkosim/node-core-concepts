import {Buffer} from 'buffer';

const buf1 = Buffer.alloc(10); 
const buf2 = Buffer.allocUnsafe(10); 
const buf3 = Buffer.from([0x68, 0x65, 0x6c, 0x6c, 0x6f]);

console.log(buf1);
console.log(buf2);
console.log(buf3.toString());