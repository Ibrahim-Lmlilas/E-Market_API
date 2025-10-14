const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middlewares/auth');

router.put('/edit', protect, async (req, res) => {
    const controller = new profileController();
  try {
    await controller.editProfile(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.put('/change-password', protect, async (req, res) => {
  try {
    const controller = new ProfileController();
    await controller.changePassword(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
module.exports = router;