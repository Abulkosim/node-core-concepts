import http from 'http';
import crypto from 'crypto';
import zlib from 'zlib';
import { URL } from 'url';

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // prevent memory attacks
      if (body.length > 1e6) {
        req.connection.destroy();
        reject(new Error('body too large'));
      }
    });
    req.on('end', () => {
      try {
        if (req.headers['content-type']?.includes('application/json')) {
          resolve(JSON.parse(body));
        } else {
          resolve(body);
        }
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const boundary = req.headers['content-type']?.split('boundary=')[1];
    if (!boundary) return reject(new Error('no boundary'));

    let buffer = Buffer.alloc(0);
    
    req.on('data', chunk => {
      buffer = Buffer.concat([buffer, chunk]);
      if (buffer.length > 10e6) {
        req.connection.destroy();
        reject(new Error('file too large'));
      }
    });

    req.on('end', () => {
      const parts = [];
      const boundaryBuffer = Buffer.from(`--${boundary}`);
      let start = 0;

      while (true) {
        const boundaryIndex = buffer.indexOf(boundaryBuffer, start);
        if (boundaryIndex === -1) break;

        const nextBoundary = buffer.indexOf(boundaryBuffer, boundaryIndex + boundaryBuffer.length);
        if (nextBoundary === -1) break;

        const part = buffer.slice(boundaryIndex + boundaryBuffer.length, nextBoundary);
        const headerEnd = part.indexOf('\r\n\r\n');
        
        if (headerEnd !== -1) {
          const headers = part.slice(0, headerEnd).toString();
          const content = part.slice(headerEnd + 4, part.length - 2);
          
          const nameMatch = headers.match(/name="([^"]+)"/);
          const filenameMatch = headers.match(/filename="([^"]+)"/);
          
          if (nameMatch) {
            parts.push({
              name: nameMatch[1],
              filename: filenameMatch?.[1],
              data: content
            });
          }
        }

        start = nextBoundary;
      }

      resolve(parts);
    });

    req.on('error', reject);
  });
}

function createJWT(payload, secret) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyJWT(token, secret) {
  const [header, payload, signature] = token.split('.');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');
  
  if (signature !== expectedSignature) return null;
  
  return JSON.parse(Buffer.from(payload, 'base64url').toString());
}

class Router {
  constructor() {
    this.routes = [];
    this.middlewares = [];
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  addRoute(method, path, handler) {
    this.routes.push({ method, path, handler });
  }

  get(path, handler) {
    this.addRoute('GET', path, handler);
  }

  post(path, handler) {
    this.addRoute('POST', path, handler);
  }

  put(path, handler) {
    this.addRoute('PUT', path, handler);
  }

  delete(path, handler) {
    this.addRoute('DELETE', path, handler);
  }

  async handle(req, res) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    req.pathname = parsedUrl.pathname;
    req.query = Object.fromEntries(parsedUrl.searchParams);

    // enhanced response object
    res.json = (data, status = 200) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    };

    res.error = (message, status = 500) => {
      res.json({ error: message }, status);
    };

    // run middleware chain
    let middlewareIndex = 0;
    const next = async (err) => {
      if (err) {
        res.error(err.message, 500);
        return;
      }

      if (middlewareIndex < this.middlewares.length) {
        const middleware = this.middlewares[middlewareIndex++];
        try {
          await middleware(req, res, next);
        } catch (e) {
          res.error(e.message, 500);
        }
      } else {
        // find matching route
        const route = this.routes.find(r => 
          r.method === req.method && this.matchPath(r.path, req.pathname, req)
        );

        if (route) {
          try {
            await route.handler(req, res);
          } catch (e) {
            res.error(e.message, 500);
          }
        } else {
          res.error('not found', 404);
        }
      }
    };

    await next();
  }

  matchPath(pattern, path, req) {
    if (pattern === path) return true;

    // handle path parameters like /users/:id
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    if (patternParts.length !== pathParts.length) return false;

    req.params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        req.params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return false;
      }
    }

    return true;
  }
}

