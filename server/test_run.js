const { execSync } = require('child_process');
try {
  console.log("Installing dependencies...");
  execSync('npm install', { stdio: 'inherit', cwd: __dirname });
  console.log("Starting server...");
  execSync('node server.js', { stdio: 'inherit', cwd: __dirname });
} catch (error) {
  console.error("Error:", error.message);
}
