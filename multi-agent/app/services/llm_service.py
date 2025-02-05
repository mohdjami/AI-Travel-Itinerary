from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from config import get_settings
from typing import Literal
import logging

logger = logging.getLogger(__name__)
class LLMService:
    def __init__(self):
        self.settings = get_settings()
        self.groq = ChatGroq(
            api_key=self.settings.GROQ_API_KEY,
            temperature=self.settings.MODEL_TEMPERATURE
        )
        self.gemini = ChatGoogleGenerativeAI(
            google_api_key=self.settings.GEMINI_API_KEY,
            model="gemini-pro",
            temperature=self.settings.MODEL_TEMPERATURE,
            convert_system_message_to_human=True
        )
    
    def get_llm(self, type: Literal["route", "activities"]):
        if type == "route":
            return self.groq
        return self.gemini

    def handle_llm_error(self, primary_llm, backup_llm, error):
        logger.error(f"LLM Error: {str(error)}")
        try:
            return backup_llm
        except Exception as e:
            raise Exception(f"Both LLMs failed: {str(e)}")