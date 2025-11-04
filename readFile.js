import fs from 'fs';

const readStream = fs.createReadStream('example.txt');

readStream.on("data", (chunk) => {
  console.log(chunk.toString())
})

readStream.on("end", () => {
  console.log("ending")
})