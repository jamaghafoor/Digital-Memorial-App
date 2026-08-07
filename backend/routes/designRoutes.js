const router = require('express').Router();
const controller = require('../controllers/designController');
const { protect, requireAdmin } = require('../middleware/auth');
router.get('/', controller.list);
router.post('/', protect, requireAdmin, controller.create);
router.patch('/:id', protect, requireAdmin, controller.update);
router.delete('/:id', protect, requireAdmin, controller.remove);
module.exports = router;
