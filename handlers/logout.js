export default function logout(req, res) {
  req.session.destroy();
  return res.redirect('/login');
}