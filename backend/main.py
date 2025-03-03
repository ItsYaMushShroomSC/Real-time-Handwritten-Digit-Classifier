from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import onnxruntime as ort
import numpy as np
import base64
from PIL import Image
from io import BytesIO

app = FastAPI()

# Define CORS settings
origins = [
    "http://localhost:3000",  # React frontend
    "http://127.0.0.1:3000",  # React frontend
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows these origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Load the ONNX model
onnx_model_path = "../digit_classifier.onnx"
ort_session = ort.InferenceSession(onnx_model_path)

# Define the request body model
class ImageData(BaseModel):
    image: str  # base64 encoded image

def preprocess_image(image_data: str):
    # Check if the base64 string includes a prefix (e.g., 'data:image/png;base64,')
    if image_data.startswith('data:image'):
        # Remove the prefix
        image_data = image_data.split(',')[1]

    # Check if the base64 string needs padding
    padding = len(image_data) % 4
    if padding != 0:
        image_data += '=' * (4 - padding)  # Add necessary padding

    # Decode the base64 string into bytes
    try:
        img_bytes = base64.b64decode(image_data)
    except Exception as e:
        print(f"Error decoding base64 string: {e}")
        return None

    # Convert the byte data into a PIL image
    try:
        img = Image.open(BytesIO(img_bytes)).convert('L')  # Convert to grayscale
    except Exception as e:
        print(f"Error opening image: {e}")
        return None

    # Resize to the expected input size (28x28 for MNIST)
    img = img.resize((28, 28))

    # Convert image to numpy array and normalize
    img_array = np.array(img).astype(np.float32)
    img_array = (img_array / 255.0)  # Normalize to [0, 1]

    # Add batch dimension and channel dimension (1, 28, 28)
    img_array = np.expand_dims(img_array, axis=0)  # Shape (1, 28, 28)
    img_array = np.expand_dims(img_array, axis=1)  # Shape (1, 1, 28, 28)

    return img_array


# Prediction endpoint
@app.post("/predict")
async def predict(data: ImageData):
    # Preprocess the image
    image = preprocess_image(data.image)

    # Run the image through the model
    ort_inputs = {ort_session.get_inputs()[0].name: image}
    ort_outs = ort_session.run(None, ort_inputs)

    # The model output is a logits array. Convert it to probabilities and get the predicted class
    prediction = np.argmax(ort_outs[0], axis=1)[0]
    
    return {"prediction": int(prediction)}

@app.get("/")
def read_root():
    return {"message": "FastAPI backend is running?"}
