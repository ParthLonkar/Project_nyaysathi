from langchain_openai import ChatOpenAI
from app.config.settings import Settings

settings = Settings()

llm = ChatOpenAI(
    api_key=settings.OPENAI_API_KEY,
    model="gpt-4",
    temperature=0.7,
)


async def call_openai(prompt: str, temperature: float = 0.7):
    """Call OpenAI API with given prompt"""
    response = llm.invoke(prompt)
    return response.content
