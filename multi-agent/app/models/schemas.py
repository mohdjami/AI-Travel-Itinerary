from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Union
from datetime import date, timedelta
from enum import Enum

class TravelStyle(str, Enum):
    LUXURY = "luxury"
    BUDGET = "budget"
    BALANCED = "balanced"

class TransportMode(str, Enum):
    FLIGHT = "flight"
    TRAIN = "train"
    BUS = "bus"
    CAR = "car"

class UserPreferences(BaseModel):
    start_location: str
    end_location: str
    start_date: date
    end_date: date
    budget: float
    interests: List[str]
    travel_style: TravelStyle = TravelStyle.BALANCED
    preferred_transport: Optional[List[TransportMode]] = None

    @validator('end_date')
    def end_date_must_be_after_start_date(cls, v, values):
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v

class RouteSegment(BaseModel):
    from_location: str
    to_location: str
    transport_mode: TransportMode
    departure_time: str
    arrival_time: str
    cost: float
    duration: timedelta
    details: Dict[str, str] = Field(default_factory=dict)
    start_date: Optional[date] = None

class BudgetBreakdown(BaseModel):
    transport: float
    accommodation: float
    activities: float
    food: float
    miscellaneous: float
    
    @property
    def total(self) -> float:
        return sum([self.transport, self.accommodation, 
                   self.activities, self.food, self.miscellaneous])

class Activity(BaseModel):
    name: str
    location: str
    duration: timedelta
    cost: float
    description: str
    category: str
    booking_required: bool
    recommended_time: str
    weather_dependent: bool

class DailyItinerary(BaseModel):
    date: date
    location: str
    accommodation: Optional[Dict[str, Union[str, float]]] = None  # Allow both string and float
    activities: List[Activity]
    total_cost: float
    free_time: timedelta
    
class CompleteItinerary(BaseModel):
    user_preferences: UserPreferences
    route_segments: List[RouteSegment]
    daily_itineraries: List[DailyItinerary]
    budget_breakdown: BudgetBreakdown
    total_cost: float = 0.0  # Add a default value
    notes: List[str] = Field(default_factory=list)