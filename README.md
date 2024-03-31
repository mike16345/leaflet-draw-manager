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

## Classes

### ShapeFactory

ShapeFactory is in charge of creating class instances for shapes. It takes care of handling class cleanups when creating a new class instance therefore mantaining the Singleton implementation.

All classes can only be instantiated using the ShapeFactory class. The reason for this is to avoid having conflicts with events in other shape classes while drawing or editing.
Any attempt to access an instance of a shape class outside the ShapeFactory class will throw an exception.

| Method                                                                                                                | Description                                                                                                       | Example                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `static getInstance(classConfig?: IShapeClassConfig): ShapeFactory`                                                   | Creates a new instance of the ShapeFactoryClass if it hasn't been created yet, and returns the existing instance. | `const shapeFactory = ShapeFactory.getInstance(classConfig);`                                              |
| `setShapeConfig(config: IShapeClassConfig): void`                                                                     | Sets the class configuration for the shape classes.                                                               | `shapeFactory.setShapeConfig(config);               `                                                      |
| `getClassConfig():IShapeClassConfig`                                                                                  | Returns the current class configuration for the shape classes.                                                    | `shapeFactory.getClassConfig(config)`                                                                      |
| `getPolygonInstance(map: Map, featureGroup: FeatureGroup, polygonOptions: PolylineOptions): DrawPolygon`              | Returns an instance of the DrawPolygon class.                                                                     | `const polygonInstance = shapeFactory.getPolygonInstance(map, featureGroup, polygonOptions);`              |
| `getPolylineInstance(map: Map, featureGroup: FeatureGroup, polylineOptions: PolylineOptions): DrawPolyline`           | Returns an instance of the DrawPolyline class.                                                                    | `const polylineInstance = shapeFactory.getPolylineInstance(map, featureGroup, polylineOptions);`           |
| `getCircleInstance(map: Map, featureGroup: FeatureGroup, circleOptions: CircleOptions): DrawCircle`                   | Returns an instance of the DrawCircle class.                                                                      | `const circleInstance = shapeFactory.getCircleInstance(map, featureGroup, circleOptions);`                 |
| `getMarkerInstance(map: Map, featureGroup: FeatureGroup, markerOptions: L.MarkerOptions): DrawMarker`                 | Returns an instance of the DrawMarker class.                                                                      | `const markerInstance = shapeFactory.getMarkerInstance(map, featureGroup, markerOptions);`                 |
| `getArrowPolylineInstance(map: Map, featureGroup: FeatureGroup, polylineOptions: PolylineOptions): DrawArrowPolyline` | Returns an instance of the DrawArrowPolyline class.                                                               | `const arrowPolylineInstance = shapeFactory.getArrowPolylineInstance(map, featureGroup, polylineOptions);` |

### ShapeClassConfig

ShapeClassConfig is a private class which provides a centralized mechanism to manage and apply configuration settings for various shape classes used in mapping applications. It allows developers to easily update and retrieve configuration settings for individual shape classes, ensuring consistency and flexibility in the application's behavior and appearance.

Any time a class is instantiated the configuration settings will automatically be applied to that class.

Accessed through the ShapeFactory class.

| Property             | Description                                                                        | Default Value |
| -------------------- | ---------------------------------------------------------------------------------- | ------------- |
| displayLineDistances | Flag indicating whether to display the distances between points. (LineShapes only) | false         |
| displayVertexNumbers | Flag indicating whether to display the number on the points. (LineShapes only)     | false         |
| isTouchDevice        | Flag indicating whether the device is touch-sensitive or not.                      | false         |
| isDraggable          | Flag indicating whether the shape should be draggable. (Markers/Polygons)          | false         |
| vertexIcon           | Icon for vertices that are used when drawing/editing shapes.                       | null          |
| midpointIcon         | Icon for midpoint vertices that are used when drawing/editing shapes.              | null          |
| polygonDragIcon      | Icon that is used when dragging a polygon.                                         | null          |
| events               | Custom event handlers.                                                             | null          |

### DrawShape - All classes have access to DrawShape's properties and methods.

