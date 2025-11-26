import http from 'http';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET' && req.url === '/hello') {
    res.writeHead(200);
    res.end(JSON.stringify({ message: 'GET request received' }));
  } else if (req.method === 'POST' && req.url === '/hello') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      res.writeHead(201);
      res.end(JSON.stringify({ message: 'POST request received', body }));
    });
  } else if (req.method === 'PUT' && req.url === '/hello') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      res.writeHead(200);
      res.end(JSON.stringify({ message: 'PUT request received', body }));
    });
  } else if (req.method === 'DELETE' && req.url === '/hello') {
    res.writeHead(200);
    res.end(JSON.stringify({ message: 'DELETE request received' }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Simple HTTP server listening on port ${PORT}`);
});

