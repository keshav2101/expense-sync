// Unified Runner for ExpenseSync Live Stack
// Runs Core Service (8080), Analytics Service (8082), and Vite React Client (5173)
const { spawn } = require('child_process');
const path = require('path');

// 1. Start Mock Backend (8080 and 8082)
require('./mock-backend.cjs');

// 2. Spawn React Client (5173)
const clientDir = path.join(__dirname, 'unit-5', 'client');
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('🚀 Starting React Client dev server (Port 5173)...');
const vite = spawn(npmCmd, ['run', 'dev'], {
  cwd: clientDir,
  stdio: 'inherit',
  shell: true
});

vite.on('error', (err) => {
  console.error('Failed to start Vite dev server:', err);
});

vite.on('exit', (code) => {
  console.log(`Vite dev server stopped with code ${code}`);
  process.exit(code || 0);
});

// Keep process open
process.on('SIGINT', () => {
  vite.kill();
  process.exit();
});
