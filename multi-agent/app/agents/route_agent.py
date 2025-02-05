from langchain.agents import Tool, AgentExecutor
from langchain.prompts import ChatPromptTemplate
from app.models.schemas import RouteSegment, BudgetBreakdown
from typing import List, Dict
import json
import logging

logger = logging.getLogger(__name__)

from datetime import date
import json
from typing import List, Dict
from langchain.prompts import ChatPromptTemplate
from app.models.schemas import RouteSegment, BudgetBreakdown
import logging
from datetime import date, timedelta
logger = logging.getLogger(__name__)

class RouteAgent:
    def __init__(self, llm_service):
        self.llm_service = llm_service
        self.tools = self._create_tools()

    def _serialize_preferences(self, preferences: dict) -> dict:
        """Convert date objects to ISO format strings"""
        serialized = preferences.copy()
        if 'start_date' in serialized and isinstance(serialized['start_date'], date):
            serialized['start_date'] = serialized['start_date'].isoformat()
        if 'end_date' in serialized and isinstance(serialized['end_date'], date):
            serialized['end_date'] = serialized['end_date'].isoformat()
        logger.info(f"Serialized preferences: {serialized}")  # Log serialized preferences
        return serialized

    def _plan_route(self, start: str, end: str, preferences: dict) -> List[RouteSegment]:
        try:
            llm = self.llm_service.get_llm("route")
            logger.info(f"Starting route planning from {start} to {end}")

            # Specify exact transport_mode values in the system message
            system_message = """You are a route planning API. Return only a JSON array containing route segments.
    Each segment must be in this exact format:
    [
    {
        "from_location": "StartCity",
        "to_location": "EndCity",
        "transport_mode": "train",  # MUST be one of: flight, train, bus, car
        "departure_time": "09:00",
        "arrival_time": "12:00",
        "cost": 100.00,
        "duration": "03:00:00",
        "details": {"service": "Example"}
    }
    ]"""

            human_message = f"Create a route from {start} to {end} using train as transport mode."

            messages = [
                ("system", system_message),
                ("human", human_message)
            ]

            logger.info("Sending prompt to LLM")
            response = llm.invoke(messages)
            logger.info(f"Raw LLM response received: {response.content}")
            
        # Rest of the implementation remains same...
            # Clean and parse response
            content = response.content.strip()
            
            # Find JSON array
            start_idx = content.find('[')
            end_idx = content.rfind(']')
            
            if start_idx == -1 or end_idx == -1:
                logger.error("No valid JSON array found in response")
                raise ValueError("Invalid response format: no JSON array found")
                
            json_str = content[start_idx:end_idx + 1]
            logger.info(f"Extracted JSON string: {json_str}")
            
            try:
                route_data = json.loads(json_str)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON: {e}")
                raise ValueError(f"Invalid JSON format: {e}")

            segments = []
            for segment in route_data:
                # Convert duration string to timedelta
                duration_str = segment['duration']
                h, m, s = map(int, duration_str.split(':'))
                segment['duration'] = timedelta(hours=h, minutes=m, seconds=s)
                segments.append(RouteSegment(**segment))

            return segments

        except Exception as e:
            logger.error(f"Route planning failed: {str(e)}", exc_info=True)
            raise ValueError(f"Route planning failed: {str(e)}")
    

    def execute(self, state: dict) -> dict:
        try:
            logger.info("Starting route agent execution")
            logger.info(f"Input state: {state}")

            route_segments = self._plan_route(
                state["user_preferences"]["start_location"],
                state["user_preferences"]["end_location"],
                state["user_preferences"]
            )

            logger.info(f"Route planning completed, calculating costs")
            budget = self._calculate_costs(route_segments, state["user_preferences"])
            
            result = {
                "route_segments": route_segments,
                "budget_breakdown": budget
            }
            logger.info(f"Execution completed successfully: {result}")
            return result

        except Exception as e:
            logger.error(f"Execution failed: {str(e)}", exc_info=True)
            raise

    def _calculate_costs(self, route_segments: List[RouteSegment], 
                        preferences: dict) -> BudgetBreakdown:
        total_transport = sum(segment.cost for segment in route_segments)
        
        return BudgetBreakdown(
            transport=total_transport,
            accommodation=preferences["budget"] * 0.4,
            activities=preferences["budget"] * 0.3,
            food=preferences["budget"] * 0.2,
            miscellaneous=preferences["budget"] * 0.1
        )        
    def _create_tools(self):
        return [
            Tool(
                name="plan_route",
                func=self._plan_route,
                description="Plan optimal route between locations"
            ),
            Tool(
                name="calculate_costs",
                func=self._calculate_costs,
                description="Calculate travel costs and budget allocation"
            )
        ]