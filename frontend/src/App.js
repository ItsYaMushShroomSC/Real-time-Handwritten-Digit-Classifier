import React, { useState, useRef } from "react";
import CanvasDraw from "react-canvas-draw";
import backgroundImage from "./catImg.png";
console.log(backgroundImage);

function App() {
  const canvasRef = useRef(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState("Default");  // default model

  const modelOptions = [
    "Default",
    "20 Layer NN",
    "Transfer Learning",
    "Data Augmentation",
    "Data Synthesis",
    "Model F",
    "Model G",
    "Model H",
    "Model I",
    "Model J",
  ];

  const clearCanvas = () => {
    canvasRef.current.clear();
    setPrediction(null);
    setError(null);
  };

  const undoLast = () => {
    canvasRef.current.undo();
    setPrediction(null);
    setError(null);
  };

  const getCanvasImage = () => {
    if (!canvasRef.current) {
      setError("Canvas is not available.");
      return null;
    }
    return canvasRef.current.getDataURL();
  };

  const sendImageToBackend = async () => {
    setLoading(true);
    setError(null);
    const imageData = getCanvasImage();

    // check if canvas is blank

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setPrediction(result.prediction);
    } catch (err) {
      console.error("Error sending request to backend:", err);
      setError("Failed to get prediction. Please try again.");
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        minHeight: "100vh",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        paddingTop: "40px",
        overflow: "hidden",        // prevents scrollbars from appearing
        height: "100vh",           // restricts container height to viewport height
        display: "flex",           // added to layout sidebar next to main content
      }}
    >
      <div style={{ flex: 1 }}>
        <h1 style={{ marginTop: "20px" }}>Handwritten Digit Classifier</h1>
        <CanvasDraw
          ref={canvasRef}
          brushRadius={5}
          lazyRadius={0}
          canvasWidth={500}
          canvasHeight={500}
          style={{
            marginTop: "40px",
            marginLeft: "50px",
            border: "1px solid #ccc",
            background: "white",
          }}
        />
        <div style={{ marginTop: 10 }}>
          <button
            onClick={clearCanvas}
            style={{ minWidth: "80px", transition: "background-color 0.3s" }}
          >
            Clear
          </button>
          <button
            onClick={undoLast}
            style={{ minWidth: "80px", transition: "background-color 0.3s" }}
          >
            Undo
          </button>
          <button
            onClick={sendImageToBackend}
            style={{ minWidth: "80px", transition: "background-color 0.3s" }}
          >
            Predict
          </button>
        </div>
        {prediction !== null && <p>Prediction: {prediction}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
  
      {/* Sidebar for model selection */}
      <div
        style={{
          width: "200px",
          backgroundColor: "rgba(255,255,255,0.8)",
          padding: "20px",
          borderLeft: "1px solid #ccc",
          overflowY: "auto",
          textAlign: "left",
        }}
      >
        <h3>Select AI Model</h3>
        {modelOptions.map((model) => (
          <button
            key={model}
            onClick={() => setSelectedModel(model)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: "10px",
              padding: "10px",
              backgroundColor: selectedModel === model ? "#4caf50" : "#eee",
              color: selectedModel === model ? "white" : "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
          >
            {model}
          </button>
        ))}
      </div>
    </div>
  );
}  

export default App;