function logger() {
  return (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.pathname} ${res.statusCode} ${duration}ms`);
    });
    next();
  };
}

function cors() {
  return (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }
    
    next();
  };
}

function rateLimit(maxRequests = 100, windowMs = 60000) {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    const userRequests = requests.get(ip) || [];
    
    // clean old requests
    const recentRequests = userRequests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      res.statusCode = 429;
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      res.json({ error: 'too many requests' }, 429);
      return;
    }
    
    recentRequests.push(now);
    requests.set(ip, recentRequests);
    
    next();
  };
}

function compress() {
  return (req, res, next) => {
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const originalEnd = res.end.bind(res);
    const originalWrite = res.write.bind(res);
    
    let stream;
    
    if (acceptEncoding.includes('gzip')) {
      res.setHeader('Content-Encoding', 'gzip');
      stream = zlib.createGzip();
    } else if (acceptEncoding.includes('deflate')) {
      res.setHeader('Content-Encoding', 'deflate');
      stream = zlib.createDeflate();
    }
    
    if (stream) {
      stream.pipe(res);
      res.write = (chunk) => stream.write(chunk);
      res.end = (chunk) => {
        if (chunk) stream.write(chunk);
        stream.end();
      };
    }
    
    next();
  };
}

function authenticate(secret) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      res.error('unauthorized', 401);
      return;
    }
    
    const token = authHeader.slice(7);
    const payload = verifyJWT(token, secret);
    
    if (!payload) {
      res.error('invalid token', 401);
      return;
    }
    
    req.user = payload;
    next();
  };
}

const router = new Router();
const JWT_SECRET = 'your-secret-key-change-in-production';

const users = new Map();
const files = new Map();
const sseClients = new Set();

router.use(logger());
router.use(cors());
router.use(rateLimit(100, 60000));
router.use(compress());

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: Date.now()
  });
});

router.post('/auth/register', async (req, res) => {
  const body = await parseBody(req);
  const { username, password } = body;
  
  if (!username || !password) {
    res.error('username and password required', 400);
    return;
  }
  
  if (users.has(username)) {
    res.error('user already exists', 409);
    return;
  }
  
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  users.set(username, { username, password: hashedPassword });
  
  res.json({ message: 'user created' }, 201);
});

router.post('/auth/login', async (req, res) => {
  const body = await parseBody(req);
  const { username, password } = body;
  
  const user = users.get(username);
  if (!user) {
    res.error('invalid credentials', 401);
    return;
  }
  
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  if (user.password !== hashedPassword) {
    res.error('invalid credentials', 401);
    return;
  }
  
  const token = createJWT({ username }, JWT_SECRET);
  res.json({ token });
});

router.get('/profile', authenticate(JWT_SECRET), (req, res) => {
  res.json({ user: req.user });
});

router.get('/items', (req, res) => {
  const { search, limit = 10, offset = 0 } = req.query;
  let items = Array.from(files.values());
  
  if (search) {
    items = items.filter(item => item.filename?.includes(search));
  }
  
  const paginatedItems = items.slice(Number(offset), Number(offset) + Number(limit));
  
  res.json({
    items: paginatedItems,
    total: items.length,
    limit: Number(limit),
    offset: Number(offset)
  });
});

router.get('/items/:id', (req, res) => {
  const item = files.get(req.params.id);
  if (!item) {
    res.error('item not found', 404);
    return;
  }
  res.json(item);
});

router.delete('/items/:id', authenticate(JWT_SECRET), (req, res) => {
  if (!files.has(req.params.id)) {
    res.error('item not found', 404);
    return;
  }
  files.delete(req.params.id);
  res.json({ message: 'deleted' });
});

router.post('/upload', async (req, res) => {
  if (!req.headers['content-type']?.includes('multipart/form-data')) {
    res.error('multipart/form-data required', 400);
    return;
  }
  
  try {
    const parts = await parseMultipart(req);
    const uploadedFiles = [];
    
    for (const part of parts) {
      if (part.filename) {
        const id = crypto.randomBytes(16).toString('hex');
        const fileData = {
          id,
          filename: part.filename,
          size: part.data.length,
          uploadedAt: Date.now(),
          data: part.data
        };
        
        files.set(id, fileData);
        uploadedFiles.push({ id, filename: part.filename, size: part.data.length });
        
        notifySSE({ type: 'upload', file: { id, filename: part.filename } });
      }
    }
    
    res.json({ files: uploadedFiles }, 201);
  } catch (e) {
    res.error(e.message, 400);
  }
});

router.get('/download/:id', (req, res) => {
  const file = files.get(req.params.id);
  if (!file) {
    res.error('file not found', 404);
    return;
  }
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
  res.setHeader('Content-Length', file.data.length);
  res.end(file.data);
});

router.get('/events', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const client = { res, id: crypto.randomBytes(8).toString('hex') };
  sseClients.add(client);
  
  res.write('data: {"type":"connected"}\n\n');
  
  req.on('close', () => {
    sseClients.delete(client);
  });
});

function notifySSE(data) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.res.write(message);
  }
}

router.get('/stream', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');
  
  let count = 0;
  const interval = setInterval(() => {
    res.write(`chunk ${count++}\n`);
    
    if (count >= 10) {
      clearInterval(interval);
      res.end('stream complete\n');
    }
  }, 500);
  
  req.on('close', () => clearInterval(interval));
});

router.post('/webhook', async (req, res) => {
  const body = await parseBody(req);
  console.log('webhook received:', body);
  
  const signature = req.headers['x-signature'];
  if (signature) {
    const expectedSignature = crypto
      .createHmac('sha256', 'webhook-secret')
      .update(JSON.stringify(body))
      .digest('hex');
    
    if (signature !== expectedSignature) {
      res.error('invalid signature', 401);
      return;
    }
  }
  
  res.json({ received: true });
});

const server = http.createServer((req, res) => {
  router.handle(req, res);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
});

process.on('SIGTERM', () => {
  console.log('sigterm received, shutting down gracefully');
  server.close(() => {
    console.log('server closed');
    process.exit(0);
  });
  
  setTimeout(() => {
    console.error('forced shutdown');
    process.exit(1);
  }, 10000);
});

process.on('uncaughtException', (err) => {
  console.error('uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});