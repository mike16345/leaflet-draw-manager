import { FaMapMarkerAlt, FaCheck, FaEraser, FaUndo, FaEye } from "react-icons/fa";
import { MdOutlinePolyline } from "react-icons/md";
import { PiFlowArrowBold } from "react-icons/pi";
import { RiSketching } from "react-icons/ri";
import { TbPolygon, TbCircleDashed } from "react-icons/tb";

import { useEffect, useRef, useState } from "react";
import { LatLng } from "leaflet";
import { FeatureGroup, useMap } from "react-leaflet";
import L from "leaflet";
// import {
//   DrawArrowPolyline,
//   DrawCircle,
//   DrawLineShape,
//   DrawManagerMode,
//   DrawMarker,
//   DrawPolygon,
//   DrawPolyline,
//   LeafletShape,
//   ShapeFactory,
//   Shapes,
//   getShapePositions,
// } from "leaflet-draw-manager";
import {
  DrawArrowPolyline,
  DrawCircle,
  DrawLineShape,
  DrawManagerMode,
  DrawMarker,
  DrawPolygon,
  DrawPolyline,
  LeafletShape,
  ShapeFactory,
  Shapes,
  getShapePositions,
} from "../../../src/index";
import { shapeClassConfig } from "../ShapeConfig";
import { FcCancel } from "react-icons/fc";

