const router = require('express').Router();
const controller = require('../controllers/guestbookController');
const { protect } = require('../middleware/auth');

router.get('/card/:cardId', controller.listPublic);
router.post('/card/:cardId', controller.create);
router.get('/owner/card/:cardId', protect, controller.listMine);
router.patch('/:entryId', protect, controller.moderate);
router.delete('/:entryId', protect, controller.remove);
module.exports = router;
