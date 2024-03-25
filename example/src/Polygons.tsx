import { useRef } from "react";
import L, { Polygon, PolylineOptions } from "leaflet";
import { FeatureGroup, useMap } from "react-leaflet";
import { ShapeFactory, DrawPolygon } from "leaflet-draw-manager";

const PolygonsInMap = () => {
  const map = useMap();
  const polygonGroup = useRef<L.FeatureGroup>(null);
  const polygonOptions: PolylineOptions = { color: "red" };
  const shapeFactory = ShapeFactory.getInstance();
  const drawPolygon = useRef<DrawPolygon | null>(null);
  const latestPolygon = useRef<Polygon | null>(null);

  const handleDrawPolygon = () => {
    if (!polygonGroup.current) return;
    drawPolygon.current = shapeFactory.getPolygonInstance(
      map,
      polygonGroup.current,
      polygonOptions
    );
    drawPolygon.current.startDrawing();
    drawPolygon.current.setCustomOnFinishHandler((polygon: Polygon | null) => {
      latestPolygon.current = polygon;
    });
  };

  const handleEditPolygon = () => {
    if (!drawPolygon.current || !latestPolygon.current) return;

    drawPolygon.current.editShape(latestPolygon.current);
  };

  const handleDeletePolygon = () => {
    if (!drawPolygon.current) return;
    drawPolygon.current.deleteShape();
  };

  const handleStopDrawing = () => {
    if (!drawPolygon.current) return;
    drawPolygon.current.stopDrawing();
  };

  const handleCancelEdit = () => {
    if (!drawPolygon.current) return;
    drawPolygon.current.cancelEdit();
  };

  return (
    <>
      <div className="draw-container">
        <button onClick={handleDrawPolygon} className="draw-button">
          Draw Polygon
        </button>
        <button onClick={handleStopDrawing} className="draw-button">
          Stop Drawing
        </button>
        <button onClick={handleEditPolygon} className="draw-button">
          Edit Polygon
        </button>
        <button onClick={handleCancelEdit} className="draw-button">
          Cancel Edit
        </button>
        <button onClick={handleDeletePolygon} className="draw-button">
          Delete Polygon
        </button>
      </div>
      <FeatureGroup ref={polygonGroup}></FeatureGroup>
    </>
  );
};

export default PolygonsInMap;
