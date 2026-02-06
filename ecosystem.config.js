module.exports = {
  apps: [
    {
      name: 'clawjira-backend',
      script: 'npm',
      args: 'run dev',
      cwd: '/root/.openclaw/workspace/claw-jira',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    }
  ]
};