| Method                                                                   | Description                                                               | Example                                                        |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `on(event: keyof IDrawManagerEvents, callback: Function)`                | Sets a custom event handler for the shape.                                | `drawShape.on("onEditStart", () => { /* Your code here */ });` |
| `off(event: keyof IDrawManagerEvents)`                                   | Removes an event handler from the shape class.                            | `drawShape.off("onEditStart");`                                |
| `stopDrawing()`                                                          | Stops drawing and resets the state of the class.                          | `drawShape.stopDrawing();`                                     |
| `disableDrawEvents()`                                                    | Disables mouse and touch events for drawing.                              | `drawShape.disableDrawEvents();`                               |
| `deleteShape()`                                                          | Deletes the current shape from the map and resets the state of the class. | `drawShape.deleteShape();`                                     |
| `setIsTouchDevice(isTouchDevice: boolean)`                               | Sets a flag indicating whether it is a touch device or not.               | `drawShape.setIsTouchDevice(true);`                            |
| `getDrawMode()`                                                          | Retrieves the current draw mode of the shape.                             | `const mode = drawShape.getDrawMode();`                        |
| `getCurrentShape()`                                                      | Retrieves the current shape being drawn or edited.                        | `const shape = drawShape.getCurrentShape();`                   |
| `getShapeType()`                                                         | Retrieves the type of shape being drawn or edited.                        | `const type = drawShape.getShapeType();`                       |
| `setIsDraggable(isDraggable: boolean)`                                   | Sets a flag indicating whether the shape should be draggable.             | `drawShape.setIsDraggable(true);`                              |
| `setVertexIcon(vertexIcon: L.DivIcon \| L.Icon \| null)`                 | Sets the icon for the vertices of the shape.                              | `drawShape.setVertexIcon(icon);`                               |
| `setMidpointVertexIcon(midpointVertexIcon: L.DivIcon \| L.Icon \| null)` | Sets the icon for the midpoint vertices of the shape.                     | `drawShape.setMidpointVertexIcon(icon);`                       |

### DrawLineShape - DrawPolygon/DrawPolyline/DrawArrowPolyline

DrawPolygon/DrawPolyline/DrawArrowPolyline all inherit these methods from the DrawLineShape class.

| Method                                                               | Description                                                                              | Example                                                |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `startDrawing(drawVertices?: boolean)`                               | Initiates the drawing of the shape.                                                      | `drawLineShape.startDrawing();`                        |
| `cancelEdit()`                                                       | Cancels the current editing operation and reverts the shape to its state before editing. | `drawLineShape.cancelEdit();`                          |
| `editShape(shape: T)`                                                | Initiates the editing mode for the specified shape.                                      | `drawLineShape.editShape(shape);`                      |
| `redrawShape(): T \| undefined`                                      | Redraws the current shape on the map with updated coordinates.                           | `drawLineShape.redrawShape();`                         |
| `setLatLngs(latLngs: LatLng[])`                                      | Sets the coordinates of the shape and redraws it on the map.                             | `drawLineShape.setLatLngs(latLngs);`                   |
| `displayLineDistances(display: boolean)`                             | Controls the display of line distances for the shape vertices.                           | `drawLineShape.displayLineDistances(true);`            |
| `getDisplayLineDistances()`                                          | Retrieves the current display state of line distances for the shape vertices.            | `drawLineShape.getDisplayLineDistances();`             |
| `setShapeOptions(options: PolylineOptions)`                          | Sets the options for the current shape.                                                  | `drawLineShape.setShapeOptions(options);`              |
| `changeShapeAttribute(attribute: keyof PolylineOptions, value: any)` | Changes the value of a shape attribute.                                                  | `drawLineShape.changeShapeAttribute("color", "blue");` |
| `setDisplayVertexNumbers(display: boolean)`                          | Sets the option to display the numbers of the vertices and redraws them.                 | `drawLineShape.setDisplayVertexNumbers(true);`         |

#### DrawPolygon

| Method                                                                                                       | Description                                                                                | Example                                                                         |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `static getInstance(map: L.Map, featureGroup: L.FeatureGroup, shapeOptions: L.PolylineOptions): DrawPolygon` | Retrieves the singleton instance of DrawPolygon or creates a new one if it does not exist. | `const drawPolygon = DrawPolygon.getInstance(map, featureGroup, shapeOptions);` |
| `resetInstance()`                                                                                            | Stops drawing polygons and resets the singleton instance of DrawPolygon.                   | `drawPolygon.resetInstance();`                                                  |
| `drawShape(latLngs: L.LatLng[] \| null = null): L.Polygon`                                                   | Draws a polygon on the map.                                                                | `const polygon = drawPolygon.drawShape(latLngs);`                               |
| `on(event: keyof IDrawManagerEvents, callback: Function): void`                                              | Sets a custom event handler for the shape.                                                 | `drawPolygon.on("onEditStart", () => { /* Your code here */ });`                |
| `removeDragMarker()`                                                                                         | Removes the drag marker from the map if it exists.                                         | `drawPolygon.removeDragMarker();`                                               |
| `setDragIcon(icon: Icon \| DivIcon): void`                                                                   | Sets the icon for the drag marker.                                                         | `drawPolygon.setDragIcon(icon);`                                                |

