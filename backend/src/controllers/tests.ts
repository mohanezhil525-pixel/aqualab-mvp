import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { SampleStatus } from '@prisma/client';

export const batchEnterTests = async (req: AuthRequest, res: Response) => {
  try {
    const { sampleId, results } = req.body;
    // results: [{ parameterId: string, measuredValue: number }]

    const sample = await prisma.sample.findUnique({ where: { id: sampleId } });
    if (!sample) return res.status(404).json({ message: 'Sample not found' });

    for (const result of results) {
      const parameter = await prisma.parameter.findUnique({ where: { id: result.parameterId } });
      if (!parameter) continue;

      let isCompliant = true;
      if (parameter.minLimit !== null && result.measuredValue < parameter.minLimit) isCompliant = false;
      if (parameter.maxLimit !== null && result.measuredValue > parameter.maxLimit) isCompliant = false;

      await prisma.testResult.upsert({
        where: {
          sampleId_parameterId: { sampleId, parameterId: result.parameterId },
        },
        update: {
          measuredValue: result.measuredValue,
          isCompliant,
          testedById: req.user!.userId,
          testedAt: new Date(),
        },
        create: {
          sampleId,
          parameterId: result.parameterId,
          measuredValue: result.measuredValue,
          isCompliant,
          testedById: req.user!.userId,
        },
      });
    }

    // Auto-update sample status
    await prisma.sample.update({
      where: { id: sampleId },
      data: { status: SampleStatus.REVIEW_PENDING },
    });

    await prisma.auditLog.create({
      data: {
        entityType: 'Sample',
        entityId: sampleId,
        action: 'TEST_RESULTS_ENTERED',
        performedById: req.user!.userId,
        details: JSON.stringify({ count: results.length }),
      },
    });

    res.json({ message: 'Test results saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving test results', error });
  }
};
