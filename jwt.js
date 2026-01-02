import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";  

const app = express();
app.use(express.json());
app.use(cors());

app.post("/login", (req, res) => {
  const user = { id: "u123", role: "admin", name: "John Doe" };

  const token = jwt.sign(
    { role: user.role, name: user.name },
    "secret",
    { subject: user.id, expiresIn: "15m", issuer: "api" }
  );

  res.json({ accessToken: token });
});

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET, { issuer: "api" });
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: "invalid or expired token" });
  }
}

app.get("/admin", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "forbidden" });
  res.json({ ok: true, user: req.user });
});

app.listen(3000);
