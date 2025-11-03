
import os
import json
from typing import List, Dict, Any, Optional
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

class FaissStore:
    """
    A persistent wrapper for a FAISS vector index.
    - Stores text, embeddings, and metadata.
    - Persists the index and a metadata map to disk.
    - Provides methods for building, adding to, and querying the index.
    """
    def __init__(self, index_path: str, meta_path: str, embed_model_name: str = "all-MiniLM-L6-v2"):
        self.index_path = index_path
        self.meta_path = meta_path
        # The SentenceTransformer model is used to create embeddings from text.
        self.model = SentenceTransformer(embed_model_name)
        self.index: Optional[faiss.IndexFlatL2] = None
        self.id_to_meta: Dict[int, Dict[str, Any]] = {}

        # Attempt to load an existing index and metadata from disk
        if os.path.exists(self.index_path) and os.path.exists(self.meta_path):
            try:
                self.index = faiss.read_index(self.index_path)
                with open(self.meta_path, "r", encoding="utf-8") as f:
                    self.id_to_meta = json.load(f)
                # Convert keys back to integers for correct indexing
                self.id_to_meta = {int(k): v for k, v in self.id_to_meta.items()}
            except Exception as e:
                print(f"Failed to load existing FAISS index: {e}. Starting fresh.")
                self.index = None
                self.id_to_meta = {}

    def build(self, texts: List[str], metas: List[Dict[str, Any]]):
        """Build a new index from scratch."""
        embeddings = self.model.encode(texts, show_progress_bar=True, convert_to_numpy=True)
        dim = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dim)
        self.index.add(embeddings)

        self.id_to_meta = {i: meta for i, meta in enumerate(metas)}
        self._persist()
        print(f"FAISS index built with {self.index.ntotal} documents.")

    def add(self, texts: List[str], metas: List[Dict[str, Any]]):
        """Append new documents to an existing index."""
        embeddings = self.model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
        if self.index is None:
            self.build(texts, metas)
            return

        start_id = self.index.ntotal
        self.index.add(embeddings)
        for i, meta in enumerate(metas):
            self.id_to_meta[start_id + i] = meta
        
        self._persist()
        print(f"Added {len(texts)} new documents. Index now has {self.index.ntotal} documents.")

    def query(self, query_text: str, k: int = 5):
        """Search the index for the top k most similar documents."""
        q_emb = self.model.encode([query_text], convert_to_numpy=True)
        if self.index is None or self.index.ntotal == 0:
            return []
            
        D, I = self.index.search(q_emb, k)
        results = []
        for score, idx in zip(D[0], I[0]):
            if idx == -1: continue
            meta = self.id_to_meta.get(int(idx), {})
            results.append({"score": float(score), "meta": meta})
        return results

    def _persist(self):
        """Saves the index and metadata to disk."""
        try:
            os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
            if self.index is not None:
                faiss.write_index(self.index, self.index_path)
                with open(self.meta_path, "w", encoding="utf-8") as f:
                    json.dump(self.id_to_meta, f, ensure_ascii=False)
        except Exception as e:
            print(f"Failed to persist FAISS index: {e}")
