const { BusinessProfile } = require('../models');
const fs = require('fs');
const path = require('path');

const businessController = {
  // Get current user's business profile
  getProfile: async (req, res) => {
    try {
      const profile = await BusinessProfile.findOne({
        where: { usuari_id: req.user.id }
      });

      if (!profile) {
        return res.status(404).json({ message: 'Perfil no trobat' });
      }

      res.json(profile);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Error al recuperar el perfil de negoci' });
    }
  },

  // Update current user's business profile
  updateProfile: async (req, res) => {
    try {
      const {
        nom, cognoms, nom_negoci, nif_cif, telefon,
        pais, adreca, ciutat, codi_postal, iva_defecte, irpf_defecte, serie_defecte
      } = req.body;

      let profile = await BusinessProfile.findOne({
        where: { usuari_id: req.user.id }
      });

      // Si no existeix el perfil (per si de cas), el creem
      if (!profile) {
        profile = await BusinessProfile.create({ usuari_id: req.user.id });
      }

      const updateData = {
        nom, cognoms, nom_negoci, nif_cif, telefon,
        pais, adreca, ciutat, codi_postal, 
        iva_defecte: iva_defecte ? parseFloat(iva_defecte) : profile.iva_defecte,
        irpf_defecte: irpf_defecte ? parseFloat(irpf_defecte) : profile.irpf_defecte,
        serie_defecte: serie_defecte || profile.serie_defecte
      };

      // Si s'ha pujat un nou logo a través de multer
      if (req.file) {
        // Eliminar el logo anterior si existia
        if (profile.logo_url) {
          const oldLogoPath = path.join(__dirname, '..', '..', profile.logo_url);
          if (fs.existsSync(oldLogoPath)) {
            fs.unlinkSync(oldLogoPath);
          }
        }
        updateData.logo_url = `/uploads/logos/${req.file.filename}`;
      }

      await profile.update(updateData);

      res.json({ message: 'Perfil actualitzat correctament', profile });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Error al actualitzar el perfil de negoci' });
    }
  }
};

module.exports = businessController;
