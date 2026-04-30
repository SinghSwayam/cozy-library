from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from recommender import get_recommendations, load_data_and_train

app = FastAPI(
    title="Book Recommendation ML API",
    description="Microservice for content-based book recommendations",
    version="1.0.0"
)

class RecommendationRequest(BaseModel):
    book_id: int
    top_n: Optional[int] = 5

class BookResponse(BaseModel):
    book_id: int
    title: str
    authors: str
    image_url: Optional[str] = None
    average_rating: Optional[float] = None

@app.on_event("startup")
async def startup_event():
    # Load the data and train the model eagerly on startup
    load_data_and_train()

@app.post("/recommend", response_model=List[BookResponse])
async def recommend(request: RecommendationRequest):
    recommendations = get_recommendations(book_id=request.book_id, top_n=request.top_n)
    
    if not recommendations:
        raise HTTPException(status_code=404, detail=f"Book with book_id {request.book_id} not found or no recommendations available.")
        
    return recommendations

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
