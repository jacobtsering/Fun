// Seed script to create test data for the time study application
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed the database...');

  // Create test company
  const company = await prisma.company.create({
    data: {
      name: 'Test Manufacturing Inc.',
    },
  });
  console.log(`Created company: ${company.name}`);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      badgeId: 'ADMIN001',
      name: 'Admin User',
      role: 'admin',
      companyId: company.id,
    },
  });
  console.log(`Created admin user: ${admin.name}`);

  // Create operator users
  const operator1 = await prisma.user.create({
    data: {
      badgeId: 'OP001',
      name: 'Operator One',
      role: 'operator',
      companyId: company.id,
    },
  });
  console.log(`Created operator user: ${operator1.name}`);

  const operator2 = await prisma.user.create({
    data: {
      badgeId: 'OP002',
      name: 'Operator Two',
      role: 'operator',
      companyId: company.id,
    },
  });
  console.log(`Created operator user: ${operator2.name}`);

  // Create sample processes
  const process1 = await prisma.process.create({
    data: {
      name: 'LED Coin Circuit Assembly',
      companyId: company.id,
    },
  });
  console.log(`Created process: ${process1.name}`);

  const process2 = await prisma.process.create({
    data: {
      name: 'Cylinder Lantern Assembly',
      companyId: company.id,
    },
  });
  console.log(`Created process: ${process2.name}`);

  // Create operations for process 1
  const operations1 = [
    {
      processId: process1.id,
      operationId: 'OP001',
      description: 'Apply copper tape strips to base rails',
      standardTimeSeconds: 60,
      toolsRequired: 'Scissors',
      qualityCheck: 'Tape applied evenly without wrinkles',
      sequenceNumber: 0,
    },
    {
      processId: process1.id,
      operationId: 'OP002',
      description: 'Prepare battery leads by removing covers from ends',
      standardTimeSeconds: 45,
      toolsRequired: 'Wire strippers',
      qualityCheck: 'Clean cuts with no damage to wires',
      sequenceNumber: 1,
    },
    {
      processId: process1.id,
      operationId: 'OP003',
      description: 'Attach battery leads to base rails with copper tape',
      standardTimeSeconds: 30,
      toolsRequired: 'Scissors',
      qualityCheck: 'Secure connection to rails',
      sequenceNumber: 2,
    },
    {
      processId: process1.id,
      operationId: 'OP004',
      description: 'Insert LED legs through coin holes and fold to match lines',
      standardTimeSeconds: 45,
      toolsRequired: null,
      qualityCheck: 'LED legs properly folded along coin lines',
      sequenceNumber: 3,
    },
    {
      processId: process1.id,
      operationId: 'OP005',
      description: 'Tape LED legs down with copper tape on etched rectangles',
      standardTimeSeconds: 45,
      toolsRequired: 'Scissors',
      qualityCheck: 'LED legs secured with tape',
      sequenceNumber: 4,
    },
  ];

  await prisma.operation.createMany({
    data: operations1,
  });
  console.log(`Created ${operations1.length} operations for process 1`);

  // Create operations for process 2
  const operations2 = [
    {
      processId: process2.id,
      operationId: 'OP001',
      description: 'Position cylinder lantern piece with stickers facing up',
      standardTimeSeconds: 20,
      toolsRequired: null,
      qualityCheck: 'Stickers facing correct direction',
      sequenceNumber: 0,
    },
    {
      processId: process2.id,
      operationId: 'OP002',
      description: 'Fold in half lengthwise to create initial crease',
      standardTimeSeconds: 25,
      toolsRequired: null,
      qualityCheck: 'Even fold along entire length',
      sequenceNumber: 1,
    },
    {
      processId: process2.id,
      operationId: 'OP003',
      description: 'Trim end next to slots as marked',
      standardTimeSeconds: 30,
      toolsRequired: 'Scissors',
      qualityCheck: 'Clean cuts preserving slots',
      sequenceNumber: 2,
    },
    {
      processId: process2.id,
      operationId: 'OP004',
      description: 'Cut 6-10 evenly spaced slits in folded edge',
      standardTimeSeconds: 60,
      toolsRequired: 'Scissors',
      qualityCheck: 'Even spacing between slits',
      sequenceNumber: 3,
    },
    {
      processId: process2.id,
      operationId: 'OP005',
      description: 'Unfold the piece completely',
      standardTimeSeconds: 15,
      toolsRequired: null,
      qualityCheck: 'Paper unfolded without damage',
      sequenceNumber: 4,
    },
  ];

  await prisma.operation.createMany({
    data: operations2,
  });
  console.log(`Created ${operations2.length} operations for process 2`);

  // Give operators access to processes
  await prisma.operatorProcessAccess.create({
    data: {
      userId: operator1.id,
      processId: process1.id,
    },
  });
  console.log(`Gave ${operator1.name} access to ${process1.name}`);

  await prisma.operatorProcessAccess.create({
    data: {
      userId: operator1.id,
      processId: process2.id,
    },
  });
  console.log(`Gave ${operator1.name} access to ${process2.name}`);

  await prisma.operatorProcessAccess.create({
    data: {
      userId: operator2.id,
      processId: process1.id,
    },
  });
  console.log(`Gave ${operator2.name} access to ${process1.name}`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
