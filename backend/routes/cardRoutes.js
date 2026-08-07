const router = require('express').Router();
const controller = require('../controllers/cardController');
const { protect } = require('../middleware/auth');

router.get('/search', controller.search);
router.get('/public/:id', controller.publicCard);
router.get('/mine', protect, controller.listMine);
router.post('/', protect, controller.create);
router.get('/:id', protect, controller.getMine);
router.patch('/:id', protect, controller.update);
router.delete('/:id', protect, controller.remove);
module.exports = router;
