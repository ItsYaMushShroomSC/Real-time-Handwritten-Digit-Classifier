import React, { useRef } from "react";
import CanvasDraw from "react-canvas-draw";

function App() {
  const canvasRef = useRef(null);

  const clearCanvas = () => {
    canvasRef.current.clear();
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Handwritten Digit Classifier</h1>
      <CanvasDraw ref={canvasRef} brushRadius={5} lazyRadius={1} />
      <button onClick={clearCanvas}>Clear</button>
    </div>
  );
}

export default App;
