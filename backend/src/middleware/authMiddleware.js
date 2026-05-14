const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Get token from header or query string
  const authHeader = req.header('Authorization');
  let token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token && req.cookies) {
    token = req.cookies.token;
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No s\'ha proporcionat cap token.' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
