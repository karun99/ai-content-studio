const { Router } = require('express');
const { convertModel, getConversionStatus } = require('../services/modelBuilder');
const router = Router();

router.post('/convert', async (req, res) => {
  try {
    const { modelPath, outputFormat, quantization } = req.body;
    if (!modelPath || !outputFormat) {
      return res.status(400).json({ error: 'modelPath and outputFormat required' });
    }
    const io = req.app.get('io');
    const result = await convertModel(modelPath, outputFormat, quantization, io);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/status/:jobId', (req, res) => {
  try {
    const status = getConversionStatus(req.params.jobId);
    res.json({ status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
