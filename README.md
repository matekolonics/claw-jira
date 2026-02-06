# ClawJira - Jira-like Project Management

A simple Jira-like project management application built with React, Node.js, and SQLite.

## Features

- **List View**: Create, edit, and delete projects
- **Kanban View**: Drag-and-drop task management with status columns (To Do, In Progress, Done)
- **Spaces**: Organize tasks within projects
- **Responsive Design**: Works on desktop and mobile devices
- **Toast Notifications**: Visual feedback for all actions

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite with Prisma ORM
- **Drag & Drop**: react-beautiful-dnd
- **Notifications**: react-hot-toast

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Clone the repository
cd claw-jira

# Install dependencies
npm install

# Set up the database
npm run migrate

# Generate Prisma client
npm run generate

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run frontend:dev` | Start Vite dev server (frontend only) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run start` | Start production server |
| `npm run migrate` | Run database migrations |
| `npm run generate` | Generate Prisma client |
| `npm run test` | Run all tests |

## Project Structure

```
claw-jira/
├── src/
│   ├── App.jsx          # Main React application
│   ├── server.js        # Express backend server
│   └── index.css        # Global styles
├── prisma/
│   └── schema.prisma    # Database schema
├── public/
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Screenshots

*(Add screenshots here)*

- List View: Create and manage projects
- Kanban View: Drag-and-drop task management
- Mobile View: Responsive design

## Deployment to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Import the project in Vercel
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Vercel Configuration (vercel.json)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/projects/:id/spaces` | Get project spaces |
| POST | `/api/projects/:id/spaces` | Create space |
| GET | `/api/spaces/:id/tasks` | Get space tasks |
| POST | `/api/spaces/:id/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
```

## License

MIT
