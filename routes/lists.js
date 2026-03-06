const router = require('express').Router();
const auth = require('../middleware/auth');
const listCtrl = require('../controllers/listController');
const itemCtrl = require('../controllers/itemController');

router.get('/', auth, listCtrl.getMyLists);
router.post('/', auth, listCtrl.createList);
router.post('/join', auth, listCtrl.joinList);
router.get('/:listId', auth, listCtrl.getList);
router.patch('/:listId', auth, listCtrl.updateList);
router.delete('/:listId', auth, listCtrl.deleteList);
router.post('/:listId/leave', auth, listCtrl.leaveList);
router.post('/:listId/remove-member', auth, listCtrl.removeMember);
router.post('/:listId/regenerate-code', auth, listCtrl.regenerateInviteCode);

router.get('/:listId/items', auth, itemCtrl.getItems);
router.post('/:listId/items', auth, itemCtrl.addItem);
router.post('/:listId/items/clear-completed', auth, itemCtrl.clearCompleted);
router.patch('/:listId/items/:itemId', auth, itemCtrl.updateItem);
router.delete('/:listId/items/:itemId', auth, itemCtrl.deleteItem);

module.exports = router;
