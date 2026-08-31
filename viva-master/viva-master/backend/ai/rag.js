/**
 * RAG - Embeddings & Vector Retrieval (Mock Implementation)
 * This module demonstrates the architectural concepts of Retrieval-Augmented Generation (RAG).
 * In a real scenario, this would use a vector database (like Pinecone or Chroma) and an 
 * embedding model (like OpenAI text-embedding-ada-002) to perform cosine similarity search.
 */

// Simple keyword-based similarity to mock cosine similarity of vector embeddings
function calculateSimilarity(query, text) {
  const queryWords = query.toLowerCase().split(/\s+/);
  const textWords = text.toLowerCase().split(/\s+/);
  
  let matches = 0;
  for (const qw of queryWords) {
    if (textWords.includes(qw)) matches++;
  }
  return matches / Math.max(queryWords.length, 1);
}

// Mocks the chunking and embedding process
function retrieveRelevantChunks(query, documentContent, topK = 2) {
  // 1. Chunking: Split document into sentences or paragraphs
  const chunks = documentContent.split(/(?<=[.!?])\s+/);
  
  // 2. Embedding & Retrieval: Score chunks against query
  const scoredChunks = chunks.map(chunk => ({
    text: chunk,
    score: calculateSimilarity(query, chunk)
  }));
  
  // 3. Sort by similarity score (descending)
  scoredChunks.sort((a, b) => b.score - a.score);
  
  // 4. Return top K chunks
  return scoredChunks.slice(0, topK).map(c => c.text);
}

module.exports = { retrieveRelevantChunks };
