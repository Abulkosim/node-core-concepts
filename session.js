import express from "express";
import sessions from "express-session";
import handler from "./handlers/handler.js";
import login from "./handlers/login.js";
import processLogin from "./handlers/process-login.js";
import logout from "./handlers/logout.js";

const app = express();

app.use(sessions({
  secret:'1234567890',
  name: 'session_id',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30,
  },
  resave: false,
  saveUninitialized: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", handler);
app.get("/logout", logout);
app.get("/login", login);
app.post("/process-login", processLogin);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});