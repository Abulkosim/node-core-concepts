import Text2Speech from 'node-gtts';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePathForAudio = path.join(__dirname, 'audio.mp3');
const textFilePath = path.join(__dirname, 'example.txt');

const readStream = fs.createReadStream(textFilePath);

const writeStream = fs.createWriteStream(path.join(__dirname, 'example2.txt'));

readStream.pipe(writeStream);

const content = fs.readFileSync(textFilePath, 'utf8');

const tts = Text2Speech('en');

tts.save(filePathForAudio, content, () => {
  console.log('audio saved');
});