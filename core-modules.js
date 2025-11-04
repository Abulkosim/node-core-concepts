import http from "http";

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/echo') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ received: body }));
    });

  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(4000);

const fs = require('fs');
const zlib = require('zlib');
const http = require('http');
const { pipeline } = require('stream');

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Encoding': 'gzip' });
  pipeline(
    fs.createReadStream('large.log'),
    zlib.createGzip(),
    res,
    err => err && console.error('Stream error:', err)
  );
}).listen(3000);
