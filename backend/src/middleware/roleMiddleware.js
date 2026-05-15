const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticat' });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ 
        message: `Accés denegat per al rol: ${req.user.rol}. Aquesta acció requereix: ${allowedRoles.join(' o ')}` 
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
