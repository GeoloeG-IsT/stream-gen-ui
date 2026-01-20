from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings
from models.schemas import HealthResponse

settings = get_settings()

app = FastAPI(
    title="Berlin City Chatbot API",
    description="RAG-powered chatbot for Berlin city information",
    version="0.1.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="healthy", version="0.1.0")

# Placeholder for /api/chat - will be implemented in Plan 02-03
# @app.post("/api/chat", response_model=RetrievalResponse)
# async def chat(request: ChatRequest):
#     pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.port)
