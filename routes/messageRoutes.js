import express from 'express'
import { composeMessage, deletedAllMessages, deleteMessageById, getMessageById, getAllStarredMessages, inboxMessages, markAsRead, notifications, SenderMessages, toggleStarMessageById, toogleSnoozedMessageById } from '../controllers/messageController.js'
import isAuthenticated from '../middleware/isAuthenticated.js'

const router = express.Router()


router.post('/compose',isAuthenticated, composeMessage)
router.get('/inbox',isAuthenticated, inboxMessages)
router.get('/send',isAuthenticated, SenderMessages)
router.get('/notification',isAuthenticated, notifications)
router.get('/starred', isAuthenticated, getAllStarredMessages)
router.get('/:id',isAuthenticated, getMessageById)
router.patch('/:id/read',isAuthenticated, markAsRead)
router.patch('/:id/toggle-star',isAuthenticated, toggleStarMessageById)
router.patch('/:id/toggle-snooze', isAuthenticated, toogleSnoozedMessageById)
router.delete('/:id/delete',isAuthenticated, deleteMessageById)
router.delete('/delete-all', isAuthenticated, deletedAllMessages)

export default router; 