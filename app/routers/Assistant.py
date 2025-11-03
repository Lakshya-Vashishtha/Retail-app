# import asyncio
# import os
# import logging
# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from langchain.prompts import PromptTemplate
# from dotenv import load_dotenv
# from openai import OpenAI
# from pydantic import BaseModel
# from typing import List, Dict, Any

# from ..database import get_db
# from ..services.vector_store import FaissStore
# from ..services.data_loader import load_product_and_sales_data

# # --- Pydantic Models for API Requests and Responses ---
# class AskRequest(BaseModel):
#     question: str
#     k: int = 5

# class AskResponse(BaseModel):
#     question: str
#     answer: str
#     sources: List[dict]

# # --- Global Configurations ---
# load_dotenv()
# logging.basicConfig(level=logging.INFO)

# # OpenRouter client for Google Gemini
# try:
#     client = OpenAI(
#         base_url="https://openrouter.ai/api/v1",
#         api_key=os.environ["OPENROUTER_API_KEY"],
#         default_headers={
#             "HTTP-Referer": os.environ.get("SITE_URL", "http://localhost"),
#             "X-Title": os.environ.get("SITE_NAME", "FastAPI Stock Assistant"),
#         },
#     )
#     logging.info("OpenAI client initialized with OpenRouter.")
# except KeyError:
#     logging.error("OPENROUTER_API_KEY environment variable not set.")
#     client = None

# # Paths for persistent vector store
# VECTOR_INDEX_PATH = "data/faiss.index"
# VECTOR_META_PATH = "data/faiss_meta.json"

# # Global FAISS store instance
# _faiss_store = FaissStore(VECTOR_INDEX_PATH, VECTOR_META_PATH)


# # --- API Router ---
# router = APIRouter(prefix="/assistant", tags=["Assistant"])


# # --- Build Index Endpoint ---
# @router.post("/build-index")
# def build_index(db: Session = Depends(get_db)):
#     """
#     Builds the FAISS vector index from all product and sales data in the database.
#     This should be run on a schedule or when new data is significantly updated.
#     """
#     logging.info("Starting index build process...")
#     documents = load_product_and_sales_data(db)
#     texts = [doc.page_content for doc in documents]
#     metas = [doc.metadata for doc in documents]
    
#     _faiss_store.build(texts, metas)
#     logging.info(f"Index built successfully with {len(documents)} documents.")
#     return {"status": "Index built successfully.", "document_count": len(documents)}


# # --- Ask Endpoint (RAG Assistant) ---
# @router.post("/ask", response_model=AskResponse)
# async def ask(request: AskRequest, db: Session = Depends(get_db)):
#     """
#     Retrieves relevant data from the vector store and generates a response using Gemini.
#     """
#     if _faiss_store.index is None or _faiss_store.index.ntotal == 0:
#         raise HTTPException(
#             status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
#             detail="Vector index is not built. Please run the '/build-index' endpoint first.",
#         )
#     if not client:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="LLM client not initialized. Check your API key.",
#         )

#     # Search FAISS for the top-k most relevant documents
#     hits = _faiss_store.query(request.question, k=request.k)
    
#     # Construct context from search results
#     contexts = []
#     for h in hits:
#         meta = h.get("meta", {})
#         context = (
#             f"Product Name: {meta.get('product_name', 'Unknown')}\n"
#             f"Brand: {meta.get('brand', 'Unknown')}\n"
#             f"Category: {meta.get('category', 'Unknown')}\n"
#             f"Current Stock: {meta.get('quantity', 'N/A')}\n"
#             f"Retail Price: ${meta.get('price', 0):.2f}\n"
#             f"Cost Price: ${float(meta.get('cost_price', 0)):.2f}\n" if meta.get('cost_price') is not None else "Cost Price: N/A\n"
#             f"Expiry Date: {meta.get('expiry_date', 'N/A')}\n"
#             f"Page Content: {h.get('page_content', 'N/A')}"
#         )
#         contexts.append(context)

