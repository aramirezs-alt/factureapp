const { Notification } = require('../models');

const notificationController = {
  getAll: async (req, res) => {
    try {
      const notifications = await Notification.findAll({
        where: { usuari_id: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 20
      });
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving notifications' });
    }
  },

  markAsRead: async (req, res) => {
    try {
      await Notification.update(
        { llegida: true },
        { where: { id: req.params.id, usuari_id: req.user.id } }
      );
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating notification' });
    }
  },

  markAllAsRead: async (req, res) => {
    try {
      await Notification.update(
        { llegida: true },
        { where: { usuari_id: req.user.id } }
      );
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating notifications' });
    }
  },

  delete: async (req, res) => {
    try {
      await Notification.destroy({
        where: { id: req.params.id, usuari_id: req.user.id }
      });
      res.json({ message: 'Notification deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting notification' });
    }
  }
};

module.exports = notificationController;
