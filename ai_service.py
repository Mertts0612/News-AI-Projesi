from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class RequestData(BaseModel):
    text: str

@app.post("/predict")
def predict(data: RequestData):
    # burada kendi modelin
    result = "Glioblastoma"
    return {"prediction": result}