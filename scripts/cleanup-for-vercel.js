/**
 * Cleanup script to prepare the project for Vercel deployment
 * Run with: node scripts/cleanup-for-vercel.js
 */

const fs = require('fs');
const path = require('path');

// Files that are not needed for frontend deployment
const filesToRemove = [
  // Hardhat test files that aren't needed in production
  'test/INFT.test.js',
  'test/MetadataManager.test.js',
  'test/TransferManager.test.js',
  
  // Development server files
  'proxy-server.js',
  'server.js',
  
  // Backup files
  'package.json.backup'
];

// Directories that are not needed for frontend deployment
const dirsToRemove = [
  // Empty or unnecessary directories can be added here
];

// Clean up files
console.log('Cleaning up unnecessary files for Vercel deployment...');

filesToRemove.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${file}`);
    } catch (err) {
      console.error(`❌ Error removing ${file}: ${err.message}`);
    }
  } else {
    console.log(`⚠️ File not found: ${file}`);
  }
});

// Clean up directories
dirsToRemove.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmdirSync(dirPath, { recursive: true });
      console.log(`✅ Removed directory: ${dir}`);
    } catch (err) {
      console.error(`❌ Error removing directory ${dir}: ${err.message}`);
    }
  } else {
    console.log(`⚠️ Directory not found: ${dir}`);
  }
});

console.log('Cleanup completed successfully!');