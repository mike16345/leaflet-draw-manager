import { useRef } from "react";
import L, { Circle, CircleOptions } from "leaflet";
import { FeatureGroup, useMap } from "react-leaflet";
import { ShapeFactory, DrawCircle } from "leaflet-draw-manager";

const CirclesInMap = () => {
  const map = useMap();
  const circleGroup = useRef<L.FeatureGroup>(null);
  const circleOptions: CircleOptions = { color: "red", radius: 0 };
  const shapeFactory = ShapeFactory.getInstance();
  const drawCircle = useRef<DrawCircle | null>(null);
  const latestCircle = useRef<Circle | null>(null);

  const handleDrawCircle = () => {
    if (!circleGroup.current) return;
    drawCircle.current = shapeFactory.getCircleInstance(
      map,
      circleGroup.current,
      circleOptions
    );
    console.log("start drawing");
    drawCircle.current.startDrawing();
    drawCircle.current.setCustomOnFinishHandler((circle: Circle | null) => {
      latestCircle.current = circle;
    });
  };

  const handleEditCircle = () => {
    if (!drawCircle.current || !latestCircle.current) return;

    drawCircle.current.editShape(latestCircle.current);
  };

  const handleDeleteCircle = () => {
    if (!drawCircle.current) return;
    drawCircle.current.deleteShape();
  };

  const handleStopDrawing = () => {
    if (!drawCircle.current) return;
    drawCircle.current.stopDrawing();
  };

  const handleCancelEdit = () => {
    if (!drawCircle.current) return;
    drawCircle.current.cancelEdit();
  };

  return (
    <div className="draw-container">
      <button onClick={handleDrawCircle} className="draw-button">
        Draw Circle
      </button>
      <button onClick={handleStopDrawing} className="draw-button">
        Stop Drawing
      </button>
      <button onClick={handleEditCircle} className="draw-button">
        Edit Circle
      </button>
      <button onClick={handleCancelEdit} className="draw-button">
        Cancel Edit
      </button>
      <button onClick={handleDeleteCircle} className="draw-button">
        Delete Circle
      </button>
      <FeatureGroup ref={circleGroup}></FeatureGroup>
    </div>
  );
};

export default CirclesInMap;
