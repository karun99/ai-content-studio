const { Router } = require('express');
const { addDocument, search } = require('../services/chromaDB');
const router = Router();

// POST /api/knowledge/add - Add document to ChromaDB
router.post('/add', async (req, res, next) => {
  try {
    const { id, text, metadata, collection } = req.body;
    if (!id || !text) return res.status(400).json({ error: 'id and text are required' });
    await addDocument(id, text, metadata, collection);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/knowledge/search - Semantic search
router.get('/search', async (req, res, next) => {
  try {
    const { q, collection, topK } = req.query;
    if (!q) return res.status(400).json({ error: 'q is required' });
    const results = await search(q, collection, topK ? parseInt(topK) : 5);
    res.json({ results });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
