const { validationResult } = require('express-validator');

/**
 * Middleware to handle validation results.
 * If there are errors, it returns a 400 response with the errors list.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Error de validació',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

module.exports = validate;
