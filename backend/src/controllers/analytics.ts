import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getComplianceStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalTests = await prisma.testResult.count();
    const nonCompliantTests = await prisma.testResult.count({ where: { isCompliant: false } });
    
    const nonComplianceRate = totalTests > 0 ? (nonCompliantTests / totalTests) * 100 : 0;

    const parameterBreaches = await prisma.testResult.groupBy({
      by: ['parameterId'],
      where: { isCompliant: false },
      _count: { isCompliant: true },
    });

    const enrichedBreaches = await Promise.all(
      parameterBreaches.map(async (b) => {
        const param = await prisma.parameter.findUnique({ where: { id: b.parameterId } });
        return {
          name: param?.name,
          count: b._count.isCompliant,
        };
      })
    );

    const pipelineStatus = await prisma.sample.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    res.json({
      nonComplianceRate: nonComplianceRate.toFixed(2),
      parameterBreaches: enrichedBreaches,
      pipelineStatus: pipelineStatus.map(p => ({ status: p.status, count: p._count.status })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error });
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { performedBy: { select: { name: true, role: true } } },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs', error });
  }
};
