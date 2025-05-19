module.exports =
  (...allowed) => (req, res, next) =>
    allowed.includes(req.auth.role) ? next()
      : res.status(403).json({ message: 'Forbidden' });
