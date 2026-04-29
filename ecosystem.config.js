module.exports = {
    apps: [
      {
        name: 'Connect Lodhran',  // Change this to your application name
        script: 'src/index.js',        // Change this to your main application file
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',  // Restart the app if memory usage exceeds 1GB
        log_date_format: 'YYYY-MM-DD HH:mm:ss',  // Log timestamp format
        error_file: 'logs/error.log',  // Path to error log file
        out_file: 'logs/output.log',    // Path to standard output log file
        merge_logs: true,               // Merge logs from all instances
        env: {
          NODE_ENV: 'production'  // Change to 'development' if needed
        },
        env_production: {
          NODE_ENV: 'production'
        }
      }
    ]
  };
  