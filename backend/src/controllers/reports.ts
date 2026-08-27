import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { generateReportText } from '../services/reportGenerator';
import { SampleStatus } from '@prisma/client';

export const downloadReport = async (req: AuthRequest, res: Response) => {
  try {
    const { sampleId } = req.params;

    const sample = await prisma.sample.findUnique({ where: { id: sampleId } });
    if (!sample) return res.status(404).json({ message: 'Sample not found' });

    const testResults = await prisma.testResult.findMany({
      where: { sampleId },
      include: { parameter: true },
    });

    // Finalize report generation
    await prisma.sample.update({
      where: { id: sampleId },
      data: { status: SampleStatus.COMPLETED },
    });

    const reportText = generateReportText(sample, testResults, req.user!.name || 'System');

    await prisma.auditLog.create({
      data: {
        entityType: 'Report',
        entityId: sampleId,
        action: 'REPORT_GENERATED',
        performedById: req.user!.userId,
        details: JSON.stringify({ status: 'COMPLETED', format: 'text' }),
      },
    });

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=report-${sample.sampleNumber}.txt`);
    res.send(reportText);
  } catch (error) {
    res.status(500).json({ message: 'Error generating report', error });
  }
};