const SketchesToolbar = () => {
  const map = useMap();

  const featureGroup = useRef<L.FeatureGroup | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);
  const shapeFactory = ShapeFactory.getInstance(shapeClassConfig);
  const [sketchType, setSketchType] = useState<Shapes | null>(null);
  const [openToolbar, setOpenToolBar] = useState(false);
  const [showDistance, setShowDistance] = useState(false);

  const drawTypes = [
    { type: "polygon", icon: <TbPolygon size={28} /> },
    { type: "circle", icon: <TbCircleDashed size={28} /> },
    { type: "marker", icon: <FaMapMarkerAlt size={28} /> },
    { type: "arrow-polyline", icon: <PiFlowArrowBold size={28} /> },
    { type: "polyline", icon: <MdOutlinePolyline size={28} /> },
  ];

  const getShapeInstance = (type: Shapes) => {
    if (!featureGroup.current || !map) return;
    const shapeOptions = { color: "red" };

    switch (type) {
      case Shapes.POLYGON:
        return shapeFactory.getPolygonInstance(
          map,
          featureGroup.current,
          shapeOptions
        );
      case Shapes.POLYLINE:
        return shapeFactory.getPolylineInstance(
          map,
          featureGroup.current,
          shapeOptions
        );
      case Shapes.CIRCLE:
        return shapeFactory.getCircleInstance(map, featureGroup.current, {
          ...shapeOptions,
          radius: 0,
        });
      case Shapes.ARROW_POLYLINE:
        return shapeFactory.getArrowPolylineInstance(
          map,
          featureGroup.current,
          shapeOptions
        );
      case Shapes.MARKER:
        return shapeFactory.getMarkerInstance(map, featureGroup.current, {});
      case Shapes.ICON:
        const markerInstance = shapeFactory.getMarkerInstance(
          map,
          featureGroup.current,
          {}
        );
        markerInstance.setIsTextMarker(true);

        return markerInstance;
    }
  };

  const handleConfirmDraw = () => {
    if (!ShapeFactory.shapeInstance || !canConfirmDrawing()) return;
    ShapeFactory.shapeInstance.stopDrawing();
    setSketchType(null);
  };

  const handleUndoClick = () => {
    if (
      !ShapeFactory.shapeInstance ||
      ShapeFactory.shapeInstance instanceof DrawMarker ||
      ShapeFactory.shapeInstance instanceof DrawCircle
    )
      return;
    ShapeFactory.shapeInstance.handleContextClick();
  };

  const handleDeleteDraw = () => {
    ShapeFactory.shapeInstance?.deleteShape();
    setSketchType(null);
  };

  const handleStartDrawing = (sketchType: Shapes) => {
    const shapeInstance = getShapeInstance(sketchType);
    if (!shapeInstance) return;

    shapeInstance.on("onFinish", (shape: LeafletShape | null) => {
      if (!shape) return;
      //@ts-ignore
      shape.type = sketchType;
      shape.on("dblclick", (e) => {
        if (!e.target.type) return;
        const shapeInstance = getShapeInstance(e.target.type);
        if (!shapeInstance) return;
        shapeInstance.editShape(e.target);
        setSketchType(e.target.type);
      });
    });

    shapeInstance.on("onAddPoint", (latlngs: LatLng[]) => {});

    shapeInstance.on("onDeletePoint", (latlngs: LatLng[]) => {});

    shapeInstance.on("onDragVertex", (latlngs: LatLng[]) => {});

    shapeInstance.on("onDragEndVertex", (latlngs: LatLng[]) => {});

    shapeInstance.on("onDragVertexStart", () => {});

    shapeInstance.on("onDragMidpointVertex", (latlngs: LatLng[]) => {});

    shapeInstance.on("onDragEndMidpointVertex", (latlngs: LatLng[]) => {});

    shapeInstance.on("onDragMidpointVertexStart", () => {});

    shapeInstance.on("onDeleteShape", (shape: LeafletShape | null) => {});

    shapeInstance.on("onDrawStart", () => {});

    shapeInstance.on("onEditStart", () => {});

    shapeInstance.on("onCancelEdit", (shape: LeafletShape | null) => {});

    shapeInstance.on("onEdit", () => {});

    setSketchType(sketchType);
    shapeInstance.startDrawing();
  };

  const canConfirmDrawing = () => {
    if (!ShapeFactory.shapeInstance) return false;

    const shape = ShapeFactory.shapeInstance.getCurrentShape();
    if (!shape) return false;
    const positions = getShapePositions(shape);

    if (ShapeFactory.shapeInstance instanceof DrawPolygon) {
      return positions.length >= 3;
    } else if (
      ShapeFactory.shapeInstance instanceof DrawArrowPolyline ||
      ShapeFactory.shapeInstance instanceof DrawPolyline
    ) {
      return positions.length >= 2;
    }

    return positions.length >= 1;
  };

  const handleCancelEdit = () => {
    if (!ShapeFactory.shapeInstance) return;
    ShapeFactory.shapeInstance.cancelEdit();
    setSketchType(null);
  };

  const handleShowDistances = () => {
    if (!(ShapeFactory.shapeInstance instanceof DrawLineShape)) return;
    ShapeFactory.shapeInstance.displayLineDistances(!showDistance);
    setShowDistance((show) => !show);
  };

  useEffect(() => {
    // There is a bug that when clicking on an element on the map the map still captures the click.
    // This prevents that extra click.
    if (!divRef.current) return;
    L.DomEvent.disableClickPropagation(divRef.current);
  });

  return (
    <div ref={divRef} className="absolute top-12 right-12 p-2 z-[450]">
      <button
        className="rounded-xl font-bold border bg-black/70 p-2  text-white"
        onClick={() => setOpenToolBar((open) => !open)}
      >
        <RiSketching size={28} />
      </button>

      {(openToolbar || sketchType !== null) && (
        <div className="flex flex-col space-y-2">
          {(ShapeFactory.shapeInstance?.getDrawMode() === DrawManagerMode.EDIT ||
            sketchType) && (
            <>
              <button
                className="rounded-xl font-bold border bg-black/70 p-2 mt-2"
                onClick={handleConfirmDraw}
              >
                <FaCheck className="text-green-400" size={28} />
              </button>
              <button
                className="rounded-xl font-bold border bg-black/70 p-2"
                onClick={handleDeleteDraw}
              >
                <FaEraser className="text-red-400" size={28} />
              </button>
              {ShapeFactory.shapeInstance?.getDrawMode() == DrawManagerMode.EDIT && (
                <button
                  className="rounded-xl font-bold border bg-black/70 p-2 text-white"
                  onClick={handleCancelEdit}
                >
                  <FcCancel size={28} />
                </button>
              )}
              {ShapeFactory.shapeInstance !== null &&
                ShapeFactory.shapeInstance instanceof DrawLineShape && (
                  <button
                    className="rounded-xl font-bold border bg-black/70 p-2 text-white"
                    onClick={handleUndoClick}
                  >
                    <FaUndo size={28} />
                  </button>
                )}
              <button
                className="rounded-xl font-bold border bg-black/70 p-2 text-white"
                onClick={handleShowDistances}
              >
                <FaEye size={28} />
              </button>
            </>
          )}
          {!(
            ShapeFactory.shapeInstance?.getDrawMode() === DrawManagerMode.EDIT ||
            sketchType
          ) &&
            drawTypes.map((drawType, index) => (
              <button
                key={drawType.type}
                onClick={() => handleStartDrawing(drawType.type as Shapes)}
                className={`rounded-xl ${
                  index === 0 && "mt-2"
                } font-bold p-2 bg-black/70 text-white`}
              >
                {drawType.icon}
              </button>
            ))}
        </div>
      )}
      <FeatureGroup ref={featureGroup} />
    </div>
  );
};

export default SketchesToolbar;