#### DrawPolyline

| Method | Description | Example |

| `drawTransparentPolyline(latLngs:LatLng[])` | Creates a transparent polyline based on the provided set of LatLng coordinates. The transparent polyline has a weight of 40. This can be used to help capture clicks on a polyline if given the same coordinates. /| ` DrawPolyline.drawTransparentPolyline(coordinates)`

### DrawCircle

| Method                                           | Description                                                                      | Example                                              |
| ------------------------------------------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `static getRadiusLatLng(circle: Circle): LatLng` | Calculates the coordinates of two points on the circumference of a given circle. | `DrawCircle.getRadiusLatLng(circleCenter, radius); ` |

### DrawMarker

| Method                                                      | Description                                      | Example                                                      |
| ----------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| `drawTextMarker(latLng: L.LatLng[] \| null = null): Marker` | Creates a text marker on the map.                | `drawMarker.drawTextMarker([latLng]);`                       |
| `startDrawing(): void`                                      | Starts drawing the marker on the map.            | `drawMarker.startDrawing();`                                 |
| `stopDrawing(): void`                                       | Stops drawing the marker on the map.             | `drawMarker.stopDrawing();`                                  |
| `resetInstance(): void`                                     | Resets the instance of DrawIcon.                 | `drawMarker.resetInstance();`                                |
| `editShape(marker: L.Marker): L.Marker`                     | Edits an existing marker.                        | `const editedMarker = drawMarker.editShape(existingMarker);` |
| `cancelEdit(): void`                                        | Cancels editing an existing marker.              | `drawMarker.cancelEdit();`                                   |
| `deleteShape(): void`                                       | Deletes the marker shape.                        | `drawMarker.deleteShape();`                                  |
| `drawShape(latLngs: L.LatLng[] \| null = null): Marker`     | Draws a marker on the map.                       | `const marker = drawMarker.drawShape([latLng]);`             |
| `initDrawEvents(): void`                                    | Initializes the events for drawing the marker.   | `drawMarker.initDrawEvents();`                               |
| `setIsDraggable(isDraggable: boolean): void`                | Sets whether the marker should be draggable.     | `drawMarker.setIsDraggable(true);`                           |
| `setMarkerIcon(iconOptions: L.IconOptions): void`           | Sets the icon options for the marker.            | `drawMarker.setMarkerIcon({ iconUrl: 'marker.png' });`       |
| `setShapeOptions(options: L.MarkerOptions): void`           | Sets the options for the marker shape.           | `drawMarker.setShapeOptions({ color: 'red' });`              |
| `setLatLng(latLng: LatLng): void`                           | Sets the latitude and longitude for the marker.  | `drawMarker.setLatLng(new LatLng(40.7128, -74.0060));`       |
| `setIsTextMarker(isText: boolean): void`                    | Sets whether the marker should be a text marker. | `drawMarker.setIsTextMarker(true);`                          |

## Helper utilities

Here are a list of some functions/enums/interfaces that can be helpful while developing.

| Helper Utility           | Description                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| getShapePositions        | A function that retrieves the positions of the vertices of a given shape.                            |
| convertToLatLngInstances | A function that converts an array of latitude and longitude coordinates to `LatLng` instances.       |
| LeafletShape             | A type representing various Leaflet shapes such as Circle, Polygon, Polyline, Marker, and Icon.      |
| ShapeClass               | A union type representing different shape classes used for drawing and editing shapes.               |
| ShapeOptions             | A union type representing options for different shapes such as Polyline, Marker, and Circle.         |
| DrawManagerMode          | An enum representing different modes of the DrawManager: START, DRAW, EDIT, and STOP.                |
| Shapes                   | An enum representing different shape types: POLYGON, POLYLINE, ICON, MARKER, CIRCLE, ARROW_POLYLINE. |
| IShapeClassConfig        | An interface representing the configuration options for shape classes.                               |

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
