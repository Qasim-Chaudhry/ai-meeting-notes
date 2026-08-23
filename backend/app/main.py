from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World! FastAPI is working perfectly."}

@app.get("/api/status")
def get_status():
    return {"status": "online", "database": "PostgreSQL ready"}
