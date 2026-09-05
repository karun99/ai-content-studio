const fs = require('fs-extra');
const path = require('path');
const os = require('os');

function getTempDir() {
  const dir = path.join(os.tmpdir(), 'ai-content-studio');
  fs.ensureDirSync(dir);
  return dir;
}

function generateTempFilename(ext) {
  return path.join(getTempDir(), `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);
}

function ensureDir(dir) {
  return fs.ensureDir(dir);
}

function cleanupTempFiles(maxAgeMs = 3600000) {
  const tempDir = getTempDir();
  return fs.readdir(tempDir).then((files) => {
    return Promise.all(
      files.map(async (file) => {
        const filePath = path.join(tempDir, file);
        const stat = await fs.stat(filePath);
        if (Date.now() - stat.mtimeMs > maxAgeMs) {
          return fs.remove(filePath);
        }
      })
    );
  });
}

module.exports = { getTempDir, generateTempFilename, ensureDir, cleanupTempFiles };
