let config = { version: 1, message: "Hello" };
let lastModified = new Date().toUTCString();
let etag = `"v${config.version}"`; 

if (url === "/config" && method === "GET") {
  const ifNoneMatch = req.headers["if-none-match"];
  const ifModifiedSince = req.headers["if-modified-since"];

  if (ifNoneMatch === etag || ifModifiedSince === lastModified) {
    res.writeHead(304, { ETag: etag, "Last-Modified": lastModified });
    res.end();
    return;
  }

  const body = JSON.stringify(config);
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Cache-Control": "max-age=10",
    ETag: etag,
    "Last-Modified": lastModified,
  });
  res.end(body);
  return;
}

if (url === "/config" && method === "PUT") {
  let raw = "";
  req.on("data", chunk => (raw += chunk));
  req.on("end", () => {
    try {
      const { message } = JSON.parse(raw || "{}");
      config.message = message ?? config.message;
      config.version += 1;
      lastModified = new Date().toUTCString();
      etag = `"v${config.version}"`;

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(config));
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON" }));
    }
  });
  return;
}

