export default function login(req, res) {
  if (req.session.userid) {
    return res.redirect('/');
  }

  res.setHeader('Content-Type', 'text/HTML');
  res.end(`
    <h1>Login</h1>
    <form action="/process-login" method="POST">
      <input type="text" name="username" placeholder="Username" required>
      <input type="password" name="password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>
  `);
}