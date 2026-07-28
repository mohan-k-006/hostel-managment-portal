from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from seed_data import seed_database
from routers import auth, rooms, complaints, visitors, fees, notices, analytics

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed database on startup
seed_database()

app = FastAPI(
    title="Hostel Management Portal API",
    description="Full-stack campus hostel administration, room allotment, complaints, visitors, fees, and analytics backend.",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(complaints.router)
app.include_router(visitors.router)
app.include_router(fees.router)
app.include_router(notices.router)
app.include_router(analytics.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "Hostel Management Portal API (PRJ-051)",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
