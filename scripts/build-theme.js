import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function buildTheme() {
  try {
    // Clean and create theme directory
    await fs.emptyDir(path.join(rootDir, 'theme'));
    
    // Ensure theme-src exists
    if (!fs.existsSync(path.join(rootDir, 'theme-src'))) {
      console.error('theme-src directory not found');
      process.exit(1);
    }

    // Copy theme structure
    await fs.copy(
      path.join(rootDir, 'theme-src'),
      path.join(rootDir, 'theme')
    );

    // Create assets directory if it doesn't exist
    await fs.ensureDir(path.join(rootDir, 'theme/assets'));

    // Copy built assets
    const distFiles = await fs.readdir(path.join(rootDir, 'dist/assets'));
    
    for (const file of distFiles) {
      const sourcePath = path.join(rootDir, 'dist/assets', file);
      const targetPath = path.join(rootDir, 'theme/assets', file);
      
      // Copy and rename .css files to index.css
      if (file.endsWith('.css')) {
        await fs.copy(sourcePath, path.join(rootDir, 'theme/assets/index.css'));
      }
      // Copy and rename .js files to index.js
      else if (file.endsWith('.js')) {
        await fs.copy(sourcePath, path.join(rootDir, 'theme/assets/index.js'));
      }
      // Copy other assets as is
      else {
        await fs.copy(sourcePath, targetPath);
      }
    }

    // Create theme zip
    const output = fs.createWriteStream(path.join(rootDir, 'theme.zip'));
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', () => {
      console.log('Theme package created successfully!');
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);
    archive.directory(path.join(rootDir, 'theme'), false);
    await archive.finalize();

  } catch (err) {
    console.error('Error building theme:', err);
    process.exit(1);
  }
}

buildTheme();