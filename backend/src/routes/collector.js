const { Router } = require('express');
const { runCollector } = require('../services/agentReach');
const router = Router();

router.post('/scrape', async (req, res) => {
  try {
    const { urls, platforms, options } = req.body;
    if (!urls && !platforms) return res.status(400).json({ error: 'urls or platforms required' });
    const results = await runCollector(urls, platforms, options);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
