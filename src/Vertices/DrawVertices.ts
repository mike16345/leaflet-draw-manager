import { Shapes } from "../enums/Shapes";
import { IDrawVertices } from "../interfaces/IDrawShape";
import L, { LatLng, LeafletEvent, LeafletMouseEvent } from "leaflet";
import "../css/DrawManager.css";

/**
 * A class for drawing vertices on a map.
 */
class DrawVertices implements IDrawVertices {
  /**
   * The Leaflet map on which the vertices are drawn.
   */
  protected map: L.Map;

  /**
   * The Leaflet feature group containing the vertices.
   */
  protected vertices: L.FeatureGroup;

  /**
   * The Leaflet feature group containing the midpoint vertices.
   */
  protected midpointVertices: L.FeatureGroup;

  /**
   * A boolean indicating whether the user is currently dragging the vertices.
   */
  protected isDragging: boolean;

  /**
   * An array of LatLng objects representing the vertices of the shape.
   */
  protected latLngs: LatLng[];

  /**
   * The type of shape being drawn (e.g., "circle", "rectangle", etc.).
   */
  protected shapeType: Shapes | string;

  /**
   * A function that is called when the user starts dragging the vertices.
   */
  handleOnDragStart: (() => void) | null;

  /**
   * A function that is called when the user stops dragging the vertices.
   */
  handleOnDragEnd: (() => void) | null;

  /**
   * A function that is called when the user drags a vertex.
   */
  handleDragVertex: ((e: LeafletEvent, index?: number) => void) | null;

  /**
   * A function that is called when the user drags a midpoint vertex.
   */
  handleDragMidpoint:
    | ((e: LeafletEvent, index?: number, insert?: boolean) => void)
    | null;

  /**
   * Creates a new DrawVertices instance.
   * @param map The Leaflet map on which the vertices are drawn.
   * @param shapeType The type of shape being drawn (e.g., "circle", "rectangle", etc.).
   */
  constructor(map: L.Map, shapeType: Shapes | string = "") {
    this.map = map;
    this.vertices = L.featureGroup();
    this.vertices.addTo(this.map);
    this.midpointVertices = L.featureGroup();
    this.midpointVertices.addTo(this.map);
    this.handleOnDragStart = null;
    this.handleDragVertex = null;
    this.handleOnDragEnd = null;
    this.handleDragMidpoint = null;
    this.isDragging = false;
    this.latLngs = [];
    this.shapeType = shapeType;
  }

  /**
   * Disables map dragging when the user starts touching the screen.
   */
  handleTouchStart() {
    this.map.dragging.disable();
  }

  /**
   * Enables map dragging when the user stops touching the screen.
   */
  handleTouchEnd() {
    this.map.dragging.enable();
  }

  /**
   * Sets the function that is called when the user drags a vertex.
   * @param dragHandler The function that is called when the user drags a vertex.
   */
  setHandleDragVertex(dragHandler: (e: L.LeafletEvent, index?: number) => void) {
    this.handleDragVertex = dragHandler;
  }

  /**
   * Sets the function that is called when the user drags a midpoint vertex.
   * @param handler The function that is called when the user drags a midpoint vertex.
   */
  setHandleDragMidpointVertex(handler: any) {
    this.handleDragMidpoint = handler;
  }

  /**
   * Clears the midpoint vertices.
   */
  clearMidpointVertices() {
    this.midpointVertices.clearLayers();
  }

  /**
   * Clears the vertices.
   */
  clearVertices() {
    this.vertices.clearLayers();
  }

  /**
   * Clears both the midpoint vertices and the vertices.
   */
  clearAllVertices() {
    this.latLngs = [];
    this.clearMidpointVertices();
    this.clearVertices();
  }

  /**
   * Adds a new vertex to the shape when the user clicks the map.
   * @param e The Leaflet mouse event.
   */
  handleMapClick(e: LeafletMouseEvent) {
    const newLatLng = e.latlng;
    this.latLngs.push(newLatLng);
  }

  /**
   * Removes the last vertex and midpoint vertex from the shape when the user right-clicks the map.
   */
  handleContextClick() {
    const lastMidpoint = this.midpointVertices.getLayers().pop();
    const lastVertex = this.vertices.getLayers().pop();
    this.latLngs.pop();

    if (lastMidpoint) this.midpointVertices.removeLayer(lastMidpoint);
    if (lastVertex) this.vertices.removeLayer(lastVertex);
  }

  /**
   * Sets the type of shape being drawn.
   * @param shapeType The type of shape being drawn.
   */
  set setShapeType(shapeType: Shapes) {
    this.shapeType = shapeType;
  }

  /**
   * Sets the vertices of the shape.
   * @param latLngs The vertices of the shape.
   */
  set setLatLngs(latLngs: LatLng[]) {
    this.latLngs = latLngs;
  }
}

export { DrawVertices };
