module.exports = {
  apps: [
    {
      name: 'tablehive-webapp',
      cwd: './webapp',
      script: 'node_modules/next/dist/bin/next',
      args: 'dev -p 5174',
      watch: false,
    },
    {
      name: 'tablehive-server',
      script: 'server.js',
      cwd: './server',
      watch: true,
      ignore_watch: ['node_modules', 'logs'],
    },
  ],
};
