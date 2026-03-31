from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
import os
import io
from PIL import Image
import json

app = FastAPI(title="Rose Classifier API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL = None
CLASS_NAMES = None
IMG_SIZE = (224, 224)

def load_model():
    global MODEL, CLASS_NAMES
    model_path = "/app/model/ruze_model.keras"
    class_names_path = "/app/model/class_names.json"

    if not os.path.exists(model_path):
        print(f"WARNING: Model not found at {model_path}. Using mock mode.")
        return False

    try:
        import tensorflow as tf
        MODEL = tf.keras.models.load_model(model_path)
        if os.path.exists(class_names_path):
            with open(class_names_path) as f:
                CLASS_NAMES = json.load(f)
        else:
            CLASS_NAMES = ["Rosa_canina", "Rosa_multiflora", "Rosa_rugosa", "Rosa_woodsii"]
        print(f"Model loaded. Classes: {CLASS_NAMES}")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

@app.on_event("startup")
async def startup():
    load_model()

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": MODEL is not None, "classes": CLASS_NAMES}

@app.post("/classify")
async def classify(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB").resize(IMG_SIZE)
    img_array = np.array(image) / 255.0
    img_batch = np.expand_dims(img_array, 0)

    if MODEL is None:
        # Mock mode for development without model
        mock_classes = CLASS_NAMES or ["Rosa_canina", "Rosa_multiflora", "Rosa_rugosa", "Rosa_woodsii"]
        probs = np.random.dirichlet(np.ones(len(mock_classes)) * 0.5).tolist()
        predictions = [{"class": c, "probability": round(p, 4)} for c, p in zip(mock_classes, probs)]
        predictions.sort(key=lambda x: x["probability"], reverse=True)
        return {"predictions": predictions, "mock": True}

    preds = MODEL.predict(img_batch, verbose=0)[0]
    predictions = [
        {"class": CLASS_NAMES[i], "probability": round(float(preds[i]), 4)}
        for i in range(len(CLASS_NAMES))
    ]
    predictions.sort(key=lambda x: x["probability"], reverse=True)
    return {"predictions": predictions, "mock": False}
