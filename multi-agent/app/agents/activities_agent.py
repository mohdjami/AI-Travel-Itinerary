from datetime import date, timedelta
from langchain.agents import Tool, AgentExecutor
from langchain.prompts import ChatPromptTemplate
from app.models.schemas import Activity, DailyItinerary,  RouteSegment
from typing import List, Dict
import json
import logging

logger = logging.getLogger(__name__)
class ActivitiesAgent:
    def __init__(self, llm_service):
        self.llm_service = llm_service
        self.tools = self._create_tools()

    def _recommend_activities(self, location: str, interests: List[str], budget: float) -> List[Activity]:
        llm = self.llm_service.get_llm("activities")
        
        system_message = """You are a local tour guide API. Return only a JSON array of activities.
    Each activity must be in this exact format:
    [
    {
        "name": "Activity Name",
        "location": "Specific Place in City",
        "duration": "02:00:00",
        "cost": 50.00,
        "description": "Brief description of the activity",
        "category": "culture",
        "booking_required": true,
        "recommended_time": "morning",
        "weather_dependent": false
    }
    ]"""

        human_message = f"Suggest activities in {location} matching these interests: {', '.join(interests)}. Daily budget: ${budget}"
        
        messages = [
            ("system", system_message),
            ("human", human_message)
        ]
        
        logger.info(f"Requesting activities for {location}")
        response = llm.invoke(messages)
        logger.info(f"Raw activities response: {response.content}")
        
        try:
            content = response.content.strip()
            start_idx = content.find('[')
            end_idx = content.rfind(']') + 1
            json_str = content[start_idx:end_idx]
            
            activities_data = json.loads(json_str)
            return [Activity(**activity) for activity in activities_data]
        except Exception as e:
            logger.error(f"Failed to parse activities response: {str(e)}")
            logger.error(f"Response content: {response.content}")
            raise ValueError(f"Failed to parse activities: {str(e)}")
    def execute(self, state: dict) -> dict:
        daily_itineraries = []
        current_date = state["user_preferences"]["start_date"]
        
        logger.info("Starting to generate daily itineraries")
        while current_date <= state["user_preferences"]["end_date"]:
            logger.info(f"Processing date: {current_date}")
            location = self._get_location_for_date(current_date, state["route_segments"])
            logger.info(f"Location for {current_date}: {location}")
            activities = self._recommend_activities(
                location,
                state["user_preferences"]["interests"],
                state["budget_breakdown"].activities / len(state["route_segments"])
            )
            logger.info(f"Recommended activities for {current_date}: {activities}")
            
            daily_schedule = self._create_daily_schedule(activities, current_date, location)
            logger.info(f"Daily schedule for {current_date}: {daily_schedule}")
            daily_itineraries.append(daily_schedule)
            current_date += timedelta(days=1)
        
        logger.info("Finished generating daily itineraries")
        return {"daily_itineraries": daily_itineraries}
    def _create_tools(self):
        return [
            Tool(
                name="recommend_activities",
                func=self._recommend_activities,
                description="Recommend activities based on location and interests"
            ),
            Tool(
                name="create_daily_schedule",
                func=self._create_daily_schedule,
                description="Create detailed daily schedule with activities"
            )
        ]
    def _create_daily_schedule(self, activities: List[Activity], date: date, location: str) -> DailyItinerary:
    # Simple v1 implementation
        daily_cost = sum(activity.cost for activity in activities)
        
        return DailyItinerary(
            date=date,
            location=location,
            activities=activities[:3],  # Limit to 3 activities per day for v1
            total_cost=daily_cost,
            free_time=timedelta(hours=2),  # Default free time
            accommodation={"type": "hotel", "cost_per_night": "100.00"}  # Basic accommodation info
        )
    
    def _get_location_for_date(self, target_date: date, route_segments: List[RouteSegment]) -> str:
        """Determine the location for a given date based on route segments"""
        logger.info(f"Getting location for date: {target_date}")
        
        # For v1, simple implementation: if it's the first day, use start location
        # otherwise use end location of the first segment
        if target_date == route_segments[0].start_date:
            return route_segments[0].from_location
        return route_segments[0].to_location