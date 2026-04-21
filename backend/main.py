from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import engine, Base
from .api.routes import users, family_trees, stories, photos, demo

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RootsAtlas API",
    description="API for a family memory preservation and cultural heritage platform.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, you would want to restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/v1")
app.include_router(family_trees.router, prefix="/api/v1")
app.include_router(stories.router, prefix="/api/v1")
app.include_router(photos.router, prefix="/api/v1")
app.include_router(demo.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to the RootsAtlas API"}
