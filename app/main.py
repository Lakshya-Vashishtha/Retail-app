from fastapi import FastAPI
from .database import engine
from . import models
from .routers import auth, registration, products, sales, dashboard, Assistant, RAG
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://127.0.0.1:5173", "http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

app.include_router(registration.router)
app.include_router(auth.router)
app.include_router(products.router,prefix="/api/v1")
app.include_router(sales.router)
app.include_router(dashboard.router)
# app.include_router(Assistant.router, prefix="/api/v1")
app.include_router(RAG.router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Hello World"}

