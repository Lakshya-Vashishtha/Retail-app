from fastapi import FastAPI
from .database import engine
from . import models
from .routers import auth, registration, products, sales, dashboard, RAG
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # or frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
models.Base.metadata.create_all(bind=engine)

app.include_router(registration.router)
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(sales.router)
app.include_router(dashboard.router)
app.include_router(RAG.router)


@app.get("/")
def root():
    return {"message": "Hello World"}
