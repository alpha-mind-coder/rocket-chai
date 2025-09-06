function isAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  res.status(403).send("Access denied");
}

module.exports = isAdmin;