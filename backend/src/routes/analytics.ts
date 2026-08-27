import { Router } from 'express';
import { getComplianceStats, getAuditLogs } from '../controllers/analytics';
import { authenticate } from '../middleware/auth';
import { authorize as roleGuard } from '../middleware/roleGuard';

const router = Router();

router.use(authenticate);

router.get('/compliance', roleGuard(['ADMIN', 'MANAGER']), getComplianceStats);
router.get('/audit', roleGuard(['ADMIN', 'MANAGER']), getAuditLogs);

export default router;
