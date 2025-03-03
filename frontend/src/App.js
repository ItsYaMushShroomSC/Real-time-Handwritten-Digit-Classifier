import React, { useState, useRef } from "react";
import CanvasDraw from "react-canvas-draw";

function App() {
  const canvasRef = useRef(null);
  const [prediction, setPrediction] = useState(null);

  const clearCanvas = () => {
    canvasRef.current.clear();
  };

  const getCanvasImage = () => {
    return canvasRef.current.getDataURL(); // Get image data from canvas as a base64 string
  };

  const sendImageToBackend = async () => {
    const imageData = getCanvasImage(); // Get image data from the canvas
    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }), // Send image data to backend
      });
      const result = await response.json();
      setPrediction(result.prediction); // Store prediction in state
    } catch (error) {
      console.error("Error sending request to backend:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Handwritten Digit Classifier</h1>
      <CanvasDraw ref={canvasRef} brushRadius={5} lazyRadius={1} />
      <div>
        <button onClick={clearCanvas}>Clear</button>
        <button onClick={sendImageToBackend}>Predict</button>
      </div>
      {prediction && <p>Prediction: {prediction}</p>}
    </div>
  );
}

export default App;
