from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from .database import engine
from . import models
from .routers import users, posts, comments

# Bind SQLAlchemy models to the database (creates tables if they don't exist)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Blogging API",
    description="A simple blogging API built using FastAPI, SQLAlchemy, and SQLite.",
    version="1.0.0"
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(comments.router)

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")
