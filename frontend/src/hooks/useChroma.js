import { useState, useCallback } from 'react';

export default function useChroma(dbName = 'docs') {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);

  const search = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const { searchKnowledge } = await import('../api/knowledge');
      const data = await searchKnowledge(query, dbName);
      setResults(data);
      setConnected(true);
      return data;
    } catch (err) {
      setError(err.error || err.message || 'Search failed');
      setConnected(false);
      return [];
    } finally {
      setLoading(false);
    }
  }, [dbName]);

  const add = useCallback(async (id, text, metadata) => {
    setLoading(true);
    setError(null);
    try {
      const { addDocument } = await import('../api/knowledge');
      await addDocument(id, text, metadata, dbName);
      setConnected(true);
      return true;
    } catch (err) {
      setError(err.error || err.message || 'Add failed');
      setConnected(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, [dbName]);

  return { search, add, results, loading, error, connected };
}
