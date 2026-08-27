import { PrismaClient, Role, SampleType, SampleStatus, ParameterCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Create standard parameters
  const parameters = [
    { name: 'pH', unit: 'pH', minLimit: 6.5, maxLimit: 8.5, category: ParameterCategory.PHYSICAL },
    { name: 'Turbidity', unit: 'NTU', minLimit: 0, maxLimit: 5, category: ParameterCategory.PHYSICAL },
    { name: 'Conductivity', unit: 'µS/cm', minLimit: 50, maxLimit: 1500, category: ParameterCategory.PHYSICAL },
    { name: 'Total Dissolved Solids', unit: 'mg/L', minLimit: 0, maxLimit: 500, category: ParameterCategory.PHYSICAL },
    { name: 'Hardness', unit: 'mg/L', minLimit: 0, maxLimit: 200, category: ParameterCategory.PHYSICAL },
    { name: 'Temperature', unit: '°C', minLimit: 0, maxLimit: 30, category: ParameterCategory.PHYSICAL },
    
    { name: 'Lead', unit: 'mg/L', minLimit: 0, maxLimit: 0.01, category: ParameterCategory.HEAVY_METALS },
    { name: 'Arsenic', unit: 'mg/L', minLimit: 0, maxLimit: 0.01, category: ParameterCategory.HEAVY_METALS },
    { name: 'Copper', unit: 'mg/L', minLimit: 0, maxLimit: 1.3, category: ParameterCategory.HEAVY_METALS },
    
    { name: 'Nitrates', unit: 'mg/L', minLimit: 0, maxLimit: 10, category: ParameterCategory.CHEMICAL },
    { name: 'Fluoride', unit: 'mg/L', minLimit: 0, maxLimit: 1.5, category: ParameterCategory.CHEMICAL },
    { name: 'Iron', unit: 'mg/L', minLimit: 0, maxLimit: 0.3, category: ParameterCategory.CHEMICAL },
    { name: 'Free Chlorine', unit: 'mg/L', minLimit: 0.2, maxLimit: 4.0, category: ParameterCategory.CHEMICAL },
    { name: 'Residual Chlorine', unit: 'mg/L', minLimit: 0.2, maxLimit: 4.0, category: ParameterCategory.CHEMICAL },
    
    { name: 'E. coli', unit: 'CFU/100mL', minLimit: 0, maxLimit: 0, category: ParameterCategory.MICROBIOLOGICAL },
    { name: 'Coliform', unit: 'CFU/100mL', minLimit: 0, maxLimit: 0, category: ParameterCategory.MICROBIOLOGICAL },
    { name: 'Legionella', unit: 'CFU/L', minLimit: 0, maxLimit: 1000, category: ParameterCategory.MICROBIOLOGICAL },
  ];

  for (const param of parameters) {
    await prisma.parameter.upsert({
      where: { name: param.name },
      update: { category: param.category, minLimit: param.minLimit, maxLimit: param.maxLimit },
      create: param,
    });
  }

  // 2. Create users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@waterlab.com' },
    update: {},
    create: {
      email: 'admin@waterlab.com',
      passwordHash,
      name: 'System Admin',
      role: Role.ADMIN,
    },
  });

  const labTech = await prisma.user.upsert({
    where: { email: 'tech@waterlab.com' },
    update: {},
    create: {
      email: 'tech@waterlab.com',
      passwordHash,
      name: 'Jane Technician',
      role: Role.LAB_TECH,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@waterlab.com' },
    update: {},
    create: {
      email: 'manager@waterlab.com',
      passwordHash,
      name: 'John Manager',
      role: Role.MANAGER,
    },
  });

  // 3. Create 20 Mock Samples
  const sampleTypes = [
    SampleType.DRINKING_WATER, SampleType.INDUSTRIAL, SampleType.WASTEWATER, 
    SampleType.GROUNDWATER, SampleType.SURFACE_WATER, SampleType.RESERVOIR
  ];
  
  const locations = [
    'City Reservoir Alpha', 'East Wing Well #4', 'Industrial Runoff Site B', 
    'Westside Treatment Plant', 'Downtown Tap Water', 'Lake Clearwater Station'
  ];

  for (let i = 1; i <= 20; i++) {
    const sampleNumber = `WTR-2026-${i.toString().padStart(4, '0')}`;
    const type = sampleTypes[i % sampleTypes.length];
    const loc = locations[i % locations.length];
    
    // Status distribution
    const status = i < 5 ? SampleStatus.RECEIVED : 
                  (i < 8 ? SampleStatus.IN_TESTING : 
                  (i < 12 ? SampleStatus.REVIEW_PENDING : SampleStatus.COMPLETED));

    const sample = await prisma.sample.upsert({
      where: { sampleNumber },
      update: { status, sampleType: type, sourceLocation: loc },
      create: {
        sampleNumber,
        clientName: `Client ${Math.ceil(i/3)}`,
        clientContact: `client${Math.ceil(i/3)}@example.com`,
        sourceLocation: loc,
        sampleType: type,
        collectionDate: new Date(Date.now() - i * 86400000), // past days
        status,
        createdById: admin.id,
      },
    });

    // Generate historical tests and reports for COMPLETED samples
    if (status === SampleStatus.COMPLETED) {
      const dbParams = await prisma.parameter.findMany();
      // Test 3 random params
      const testParams = [dbParams[0], dbParams[1], dbParams[6]]; 
      
      for (const p of testParams) {
        // Random measured value
        const isFailing = Math.random() > 0.8;
        const value = isFailing ? (p.maxLimit || 1) * 1.5 : (p.minLimit || 0) + ((p.maxLimit || 1) - (p.minLimit || 0)) * 0.5;
        
        await prisma.testResult.upsert({
          where: { sampleId_parameterId: { sampleId: sample.id, parameterId: p.id } },
          update: {},
          create: {
            sampleId: sample.id,
            parameterId: p.id,
            measuredValue: parseFloat(value.toFixed(2)),
            isCompliant: !isFailing,
            testedById: labTech.id,
            testedAt: new Date(Date.now() - (i-1) * 86400000),
          }
        });
      }

      await prisma.report.upsert({
        where: { sampleId: sample.id },
        update: {},
        create: {
          sampleId: sample.id,
          generatedById: manager.id,
          pdfUrl: `/api/reports/${sample.id}/download`,
          generatedAt: new Date(Date.now() - (i-2) * 86400000)
        }
      });

      await prisma.auditLog.create({
        data: {
          entityType: 'Report',
          entityId: sample.id,
          action: 'REPORT_GENERATED',
          performedById: manager.id,
          details: JSON.stringify({ status: 'COMPLETED', format: 'text' }),
        }
      });
    }
  }

  console.log('Seeding completed successfully with extended mock data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