#     context_block = "\n\n---\n\n".join(contexts) if contexts else "No relevant information found."
    
#     # Prompt template for the LLM
#     prompt_template = PromptTemplate(
#         template="""You are an analytical inventory assistant. Your task is to answer user questions based ONLY on the provided product context. You must meticulously analyze the provided data to find information that matches the user's specific query, especially numerical filters like price, quantity, or dates.
#         ### Instructions:
# 1.  **Understand the Query:** First, identify the key criteria from the user's question (e.g., "price > 200", "quantity < 50", "expiry_date before 2024").
# 2.  **Analyze Each Context:** Go through each provided product context one by one. Do not skip this step.
# 3.  **Apply the Filter:** For each product, check if it meets ALL the criteria from the user's query. Pay close attention to numerical comparisons (less than, greater than, equal to).
# 4.  **Compile Your Findings:** Create a mental list of products that meet the criteria. It is perfectly acceptable if only one product in a long list meets the condition.
# 5.  **Formulate Your Answer:** Base your answer SOLELY on the products in your compiled list. If your list is empty, state that clearly.
# ### Rules:
# -   **NEVER** say you cannot answer the question if you found any relevant data in the provided contexts. Your job is to analyze what you were given.
# -   **ALWAYS** provide a clear, concise answer based ONLY on the products that meet the criteria.
# -   If the user's query cannot be answered because the necessary data field (e.g., `cost_price`) is missing from ALL provided contexts, you may say: "The provided product data does not contain the necessary information (e.g., cost price) to answer this question."
# -   **DO NOT** list products that do not meet the criteria. Your response should only include matches.
# ### Output Format:
# Follow this structure exactly for your final answer.

# **Question:** [Repeat the user's question here]

# **Analysis:** 
# -   [Product Name 1]: [Briefly explain why it meets the criteria. E.g., "Quantity (33) is less than 50."]
# -   [Product Name 2]: [Briefly explain why it meets the criteria.]

# **Answer:** 
# Based on the provided data, the following products meet the criteria:
# - **[Product Name 1]** (Brand: [Brand], Stock: [Quantity])
# - **[Product Name 2]** (Brand: [Brand], Stock: [Quantity])

# **OR**

# **Answer:** 
# Based on the provided data, no products meet the criteria.

# **OR** 

# **Answer:** 
# The provided data does not contain the necessary information (e.g., `cost_price`) to answer this question.
# ### Example:
# **User Query:** "Which products have a quantity less than 50?"

# **Contexts Provided:**
# [Context 1]: Product: ExampleSyrup, Quantity: 86
# [Context 2]: Product: ExampleChurna, Quantity: 33
# [Context 3]: Product: ExampleCapsule, Quantity: 150

# **Your Expected Output:**
# **Question:** Which products have a quantity less than 50?

# **Analysis:** 
# - ExampleChurna: Quantity (33) is less than 50.

# **Answer:** 
# Based on the provided data, the following products meet the criteria:
# - **ExampleChurna** (Brand: ExampleBrand, Stock: 33)

# Context:
# {context}

# Question: {question}

# Answer:""",
#         input_variables=["context", "question"],
#     )

#     final_prompt = prompt_template.format(
#         context=context_block, question=request.question
#     )

#     try:
#         answer = await asyncio.to_thread(_llm_generate_sync, final_prompt)
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Error generating Gemini response: {e}",
#         )

#     # Return the structured response with sources
#     return AskResponse(question=request.question, answer=answer, sources=hits)


# def _llm_generate_sync(prompt: str) -> str:
#     """
#     Calls Google Gemini through OpenRouter.
#     """
#     try:
#         completion = client.chat.completions.create(
#             model="google/gemini-2.5-pro",
#             messages=[{"role": "user", "content": prompt}],
#             max_tokens=512,
#             temperature=0.5,
#         )
#         return completion.choices[0].message.content
#     except Exception as e:
#         logging.error(f"Error calling LLM: {e}")
#         raise e
