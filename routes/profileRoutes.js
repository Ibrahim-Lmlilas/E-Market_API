const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middlewares/auth');
const validator = require('../middlewares/validationMiddleware');
const { updateprofile, passwordSchema } = require('../utils/validationSchema');

/**
 * @swagger
 * /api/profile/edit:
 *   put:
 *     summary: Update user profile
 *     description: Allows the authenticated user to edit their personal profile information.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               phone:
 *                 type: string
 *                 example: "+212612345678"
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       400:
 *         description: Invalid input data.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Server error.
 */
router.put(
  '/v2/edit',
  protect,
  validator.validate(updateprofile),
  async (req, res) => {
    const controller = new profileController();
    try {
      await controller.editProfile(req, res);
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @swagger
 * /api/profile/change-password:
 *   put:
 *     summary: Change user password
 *     description: Allows the authenticated user to change their password by providing the old and new password.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "OldPassword123"
 *               newPassword:
 *                 type: string
 *                 example: "NewPassword456"
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *       400:
 *         description: Invalid password or input.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Server error.
 */
router.put(
  '/v2/change-password',
  protect,
  validator.validate(passwordSchema),
  async (req, res) => {
    try {
      const controller = new profileController();
      await controller.changePassword(req, res);
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Get current user profile
 *     description: Returns profile information of the currently authenticated user.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Server error.
 */
router.get('/v2/me', protect, async (req, res) => {
  try {
    const controller = new profileController();
    await controller.getProfile(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
