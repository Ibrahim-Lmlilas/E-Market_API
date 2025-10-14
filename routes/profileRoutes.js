const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middlewares/auth');
const validator = require('../middlewares/validationMiddleware');
const {userSchema} = require('../utils/validationSchema');

router.put('/edit', protect,validator.validate(userSchema), async (req, res) => {
    const controller = new profileController();
  try {
    await controller.editProfile(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.put('/change-password', protect,validator.validate(userSchema), async (req, res) => {
  try {
    const controller = new profileController();
    await controller.changePassword(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
module.exports = router;