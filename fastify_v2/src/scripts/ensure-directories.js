const fs = require('fs');
const path = require('path');

/**
 * Ensures all required upload directories exist
 */
function ensureDirectories() {
  const directories = [
    '../../public/uploads',
    '../../public/uploads/users',
    '../../public/uploads/products',
    '../../public/uploads/banners',
  ];
  
  directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      console.log(`Creating directory: ${dirPath}`);
      fs.mkdirSync(dirPath, { recursive: true });
    } else {
      console.log(`Directory already exists: ${dirPath}`);
    }
  });
  
  console.log('All required directories have been created!');
}

// Run directly if this script is executed directly
if (require.main === module) {
  ensureDirectories();
}

module.exports = ensureDirectories;
