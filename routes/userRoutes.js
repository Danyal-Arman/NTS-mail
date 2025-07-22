import express from 'express'
import isAuthenticated from '../middleware/isAuthenticated.js'
import { getUser } from '../controllers/userController.js'

const router = express.Router()

router.get("/get", isAuthenticated, getUser )

export default router