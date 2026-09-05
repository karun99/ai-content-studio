const { ChromaClient } = require('chromadb');
const axios = require('axios');

const client = new ChromaClient({ path: process.env.CHROMA_URL });

async function getEmbedding(text) {
  const resp = await axios.post(`${process.env.OLLAMA_URL}/api/embeddings`, {
    model: 'nomic-embed-text',
    prompt: text,
  });
  return resp.data.embedding;
}

async function addDocument(id, text, metadata = {}, collection = 'docs') {
  const coll = await client.getOrCreateCollection({ name: collection });
  const embedding = await getEmbedding(text);
  await coll.add({
    ids: [id],
    embeddings: [embedding],
    metadatas: [metadata],
    documents: [text],
  });
  return { id, collection };
}

async function addDocuments(ids, texts, metadatas = [], collection = 'docs') {
  const coll = await client.getOrCreateCollection({ name: collection });
  const embeddings = await Promise.all(texts.map(getEmbedding));
  await coll.add({
    ids,
    embeddings,
    metadatas: metadatas.length ? metadatas : texts.map(() => ({})),
    documents: texts,
  });
}

async function search(query, collection = 'docs', topK = 5) {
  const coll = await client.getCollection({ name: collection });
  const emb = await getEmbedding(query);
  const results = await coll.query({
    queryEmbeddings: [emb],
    nResults: topK,
    include: ['documents', 'metadatas', 'distances'],
  });

  if (!results.ids || !results.ids[0]) return [];

  return results.ids[0].map((id, i) => ({
    id,
    document: results.documents[0][i],
    metadata: results.metadatas[0][i],
    distance: results.distances[0][i],
  }));
}

async function deleteDocument(id, collection = 'docs') {
  const coll = await client.getCollection({ name: collection });
  await coll.delete({ ids: [id] });
}

module.exports = { addDocument, addDocuments, search, deleteDocument, getEmbedding };
