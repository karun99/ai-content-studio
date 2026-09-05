const { Router } = require('express');
const { exportContent } = require('../services/exportEngine');
const path = require('path');
const fs = require('fs-extra');
const router = Router();

const EXPORT_DIR = path.join(__dirname, '../../exports');

router.post('/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const { content, metadata, documentId } = req.body;

    await fs.ensureDir(EXPORT_DIR);
    const outputPath = path.join(EXPORT_DIR, `${documentId || 'output'}.${format}`);

    await exportContent(format, content, metadata || {}, outputPath);

    res.download(outputPath, `${(metadata && metadata.title) || 'document'}.${format}`, async (err) => {
      if (!err) {
        await fs.remove(outputPath).catch(() => {});
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
