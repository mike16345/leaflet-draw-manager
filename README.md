# leaflet-draw-manager

Drawing on maps made easier.
Classes made for drawing and editing shapes on a map manually.

## Installation

```html
npm i leaflet-draw-manager
```

## Demo

WIP

## Usage/Examples

```javascript
import { useRef, useState } from "react";
import { CircleOptions } from "leaflet";
import { FeatureGroup, useMap } from "react-leaflet";
import L from "leaflet";
import { renderToString } from "react-dom/server";
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
} from "leaflet-draw-manager";
import { BsChatSquareTextFill } from "react-icons/bs";
import { FaMapMarkerAlt, FaCheck, FaEraser, FaUndo } from "react-icons/fa";
import { MdOutlinePolyline } from "react-icons/md";
import { PiFlowArrowBold } from "react-icons/pi";
import { RiSketching } from "react-icons/ri";
import { TbPolygon, TbCircleDashed } from "react-icons/tb";
import ControlBtn from "./ControlsBtn";
import { Else, If, Then, When } from "react-if";

const SketchesToolbar = () => {
  const map = useMap();

  const featureGroup = useRef<L.FeatureGroup | null>(null);
  const shapeFactory = ShapeFactory.getInstance();

  const [sketchType, setSketchType] = useState<Shapes | null>(null);
  const [openToolbar, setOpenToolBar] = useState(false);

  // In case the regular marker does not work properly. Pass this into icon for marker options
  const markerIcon = L.divIcon({
    className: "border-none",
    html: `${renderToString(
      <FaMapMarkerAlt size={28} style={{ color: `white` }} />
    )}`,
  });

  const drawTypes = [
    { type: "polygon", icon: <TbPolygon size={28} /> },
    { type: "circle", icon: <TbCircleDashed size={28} /> },
    { type: "marker", icon: <FaMapMarkerAlt size={28} /> },
    { type: "arrow-polyline", icon: <PiFlowArrowBold size={28} /> },
    { type: "polyline", icon: <MdOutlinePolyline size={28} /> },
  ];

  const getShapeInstance = (type: Shapes) => {
    if (!featureGroup.current || !map) return;
    const options = { color: "red" };

    switch (type) {
      case Shapes.POLYGON:
        return shapeFactory.getPolygonInstance(map, featureGroup.current, options);
      case Shapes.POLYLINE:
        return shapeFactory.getPolylineInstance(map, featureGroup.current, options);
      case Shapes.CIRCLE:
        return shapeFactory.getCircleInstance(
          map,
          featureGroup.current,
          options as CircleOptions
        );
      case Shapes.ARROW_POLYLINE:
        return shapeFactory.getArrowPolylineInstance(
          map,
          featureGroup.current,
          options
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

    shapeInstance.setCustomOnFinishHandler((shape: LeafletShape | null) => {
      if (!shape) return;
      shape.type = sketchType;
      // Add logic to handle shape if needed like
      shape.on("dblclick", (e) => {
        if (!e.target.type) return;
        const shapeInstance = getShapeInstance(e.target.type);
        if (!shapeInstance) return;
        shapeInstance.editShape(shape);
        setSketchType(e.target.type);
      });
    });

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

  return (
    <div className="absolute top-12 right-12 p-2 z-[450]">
      <ControlBtn
        className="rounded-xl font-bold"
        onclick={() => setOpenToolBar((open) => !open)}
      >
        <RiSketching size={28} />
      </ControlBtn>

      <When condition={openToolbar || sketchType !== null}>
        <div className="flex flex-col space-y-2 ">
          <If
            condition={
              ShapeFactory.shapeInstance?.getDrawMode() == DrawManagerMode.EDIT ||
              sketchType
            }
          >
            <Then>
              <ControlBtn
                className="rounded-xl font-bold mt-2"
                onclick={handleConfirmDraw}
              >
                <FaCheck className=" text-green-400" size={28} />
              </ControlBtn>
              <ControlBtn
                className="rounded-xl font-bold"
                onclick={handleDeleteDraw}
              >
                <FaEraser className="text-red-400 " size={28} />
              </ControlBtn>
              <When
                condition={
                  ShapeFactory.shapeInstance !== null &&
                  ShapeFactory.shapeInstance instanceof DrawLineShape
                }
              >
                <ControlBtn
                  className="rounded-xl font-bold"
                  onclick={handleUndoClick}
                >
                  <FaUndo size={28} />
                </ControlBtn>
              </When>
            </Then>
            <Else>
              {drawTypes.map((drawType, index) => {
                return (
                  <ControlBtn
                    key={drawType.type}
                    onclick={() => handleStartDrawing(drawType.type as Shapes)}
                    className={` rounded-xl ${index == 0 && "mt-2"} font-bold`}
                  >
                    {drawType.icon}
                  </ControlBtn>
                );
              })}
            </Else>
          </If>
        </div>
      </When>
      <FeatureGroup ref={featureGroup} />
    </div>
  );
};

export default SketchesToolbar;

```

## Contributing

Contributions are always welcome!
