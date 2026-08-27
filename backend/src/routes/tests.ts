import { Router } from 'express';
import { batchEnterTests } from '../controllers/tests';
import { authenticate } from '../middleware/auth';
import { authorize as roleGuard } from '../middleware/roleGuard';

const router = Router();

router.use(authenticate);

router.post('/batch', roleGuard(['ADMIN', 'LAB_TECH']), batchEnterTests);

export default router;
