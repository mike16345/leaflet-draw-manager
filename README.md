# Leaflet Draw Manager

Drawing shapes on maps made easier with Leaflet.
Classes designed for drawing and editing shapes on a map manually.

## Demo

_(Work in Progress)_

## Documentation

### Table of Contents

- [tl;dr](#tldr)
- [Custom Event Handlers](#custom-event-handlers)

## tl;dr

- Install using `npm i --save leaflet-draw-manager`.
- Import `{ ShapeFactory }` from `"leaflet-draw-manager"`.
- Instantiate ShapeFactory: `const shapeFactory = ShapeFactory.getInstance()`.
- Instantiate any class: `const drawPolygon = shapeFactory.getPolygonInstance(map, featureGroup, shapeOptions)`.
- Start drawing: `drawPolygon.startDrawing()`.

## Basic Usage

_(To be filled)_

## Custom Event Handlers

| Event Name                  | Description                                                                                                                                      | Example                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `onFinish`                  | Fired when stopDrawing() method is called. This event provides the final shape object as a parameter.                                            | `shapeInstance.on("onFinish", (shape: LeafletShape \| null) => { /* Your code here */ });`      |
| `onAddPoint`                | Fired when a new point is added to the shape during drawing. The updated shape's coordinates are provided as parameters.                         | `shapeInstance.on("onAddPoint", (latlngs: LatLng[]) => { /* Your code here */ });`              |
| `onDeletePoint`             | Fired when a point is deleted from the shape during drawing/editing. The coordinates of the shape after the point has been deleted are provided. | `shapeInstance.on("onDeletePoint", (latlngs: LatLng[]) => { /* Your code here */ });`           |
| `onDragVertex`              | Fired continuously while user is dragging a vertex of the shape. The coordinates of the updated shape are provided.                              | `shapeInstance.on("onDragVertex", (latlngs: LatLng[]) => { /* Your code here */ });`            |
| `onDragEndVertex`           | Fired when dragging of a vertex ends during editing. The final coordinates of the shape is provided.                                             | `shapeInstance.on("onDragEndVertex", (latlngs: LatLng[]) => { /* Your code here */ });`         |
| `onDragVertexStart`         | Fired when user starts dragging a vertex. No parameters are provided.                                                                            | `shapeInstance.on("onDragVertexStart", () => { /* Your code here */ });`                        |
| `onDragMidpointVertex`      | Fired continuously while user is dragging a midpoint vertex of the shape. The updated coordinates of the shape are provided.                     | `shapeInstance.on("onDragMidpointVertex", (latlngs: LatLng[]) => { /* Your code here */ });`    |
| `onDragEndMidpointVertex`   | Fired when the user stop dragging a midpoint vertex. The final coordinates of the shape are provided.                                            | `shapeInstance.on("onDragEndMidpointVertex", (latlngs: LatLng[]) => { /* Your code here */ });` |
| `onDragMidpointVertexStart` | Fired when user starts dragging a midpoint vertex. No parameters are provided.                                                                   | `shapeInstance.on("onDragMidpointVertexStart", () => { /* Your code here */ });`                |
| `onDeleteShape`             | Fired when the deleteShape() method is called. No parameters are provided.                                                                       | `shapeInstance.on("onDeleteShape", () => { /* Your code here */ });`                            |
| `onDrawStart`               | Fired when the startDrawing() method is called. No parameters are provided.                                                                      | `shapeInstance.on("onDrawStart", () => { /* Your code here */ });`                              |
| `onEditStart`               | Fired when editShape(shapeToEdit) method is called. No parameters are provided.                                                                  | `shapeInstance.on("onEditStart", () => { /* Your code here */ });`                              |
| `onEdit`                    | Fired when the coordinates of the shape are changed . The updated coordinates are provided.                                                      | `shapeInstance.on("onEdit", (latLngs:LatLng[]) => { /_ Your code here _/ });`                   |
| `onCancelEdit`              | Fired when the cancelEdit() method is called. The shape object after the canceled edit is provided as a parameter.                               | `shapeInstance.on("onCancelEdit", (shape: LeafletShape \| null) => { /* Your code here */ });`  |

## Usage/Examples

```javascript
// Import necessary dependencies
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

// Define SketchesToolbar component
const SketchesToolbar = () => {
  // Initialize map and featureGroup references
  const map = useMap();
  const featureGroup = useRef<L.FeatureGroup | null>(null);
  const shapeFactory = ShapeFactory.getInstance();

  // Define state variables
  const [sketchType, setSketchType] = useState<Shapes | null>(null);
  const [openToolbar, setOpenToolBar] = useState(false);

  // Define drawTypes array
  const drawTypes = [
    { type: "polygon", icon: <TbPolygon size={28} /> },
    { type: "circle", icon: <TbCircleDashed size={28} /> },
    { type: "marker", icon: <FaMapMarkerAlt size={28} /> },
    { type: "arrow-polyline", icon: <PiFlowArrowBold size={28} /> },
    { type: "polyline", icon: <MdOutlinePolyline size={28} /> },
  ];

  // Define helper functions for drawing shapes
  const getShapeInstance = (type: Shapes) => { /* Implementation details */ };
  const handleConfirmDraw = () => { /* Implementation details */ };
  const handleUndoClick = () => { /* Implementation details */ };
  const handleDeleteDraw = () => { /* Implementation details */ };
  const handleStartDrawing = (sketchType: Shapes) => { /* Implementation details */ };
  const canConfirmDrawing = () => { /* Implementation details */ };

  return (
    // SketchesToolbar JSX component
  );
};

export default SketchesToolbar;
```
