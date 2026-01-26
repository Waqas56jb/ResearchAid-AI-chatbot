// Shared in-memory document store
// In production, replace this with a proper database (MongoDB, PostgreSQL, etc.)

const documentStore = new Map();

export function saveDocument(documentId, documentData) {
  documentStore.set(documentId, documentData);
  return documentData;
}

export function getDocument(documentId) {
  return documentStore.get(documentId);
}

export function deleteDocument(documentId) {
  return documentStore.delete(documentId);
}

export function getAllDocuments() {
  return Array.from(documentStore.values());
}

export default {
  saveDocument,
  getDocument,
  deleteDocument,
  getAllDocuments
};
