from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    applications,
    auth,
    documents,
    funding,
    labs,
    notifications,
    positions,
    programs,
    stipends,
    students,
)

app = FastAPI(title="Undergraduate Lab Portal API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(positions.router)
app.include_router(applications.router)
app.include_router(programs.router)
app.include_router(funding.router)
app.include_router(stipends.router)
app.include_router(labs.router)
app.include_router(notifications.router)
app.include_router(documents.router)


@app.get("/")
async def root():
    return {
        "name": "Undergraduate Lab Portal API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
