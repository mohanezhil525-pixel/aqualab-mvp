import { Router } from 'express';
import { downloadReport } from '../controllers/reports';
import { authenticate } from '../middleware/auth';
import { authorize as roleGuard } from '../middleware/roleGuard';

const router = Router();

router.use(authenticate);

router.get('/:sampleId/download', roleGuard(['ADMIN', 'MANAGER', 'CLIENT']), downloadReport);

export default router;
