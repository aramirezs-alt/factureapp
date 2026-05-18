const fs = require('fs');
const path = require('path');

const dict = {
  "Inicia sesión en tu cuenta": "Inicia sessió al teu compte",
  "Contraseña": "Mot de pas",
  "¿Has olvidado la contraseña?": "Has oblidat el mot de pas?",
  "Entrar en el Panel": "Entrar al Tauler",
  "¿No tienes cuenta?": "No tens compte?",
  "Regístrate gratis": "Registra't gratis",
  "ejemplo@correo.com": "exemple@correu.com",
  "Crea tu cuenta gratuita": "Crea el teu compte gratuït",
  "Nombre completo": "Nom complet",
  "Confirmar Contraseña": "Confirmar Mot de pas",
  "Crear Cuenta": "Crear Compte",
  "¿Ya tienes cuenta?": "Ja tens compte?",
  "Inicia sesión": "Inicia sessió",
  "Las contraseñas no coinciden": "Els mots de pas no coincideixen",
  "Error al crear cuenta": "Error al crear compte",
  "Recuperar Contraseña": "Recuperar Mot de pas",
  "Te enviaremos un enlace para restablecerla": "T'enviarem un enllaç per restablir-lo",
  "Enviar enlace": "Enviar enllaç",
  "Volver al inicio de sesión": "Tornar a l'inici de sessió",
  "Restablecer Contraseña": "Restablir Mot de pas",
  "Introduce tu nueva contraseña": "Introdueix el teu nou mot de pas",
  "Actualizar Contraseña": "Actualitzar Mot de pas",
  "Correo electrónico": "Correu electrònic"
};

const files = [
  'frontend/src/pages/Login.jsx',
  'frontend/src/pages/Register.jsx',
  'frontend/src/pages/ForgotPassword.jsx',
  'frontend/src/pages/ResetPassword.jsx',
  'frontend/src/pages/Landing.jsx',
  'frontend/src/components/Layout.jsx'
];

files.forEach(f => {
  const file = path.join(__dirname, f);
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    for (const [es, ca] of Object.entries(dict)) {
      content = content.replaceAll(es, ca);
    }
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated ${f}`);
    }
  }
});
