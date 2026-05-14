const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, BusinessProfile } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const { sendEmail } = require('../services/emailService');

const authController = {
  register: async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
      const { email, password, rol } = req.body;
      const validRol = ['USER', 'ASSESSOR'].includes(rol) ? rol : 'USER';

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        await t.rollback();
        return res.status(400).json({ message: 'L\'usuari ja existeix' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({
        email,
        password_hash,
        rol: validRol,
      }, { transaction: t });

      // Create business profile
      await BusinessProfile.create({
        usuari_id: user.id
      }, { transaction: t });

      await t.commit();
      
      // Create JWT
      const token = jwt.sign(
        { id: user.id, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.status(201).json({
        message: 'Usuari registrat correctament',
        user: {
          id: user.id,
          email: user.email,
          rol: user.rol,
        },
      });
    } catch (error) {
      await t.rollback();
      console.error('Register error:', error);
      res.status(500).json({ message: 'Error al registrar l\'usuari' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check user existence
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: 'Credencials invàlides' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Credencials invàlides' });
      }

      // Create JWT
      const token = jwt.sign(
        { id: user.id, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({
        message: 'Login correcte',
        user: {
          id: user.id,
          email: user.email,
          rol: user.rol,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error al fer login' });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });
      
      // We always return the same message to avoid email enumeration
      const successMessage = 'Si el correu està registrat, rebràs un enllaç de recuperació en uns minuts.';

      if (!user) {
        return res.json({ message: successMessage });
      }

      // Create reset token (random string for the URL)
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Hash the token for the database
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      const resetExpires = Date.now() + 3600000; // 1 hour from now

      await user.update({
        reset_password_token: hashedToken,
        reset_password_expires: resetExpires
      });

      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

      await sendEmail({
        to: user.email,
        subject: 'Recuperació de contrasenya - FactureApp',
        text: `Has demanat restablir la teva contrasenya.\n\nFes clic al següent enllaç per completar el procés (caduca en 1 hora):\n\n${resetUrl}\n\nSi no ho has demanat tu, ignora aquest correu.\n`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2>Recuperació de contrasenya</h2>
            <p>Has demanat restablir la teva contrasenya de FactureApp.</p>
            <p>Fes clic al botó de sota per completar el procés (aquest enllaç caduca en 1 hora):</p>
            <div style="margin: 2rem 0;">
              <a href="${resetUrl}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Restablir contrasenya</a>
            </div>
            <p>Si no ho has demanat tu, ignora aquest correu.</p>
          </div>
        `
      });

      res.json({ message: successMessage });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Error al processar la sol·licitud' });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      // Hash the token from the URL to compare with the one in the DB
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const user = await User.findOne({
        where: {
          reset_password_token: hashedToken,
          reset_password_expires: { [Op.gt]: Date.now() }
        }
      });

      if (!user) {
        return res.status(400).json({ message: 'El token és invàlid o ha caducat' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      await user.update({
        password_hash,
        reset_password_token: null,
        reset_password_expires: null
      });

      res.json({ message: 'Contrasenya actualitzada correctament' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Error al restablir la contrasenya' });
    }
  },

  logout: async (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Sessió tancada correctament' });
  },

  checkAuth: async (req, res) => {
    try {
      const token = req.cookies.token;
      if (!token) return res.json(null);

      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment variables');
        return res.status(500).json({ message: 'Error de configuración del servidor (JWT)' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'email', 'rol']
      });
      
      if (!user) return res.json(null);
      res.json(user);
    } catch (error) {
      console.error('Check auth error:', error);
      // Return a proper error if it's not just a missing/expired token
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.json(null);
      }
      res.status(500).json({ message: 'Error de servidor en check-auth', error: error.message });
    }
  }
};

module.exports = authController;
