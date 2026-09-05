const { Router } = require('express');
const { startTraining, getTrainingStatus } = require('../services/miniMind');
const router = Router();

router.post('/start', async (req, res) => {
  try {
    const { config } = req.body;
    const io = req.app.get('io');
    const result = await startTraining(config, io);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/status', (req, res) => {
  try {
    const status = getTrainingStatus();
    res.json({ status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
