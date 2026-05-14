const { body } = require('express-validator');

const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Has de proporcionar un correu electrònic vàlid')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contrasenya ha de tenir almenys 6 caràcters'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Has de proporcionar un correu electrònic vàlid')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contrasenya és obligatòria'),
];

module.exports = {
  registerValidation,
  loginValidation,
};
