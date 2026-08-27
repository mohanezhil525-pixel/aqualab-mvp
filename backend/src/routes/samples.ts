import { Router } from 'express';
import { createSample, getSamples } from '../controllers/samples';
import { authenticate } from '../middleware/auth';
import { authorize as roleGuard } from '../middleware/roleGuard';

const router = Router();

router.use(authenticate);

router.post('/', roleGuard(['ADMIN', 'MANAGER', 'LAB_TECH']), createSample);
router.get('/', getSamples);

export default router;
