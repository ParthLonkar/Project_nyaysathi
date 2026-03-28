from langchain_google_genai import ChatGoogleGenerativeAI
from app.config.settings import Settings

settings = Settings()

llm = ChatGoogleGenerativeAI(
    api_key=settings.GEMINI_API_KEY,
    model=settings.GEMINI_MODEL,
    temperature=0.7,
)


async def call_gemini(prompt: str, temperature: float = 0.7):
    """Call Google Gemini API with given prompt"""
    response = llm.invoke(prompt)
    return response.content
