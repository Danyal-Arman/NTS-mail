import express from 'express'
import { composeMessage, deletedAllMessages, deleteMessageById, getMessageById, getAllStarredMessages, inboxMessages, markAsRead, notifications, SenderMessages, toggleStarMessageById, bulkDeleteMessages, bulkStarMessages, bulkUnStarMessages } from '../controllers/messageController.js'
import isAuthenticated from '../middleware/isAuthenticated.js'

const router = express.Router()


router.post('/compose',isAuthenticated, composeMessage)
router.get('/inbox',isAuthenticated, inboxMessages)
router.get('/send',isAuthenticated, SenderMessages)
router.get('/starred', isAuthenticated, getAllStarredMessages)
router.get('/notification',isAuthenticated, notifications)
router.patch('/bulk-star', isAuthenticated, bulkStarMessages)
router.patch('/bulk-unstar', isAuthenticated, bulkUnStarMessages)
router.delete('/delete-all', isAuthenticated, deletedAllMessages)
router.delete('/bulk-delete', isAuthenticated, bulkDeleteMessages)
router.get('/:id',isAuthenticated, getMessageById)
router.patch('/:id/read',isAuthenticated, markAsRead)
router.patch('/:id/toggle-star',isAuthenticated, toggleStarMessageById)
router.delete('/:id/delete',isAuthenticated, deleteMessageById)

export default router; 