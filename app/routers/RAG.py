from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

from ..database import get_db
from .. import models, schemas

router = APIRouter(
    prefix="/rag",
    tags=["rag"],
)

# Simple, module-level singletons for client, collection and embedder
_client = None
_collection = None
_embedder = None
_collection_name = "products_sales_collection"
_chroma_path = "./chroma_db"


def _init_embedding_and_client():
    global _client, _embedder, _collection
    if _embedder is None:
        # use a lightweight sentence-transformers model already in requirements
        _embedder = SentenceTransformer("all-MiniLM-L6-v2")

    if _client is None:
        _client = chromadb.PersistentClient(path=_chroma_path, settings=Settings(anonymized_telemetry=False))

    if _collection is None:
        try:
            _collection = _client.get_collection(name=_collection_name)
        except Exception:
            _collection = _client.create_collection(name=_collection_name, metadata={"description": "Products and sales"})


def _build_documents_from_db(db: Session) -> List[Dict[str, Any]]:
    docs = []

    products = db.query(models.Product).all()
    for p in products:
        text = f"Product: {p.name}. Brand: {p.Brand or ''}. Category: {p.category or ''}. Price: {p.price or ''}. Quantity: {p.quantity or ''}."
        docs.append({"id": f"product_{p.id}", "text": text, "meta": {"type": "product", "product_id": p.id}})

    sales = db.query(models.Sale).all()
    for s in sales:
        prod_name = s.product.name if s.product else f"product_id_{s.product_id}"
        text = f"Sale: Product: {prod_name}. Quantity sold: {s.quantity_sold}. Date: {s.sale_date}. Total: {s.total_price}."
        docs.append({"id": f"sale_{s.id}", "text": text, "meta": {"type": "sale", "sale_id": s.id, "product_id": s.product_id}})

    return docs


def _ensure_collection_populated(db: Session):
    """Initialize chroma client/collection and populate it from the database if empty."""
    _init_embedding_and_client()

    global _collection
    # try to check if collection already has data
    try:
        info = _collection.count()
        if info and info > 0:
            return
    except Exception:
        # fallback: attempt to get a single item
        try:
            resp = _collection.get(limit=1)
            if resp and resp.get("ids"):
                return
        except Exception:
            pass

    # build docs and add
    docs = _build_documents_from_db(db)
    if not docs:
        return

    ids = [d["id"] for d in docs]
    documents = [d["text"] for d in docs]
    metadatas = [d["meta"] for d in docs]

    # compute embeddings
    embeddings = _embedder.encode(documents, convert_to_numpy=True).tolist()

    # add to collection
    _collection.add(ids=ids, documents=documents, metadatas=metadatas, embeddings=embeddings)


def _synthesize_with_llm(question: str, context: str) -> str:
    """
    Try to call Google Generative AI (Gemini) if GOOGLE_API_KEY is set.
    If not available or on error, return None to let the caller use fallback.
    """
    try:
        import os
        import google.generativeai as genai
        from dotenv import load_dotenv
        load_dotenv()

        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            return None
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-pro")
        
        system_prompt = "You are an assistant that answers questions only using the provided context about products and sales. If the context doesn't contain the answer, say you can't find it."
        
        full_prompt = f"{system_prompt}\n\nContext:\n{context}\n\nQuestion: {question}\n\nAnswer concisely using only the context."
        
        response = model.generate_content(full_prompt)
        return response.text.strip() if response.text else None
    except Exception:
        return None


def _is_aggregation_query(question: str) -> bool:
    """Detect if question is asking for counts, sums, or totals."""
    agg_keywords = ["total", "count", "how many", "sum", "number of", "all products", "all sales"]
    question_lower = question.lower()
    return any(keyword in question_lower for keyword in agg_keywords)


def _handle_aggregation_query(question: str, db: Session) -> str:
    """Answer aggregation queries directly from DB."""
    question_lower = question.lower()
    
    if "total number of products" in question_lower or "how many products" in question_lower:
        count = db.query(models.Product).count()
        return f"The total number of products in the database is {count}."
    
    if "total number of sales" in question_lower or "how many sales" in question_lower:
        count = db.query(models.Sale).count()
        return f"The total number of sales is {count}."
    
    if "total sales" in question_lower and ("revenue" in question_lower or "amount" in question_lower):
        total = db.query(func.sum(models.Sale.total_price)).scalar() or 0
        return f"The total sales revenue is {total}."
    
    if "total quantity sold" in question_lower or "total sold" in question_lower:
        total = db.query(func.sum(models.Sale.quantity_sold)).scalar() or 0
        return f"The total quantity sold is {total}."
    
    return None


@router.post("/ask/", response_model=schemas.AskResponse)
def ask_rag(request: schemas.AskRequest, db: Session = Depends(get_db)):
    """RAG ask: retrieve top-k docs, synthesize final answer with an LLM when available."""
    
    # Check if this is an aggregation query (count, sum, total) — answer directly from DB
    if _is_aggregation_query(request.question):
        agg_answer = _handle_aggregation_query(request.question, db)
        if agg_answer:
            return schemas.AskResponse(
                question=request.question,
                answer=agg_answer,
                sources=[]
            )
    
    try:
        _ensure_collection_populated(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize vector store: {e}")

    _init_embedding_and_client()

    k = max(1, request.k)

    # embed the query with the same embedder and use query_embeddings for consistent retrieval
    try:
        query_emb = _embedder.encode([request.question], convert_to_numpy=True).tolist()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to embed query: {e}")

    try:
        results = _collection.query(query_embeddings=query_emb, n_results=k, include=["documents", "metadatas", "distances"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vector store query failed: {e}")

    retrieved_docs = results.get("documents", [[]])[0]
    retrieved_meta = results.get("metadatas", [[]])[0]
    retrieved_dist = results.get("distances", [[]])[0]

    # filter by distance threshold to avoid returning irrelevant neighbors (tune as needed)
    DIST_THRESHOLD = 1.35
    selected = []
    for doc, meta, dist in zip(retrieved_docs, retrieved_meta, retrieved_dist):
        if dist is None:
            continue
        if float(dist) <= DIST_THRESHOLD:
            selected.append((doc, meta, float(dist)))

    if not selected:
        return schemas.AskResponse(
            question=request.question,
            answer="I can only answer questions about products and sales. I couldn't find relevant information for your question.",
            sources=[]
        )

    # build context for LLM: include small metadata + doc text
    context_pieces = []
    sources = []
    for doc, meta, dist in selected:
        context_pieces.append(f"{doc}")
        sources.append({"document": doc, "metadata": meta, "distance": dist})
    context = "\n\n".join(context_pieces)

    # Try to synthesize final answer via LLM if available, otherwise return concatenated docs as fallback
    llm_answer = _synthesize_with_llm(request.question, context)
    if llm_answer:
        answer = llm_answer
    else:
        answer = "Based on retrieved passages:\n\n" + context

    return schemas.AskResponse(question=request.question, answer=answer, sources=sources)
