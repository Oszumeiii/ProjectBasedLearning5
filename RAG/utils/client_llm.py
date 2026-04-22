# client_llm.py
from google import genai
import dotenv
import os
# load API key from .env
dotenv.load_dotenv()
API_KEY = os.getenv("API_KEY")

if not API_KEY:
    raise ValueError("API_KEY not found in environment variables")

client = genai.Client(api_key=API_KEY)