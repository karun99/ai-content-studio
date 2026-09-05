const { Router } = require('express');
const { route, compare } = require('../services/inferenceRouter');
const router = Router();

// POST /api/ai/run - Execute AI action with selected engine
router.post('/run', async (req, res, next) => {
  try {
    const { prompt, engine, model, options } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });
    if (!engine) return res.status(400).json({ error: 'engine is required' });
    const response = await route(prompt, engine, model, options);
    res.json({ response });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/compare - Compare multiple engines
router.post('/compare', async (req, res, next) => {
  try {
    const { prompt, engines, models, options } = req.body;
    if (!prompt || !engines) return res.status(400).json({ error: 'prompt and engines are required' });
    const results = await compare(prompt, engines, models, options);
    res.json({ results });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
