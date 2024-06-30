import { Router } from 'express'
import { signin, signup, verify_user_exist } from './users.controller.js';
const router = Router();

router.post('/signin', signin)
router.post('/signup', signup)
router.post('/verify', verify_user_exist)

export default router;