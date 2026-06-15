from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.api.routes import auth_router, recipes_router, favorites_router, comments_router, profile_router, carts_router

app = FastAPI(title="Recartly API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(auth_router)
app.include_router(recipes_router)
app.include_router(favorites_router)
app.include_router(comments_router)
app.include_router(profile_router)
app.include_router(carts_router)

# Раздаём статические файлы (фото)
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

@app.get("/")
def root():
    return {"message": "Welcome to Recartly API"}

@app.get("/health")
def health():
    return {"status": "ok"}