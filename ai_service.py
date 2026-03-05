from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class RequestData(BaseModel):
    text: str

@app.post("/analyze")
def analyze(data: RequestData):
    sentiment = "positive"
    return {"sentiment": sentiment}