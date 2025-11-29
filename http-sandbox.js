// import http from "node:http";

// const server = http.createServer((req, res) => {
//   console.log(req.method, req.url, req.headers);

//   if (req.method === "GET" && req.url === "/") {
//     res.writeHead(200, { "Content-Type": "text/plain" });
//     res.end("Hello");
//     return;
//   }

//   if (req.method === "POST" && req.url === "/json") {
//     let body = "";
//     req.on("data", (chunk) => {
//       body += chunk;
//     });
//     req.on("end", () => {
//       const data = JSON.parse(body || "{}");
//       res.writeHead(200, { "Content-Type": "application/json" });
//       res.end(JSON.stringify({ received: data }));
//     });
//     req.on("error", (err) => {
//       res.statusCode = 400;
//       res.end("Bad request");
//     });
//     return;
//   }

//   res.statusCode = 404;
//   res.end("Not found");
// });

// server.listen(3000, () => {
//   console.log("Listening on http://localhost:3000");
// });

// server.on("error", console.error);
// server.on("clientError", (err, socket) => {
//   socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
// });


import http from "http";

const notes = new Map();
let nextId = 1;

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  if (url === "/notes" && method === "GET") {
    const body = JSON.stringify(Array.from(notes.entries()).map(([id, text]) => ({ id, text })));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(body);
    return;
  }

  if (url === "/notes" && method === "POST") {
    let raw = "";
    req.on("data", chunk => (raw += chunk));
    req.on("end", () => {
      try {
        const { text } = JSON.parse(raw || "{}");
        if (!text) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "text is required" }));
          return;
        }
        const id = String(nextId++);
        notes.set(id, text);
        res.writeHead(201, {
          "Content-Type": "application/json",
          Location: `/notes/${id}`,
        });
        res.end(JSON.stringify({ id, text }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  const noteIdMatch = url.match(/^\/notes\/(\d+)$/);
  if (noteIdMatch) {
    const id = noteIdMatch[1];

    if (method === "GET") {
      if (!notes.has(id)) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not found" }));
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ id, text: notes.get(id) }));
      return;
    }

    if (method === "PUT") {
      let raw = "";
      req.on("data", chunk => (raw += chunk));
      req.on("end", () => {
        try {
          const { text } = JSON.parse(raw || "{}");
          if (!text) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "text is required" }));
            return;
          }
          const exists = notes.has(id);
          notes.set(id, text);
          res.writeHead(exists ? 200 : 201, {
            "Content-Type": "application/json",
            Location: `/notes/${id}`,
          });
          res.end(JSON.stringify({ id, text }));
        } catch (e) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });
      return;
    }

    if (method === "DELETE") {
      if (!notes.has(id)) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not found" }));
        return;
      }
      notes.delete(id);
      res.writeHead(204);
      res.end();
      return;
    }
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Route not found" }));
});

server.listen(3000, () => {
  console.log("HTTP lab running on http://localhost:3000");
});
