export default function handler(req, res) {
  if (!req.session.userid) {
    return res.redirect('/login');
  }

  res.setHeader('Content-Type', 'text/HTML');
  res.end(`
    <h1>Welcome ${req.session.userid}</h1>
    <form action="/logout" method="POST">
      <button type="submit">Logout</button>
    </form>
  `);
}