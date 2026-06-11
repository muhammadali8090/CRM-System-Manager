module.exports = {
    apps: [
      {
        name: '6a267feb470305a2c80b197d--server',
        script: 'npm',
      interpreter: 'none',
        args: 'start',
        cwd: './server',
        instances: 1,
        exec_mode: 'fork',
        autorestart: true,
        watch: false,
        time: true,
        max_memory_restart: '150M',
        exp_backoff_restart_delay: 100,
        min_uptime: 3000,
        max_restarts: 5,
        kill_timeout: 3000,
      },
      {
        name: '6a267feb470305a2c80b197d--client',
        script: 'npm',
      interpreter: 'none',
        args: 'start',
        cwd: './client',
        instances: 1,
        exec_mode: 'fork',
        autorestart: true,
        watch: false,
        time: true,
        max_memory_restart: '300M',
        exp_backoff_restart_delay: 100,
        min_uptime: 3000,
        max_restarts: 5,
        kill_timeout: 3000,
      }
    ]
  };
