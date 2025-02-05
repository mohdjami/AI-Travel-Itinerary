from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models.schemas import UserPreferences, CompleteItinerary
from app.services.llm_service import LLMService
from app.services.travel_service import TravelService
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# At the top of main.py
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
app = FastAPI(title="Travel Planning API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
llm_service = LLMService()
travel_service = TravelService(llm_service)

@app.post("/generate", response_model=CompleteItinerary)
def generate_itinerary(preferences: UserPreferences):  # Removed async
    try:
        result = travel_service.generate_itinerary(preferences.dict())
        return result
    except Exception as e:
        logger.error(f"Error generating itinerary: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate itinerary: {str(e)}"
        )
    
@app.get("/health")
async def health_check():
    return {"status": "healthy"}