import { IDrawManagerEvents } from "./IDrawShape";

interface IShapeClassConfig {
  /**
   * Flag indicating whether to display the distances between points. (LineShapes only)
   */
  displayLineDistances: boolean;

  /**
   * Flag indicating whether to display the number on the points. (LineShapes only)
   */
  displayVertexNumbers: boolean;

  /**
   * Flag indicating whether the device is touch or not.
   */

  isTouchDevice: boolean;

  /**
   * Flag indicating whether the shape should be draggable. (Markers/Polygons)
   */
  isDraggable: boolean;

  /**
   * Icon for vertices that are used when drawing/editing shapes.
   */
  vertexIcon: L.Icon | L.DivIcon | null;

  /**
   * Icon for midpoint vertices that are used when drawing/editing shapes.
   */
  midpointIcon: L.Icon | L.DivIcon | null;

  /**
   * Icon that is used when dragging a polygon.
   */
  polygonDragIcon: L.Icon | L.DivIcon | null;

  /**
   * Custom Event handlers.
   */
  events: IDrawManagerEvents | null;
}

export { IShapeClassConfig };
