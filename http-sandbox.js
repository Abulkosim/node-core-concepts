import http from "node:http";

const server = http.createServer((req, res) => {
  console.log(req.method, req.url, req.headers);

  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello");
    return;
  }

  if (req.method === "POST" && req.url === "/json") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const data = JSON.parse(body || "{}");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ received: data }));
    });
    req.on("error", (err) => {
      res.statusCode = 400;
      res.end("Bad request");
    });
    return;
  }

  res.statusCode = 404;
  res.end("Not found");
});

server.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});

server.on("error", console.error);
server.on("clientError", (err, socket) => {
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});
