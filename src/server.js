require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const STARTED_AT = new Date().toISOString();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8443', 'https://pookie.matekolonics.com:8443', 'https://localhost:8443'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('X-ClawJira-Pid', String(process.pid));
  res.set('X-ClawJira-Started-At', STARTED_AT);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ PROJECTS ============
app.post('/projects', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });

    const project = await prisma.project.create({
      data: { name, description }
    });
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany();
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.get('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

app.put('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const project = await prisma.project.update({
      where: { id },
      data: { name, description }
    });
    res.json(project);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Project not found' });
    console.error(error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Project not found' });
    console.error(error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ============ PROJECT-SPECIFIC SPACES ============
app.get('/projects/:projectId/spaces', async (req, res) => {
  try {
    const { projectId } = req.params;
    const spaces = await prisma.space.findMany({
      where: { projectId }
    });
    res.json(spaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch spaces for project' });
  }
});

app.post('/projects/:projectId/spaces', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const space = await prisma.space.create({
      data: { name, projectId }
    });
    res.status(201).json(space);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create space' });
  }
});

// ============ SPACES ============
app.post('/spaces', async (req, res) => {
  try {
    const { name, projectId } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });

    const space = await prisma.space.create({
      data: { name, projectId }
    });
    res.status(201).json(space);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create space' });
  }
});

app.get('/spaces', async (req, res) => {
  try {
    const spaces = await prisma.space.findMany();
    res.json(spaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch spaces' });
  }
});

app.get('/spaces/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const space = await prisma.space.findUnique({ where: { id } });
    if (!space) return res.status(404).json({ error: 'Space not found' });
    res.json(space);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch space' });
  }
});

app.put('/spaces/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, projectId } = req.body;
    const space = await prisma.space.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        projectId: projectId !== undefined ? projectId : undefined,
      }
    });
    res.json(space);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Space not found' });
    console.error(error);
    res.status(500).json({ error: 'Failed to update space' });
  }
});

app.delete('/spaces/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.space.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Space not found' });
    console.error(error);
    res.status(500).json({ error: 'Failed to delete space' });
  }
});

app.get('/spaces/:id/count', async (req, res) => {
  try {
    const { id } = req.params;
    const count = await prisma.task.count({ where: { spaceId: id } });
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch task count' });
  }
});

app.put('/projects/:projectId/spaces/:spaceId', async (req, res) => {
  try {
    const { projectId, spaceId } = req.params;
    const { name } = req.body;

    const existing = await prisma.space.findFirst({ where: { id: spaceId, projectId } });
    if (!existing) return res.status(404).json({ error: 'Space not found in project' });

    const updated = await prisma.space.update({
      where: { id: spaceId },
      data: { name: name !== undefined ? name : undefined }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update space' });
  }
});

app.delete('/projects/:projectId/spaces/:spaceId', async (req, res) => {
  try {
    const { projectId, spaceId } = req.params;

    const existing = await prisma.space.findFirst({ where: { id: spaceId, projectId } });
    if (!existing) return res.status(404).json({ error: 'Space not found in project' });

    await prisma.space.delete({ where: { id: spaceId } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete space' });
  }
});

// ============ TASKS ============
app.post('/tasks', async (req, res) => {
  try {
    const { title, desc, description, status, priority, assignee, spaceId } = req.body;
    if (!title) return res.status(400).json({ error: 'Missing title' });

    const task = await prisma.task.create({
      data: {
        title,
        description: description ?? desc,
        status,
        priority,
        assignee,
        spaceId
      }
    });
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

app.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, desc, description, status, priority, assignee, spaceId } = req.body;
    const task = await prisma.task.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : (desc !== undefined ? desc : undefined),
        status: status !== undefined ? status : undefined,
        priority: priority !== undefined ? priority : undefined,
        assignee: assignee !== undefined ? assignee : undefined,
        spaceId: spaceId !== undefined ? spaceId : undefined
      }
    });
    res.json(task);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Task not found' });
    console.error(error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Task not found' });
    console.error(error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ============ SPACE-SPECIFIC TASKS ============
app.get('/spaces/:spaceId/tasks', async (req, res) => {
  try {
    const { spaceId } = req.params;
    const tasks = await prisma.task.findMany({
      where: { spaceId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tasks for space' });
  }
});

app.post('/spaces/:spaceId/tasks', async (req, res) => {
  try {
    const { spaceId } = req.params;
    const { title, desc, description, status, priority, assignee } = req.body;
    if (!title) return res.status(400).json({ error: 'Missing title' });

    // Verify space exists
    const space = await prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) return res.status(404).json({ error: 'Space not found' });

    const task = await prisma.task.create({
      data: {
        title,
        description: description ?? desc,
        status: status || 'ToDo',
        priority: priority || 'Med',
        assignee,
        spaceId
      }
    });
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connection established successfully.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});