const router = require('express').Router();
const controller = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/auth');

router.use(protect, requireAdmin);
router.get('/overview', controller.overview);
router.get('/users', controller.listUsers);
router.patch('/users/:id', controller.updateUser);
router.patch('/users/:id/suspension', controller.setUserSuspension);
router.get('/moderation', controller.listModeration);
router.patch('/moderation/tributes/:id', controller.moderateTribute);
router.patch('/moderation/media/:id', controller.moderateMedia);
router.get('/designs', controller.listDesigns);
router.get('/reminders', controller.listReminders);
module.exports = router;
