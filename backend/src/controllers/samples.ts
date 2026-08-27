import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { publishEvent } from '../services/alertService';
import { SampleType, SampleStatus } from '@prisma/client';

export const createSample = async (req: AuthRequest, res: Response) => {
  try {
    const { clientName, clientContact, sourceLocation, sampleType } = req.body;
    
    // Generate sequential ID: WTR-2026-XXXX
    const count = await prisma.sample.count();
    const sampleNumber = `WTR-2026-${(count + 1).toString().padStart(4, '0')}`;

    const sample = await prisma.sample.create({
      data: {
        sampleNumber,
        clientName,
        clientContact,
        sourceLocation,
        sampleType: sampleType as SampleType,
        collectionDate: new Date(),
        status: SampleStatus.RECEIVED,
        createdById: req.user!.userId,
      },
    });

    await prisma.auditLog.create({
      data: {
        entityType: 'Sample',
        entityId: sample.id,
        action: 'CREATED',
        performedById: req.user!.userId,
        details: JSON.stringify({ sampleNumber }),
      },
    });

    publishEvent('sample:registered', { sampleId: sample.id, sampleNumber });

    res.status(201).json(sample);
  } catch (error) {
    res.status(500).json({ message: 'Error creating sample', error });
  }
};

export const getSamples = async (req: AuthRequest, res: Response) => {
  try {
    const samples = await prisma.sample.findMany({
      include: {
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(samples);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching samples', error });
  }
};
