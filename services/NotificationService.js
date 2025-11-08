const Notification = require('../models/Notification');

class NotificationService {
  static async addNotification(user_id, message) {
    try {
      const notification = new Notification({
        user_id,
        message,
      });
      await notification.save();
    } catch (error) {
      console.error(
        "Erreur lors de l'ajout de la notification:",
        error.message
      );
    }
  }
}

module.exports = NotificationService;
