import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { verifyRateLimiter } from '../middleware/rateLimiter';
import * as credentialController from '../controllers/credentialController';

const router = Router();

router.post('/issue', authenticate, credentialController.issueCredential);
router.get('/', authenticate, credentialController.getCredentials);
router.post('/share', authenticate, credentialController.shareCredential);

router.get('/share/:token', credentialController.getSharedPresentation);
router.post('/verify', verifyRateLimiter, credentialController.verifyCredential);

export default router;
