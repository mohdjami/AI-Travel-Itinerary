from langgraph.graph import StateGraph
from typing import Dict, TypedDict
import logging
from app.agents.route_agent import RouteAgent
from app.agents.activities_agent import ActivitiesAgent
from app.models.schemas import CompleteItinerary

logger = logging.getLogger(__name__)
END = "end"

class AgentState(TypedDict):
    user_preferences: dict
    route_segments: list
    daily_itineraries: list
    budget_breakdown: dict
    errors: list
    retry_count: int

class TravelService:
    def __init__(self, llm_service):
        self.llm_service = llm_service
        self.route_agent = RouteAgent(llm_service)
        self.activities_agent = ActivitiesAgent(llm_service)
        self.workflow = self._create_workflow()

    def _create_workflow(self):
        workflow = StateGraph(AgentState)
        
        workflow.add_node("route_planning", self.route_agent.execute)
        workflow.add_node("activity_planning", self.activities_agent.execute)
        workflow.add_node("finalize", self._finalize_itinerary)
        workflow.add_node(END, lambda x: x)

        workflow.add_edge("route_planning", "activity_planning")
        
        workflow.add_conditional_edges(
            "route_planning",
            self._handle_errors,
            {
                "retry": "route_planning",
                "continue": "activity_planning",
                "error": END
            }
        )

        workflow.add_conditional_edges(
            "activity_planning",
            self._handle_errors,
            {
                "retry": "activity_planning",
                "continue": "finalize",
                "error": END
            }
        )

        workflow.set_entry_point("route_planning")
        workflow.set_finish_point("finalize")

        return workflow.compile()

    def _handle_errors(self, state: AgentState) -> str:
        if state.get("errors"):
            if state["retry_count"] < 3:
                state["retry_count"] += 1
                return "retry"
            return "error"
        return "continue"

    def _finalize_itinerary(self, state: AgentState) -> CompleteItinerary:
        # Calculate total cost by summing daily itinerary costs
        daily_total = sum(daily.total_cost for daily in state["daily_itineraries"])
        
        # Add route segment costs
        route_total = sum(segment.cost for segment in state["route_segments"])
        
        # Calculate total cost
        total_cost = daily_total + route_total
        
        return CompleteItinerary(
            user_preferences=state["user_preferences"],
            route_segments=state["route_segments"],
            daily_itineraries=state["daily_itineraries"],
            budget_breakdown=state["budget_breakdown"],
            total_cost=total_cost,
            notes=[]
        )
    def generate_itinerary(self, preferences: dict) -> CompleteItinerary: 
        try:
            initial_state = AgentState(
                user_preferences=preferences,
                route_segments=[],
                daily_itineraries=[],
                budget_breakdown={},
                errors=[],
                retry_count=0
            )

            result = self.workflow.invoke(initial_state)  
            return result
        except Exception as e:
            logger.error(f"Failed to generate itinerary: {str(e)}")
            raise