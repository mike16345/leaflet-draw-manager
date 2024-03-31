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

This can be replaced with any class. Note: Not all classes have the handleUndoClick method.

```javascript
// App.tsx

import "./App.css";
import { MapContainer, TileLayer } from "react-leaflet";
import CirclesInMap from "./Circle";

function App() {
  const position = { lat: 44.5, lng: -89.5 };

  return (
    <>
      <MapContainer
        className="map map-container z-[1]"
        minZoom={6}
        zoom={14}
        zoomControl={false}
        center={position}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          // tms={true}
          maxNativeZoom={16}
          maxZoom={20}
        />
        <CirclesInMap />
      </MapContainer>
    </>
  );
}

export default App;
```

```javascript
// CirclesInMap.tsx

import { useRef } from "react";
import L, { Circle, CircleOptions } from "leaflet";
import { FeatureGroup, useMap } from "react-leaflet";
import { ShapeFactory, DrawCircle } from "leaflet-draw-manager";

const CirclesInMap = () => {
  const map = useMap();
  const circleGroup = useRef < L.FeatureGroup > null;
  const circleOptions: CircleOptions = { color: "red", radius: 0 };
  const shapeFactory = ShapeFactory.getInstance();
  const drawCircle = (useRef < DrawCircle) | (null > null);
  const latestCircle = (useRef < Circle) | (null > null);

  const handleDrawCircle = () => {
    if (!circleGroup.current) return;
    drawCircle.current = shapeFactory.getCircleInstance(
      map,
      circleGroup.current,
      circleOptions
    );
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
```

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
