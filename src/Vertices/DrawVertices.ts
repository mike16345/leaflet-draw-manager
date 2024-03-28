import { Shapes } from "../enums/Shapes";
import { IDrawManagerEvents, IDrawVertices } from "../interfaces/IDrawShape";
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
   * Events for dragging vertices.
   */
  protected events: IDrawManagerEvents;

  /**
   * Icon for midpoint vertices.
   */
  protected midpointVertexIcon: L.Icon | L.DivIcon | null;

  /**
   * Icon for vertices.
   */
  protected vertexIcon: L.Icon | L.DivIcon | null;

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
    this.isDragging = false;
    this.latLngs = [];
    this.shapeType = shapeType;
    this.vertexIcon = null;
    this.midpointVertexIcon = null;
    this.events = {};
  }

  on(event: keyof IDrawManagerEvents, callback: Function) {
    this.events[event] = callback;
  }

  off(event: keyof IDrawManagerEvents) {
    this.events[event] = null;
  }

  fireEvent(event: keyof IDrawManagerEvents, args = []) {
    if (this.events[event]) {
      this.events[event](...args);
    }
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

  setVertexIcon(icon: L.Icon | L.DivIcon | null) {
    this.vertexIcon = icon;
  }

  setMidpointVertexIcon(icon: L.Icon | L.DivIcon | null) {
    this.midpointVertexIcon = icon;
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
