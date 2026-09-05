const { Router } = require('express');
const router = Router();

// In-memory document store (replace with DB in production)
const documents = new Map();
const { v4: uuid } = require('uuid');

router.post('/save', (req, res) => {
  try {
    const { id, content } = req.body;
    const docId = id || uuid();
    documents.set(docId, { content, updatedAt: new Date().toISOString() });
    res.json({ id: docId, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/load/:id', (req, res) => {
  try {
    const doc = documents.get(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json({ id: req.params.id, ...doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/list', (req, res) => {
  const list = Array.from(documents.entries()).map(([id, data]) => ({ id, ...data }));
  res.json({ documents: list });
});

module.exports = router;
