const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.task.deleteMany();
  await prisma.space.deleteMany();
  await prisma.project.deleteMany();

  // Projects
  const clawhub = await prisma.project.create({
    data: { name: 'ClawHub', description: 'ClawHub skill marketplace' }
  });

  const clawboard = await prisma.project.create({
    data: { name: 'ClawBoard', description: 'Kanban dashboard prototype' }
  });

  // Spaces for ClawHub
  await prisma.space.create({ data: { name: 'API Development', projectId: clawhub.id } });
  await prisma.space.create({ data: { name: 'Frontend', projectId: clawhub.id } });
  await prisma.space.create({ data: { name: 'Backend', projectId: clawhub.id } });

  const apiSpace = await prisma.space.findFirst({ where: { name: 'API Development', projectId: clawhub.id } });

  // Sample tasks for API Space
  await prisma.task.createMany({
    data: [
      { title: 'Fix API routes', description: 'Nested spaces/tasks endpoints', status: 'ToDo', priority: 'High', spaceId: apiSpace.id },
      { title: 'Add auth middleware', description: 'JWT for protected routes', status: 'In Progress', priority: 'High', spaceId: apiSpace.id },
      { title: 'Deploy to Vercel', description: 'Production build', status: 'Done', priority: 'Med', assignee: 'Máté', spaceId: apiSpace.id },
      { title: 'Seed sample data', description: 'Realistic projects/spaces/tasks', status: 'Done', priority: 'Low', spaceId: apiSpace.id },
      { title: 'CORS fixes', status: 'ToDo', priority: 'Med', spaceId: apiSpace.id },
      { title: 'Prisma migrations', status: 'In Progress', priority: 'High', spaceId: apiSpace.id },
      { title: 'Nginx proxy config', status: 'Done', priority: 'Med', spaceId: apiSpace.id },
      { title: 'Rate limiting', status: 'ToDo', priority: 'Low', spaceId: apiSpace.id }
    ]
  });

  console.log('Sample data seeded successfully!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
