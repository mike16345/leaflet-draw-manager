import L, { LatLng } from "leaflet";
import { DrawManagerMode } from "../enums/DrawManagerMode";
import { Shapes } from "../enums/Shapes";
import { LeafletShape } from "../types/LeafletShape";
import { ShapeOptions } from "../types/ShapeOptions";

/**
 * A class for drawing a specific shape on a map.
 *
 * @template T The type of the shape to draw.
 */
class DrawShape<T extends LeafletShape> {
  /**
   * The Leaflet map instance on which shapes will be drawn and edited.
   */
  protected map: L.Map;

  /**
   * The currently selected shape for editing or `null` if no shape is selected.
   */
  protected currentShape: T | null;

  /**
   * An array of Leaflet LatLng objects representing the vertices of the current shape.
   */
  protected latLngs: L.LatLng[];

  /**
   * A Leaflet FeatureGroup to hold and manage the drawn features on the map.
   */
  protected featureGroup: L.FeatureGroup;

  /**
   * An array of Leaflet LatLng objects representing the vertices of the shape before editing started.
   */
  protected preEditLatLngs: L.LatLng[];

  /**
   * The current draw mode of the manager (e.g., 'draw' or 'edit').
   */
  protected drawMode: DrawManagerMode;

  /**
   * The type of shape being drawn or edited (e.g., 'circle', 'polygon', etc.).
   */
  protected shapeType: Shapes | string;

  /**
   * A callback function to handle click events on the map, receiving an array of LatLng objects.
   */
  protected onClickHandler: ((latLngs: L.LatLng[]) => void) | null;

  /**
   * A callback function to handle the completion of drawing or editing, receiving the final shape or `null`.
   */
  protected onFinishHandler: ((shape: T | null) => void) | null;

  /**
   * A callback function to handle the cancellation of shape editing, receiving the current shape or `null`.
   */
  protected onCancelEditHandler: ((shape: T | null) => void) | null;

  /**
   * Creates a new DrawShape instance.
   *
   * @param map The map on which to draw the shape.
   * @param featureGroup The feature group to which the drawn shape will be added.
   */
  constructor(map: L.Map, featureGroup: L.FeatureGroup) {
    this.map = map;
    this.map.doubleClickZoom.disable();
    this.drawMode = DrawManagerMode.START;
    this.latLngs = [];
    this.preEditLatLngs = [];
    this.featureGroup = featureGroup;
    this.featureGroup.addTo(this.map);
    this.currentShape = null;
    this.shapeType = "";
    this.onClickHandler = null;
    this.onFinishHandler = null;
    this.onCancelEditHandler = null;
  }

  /**
   * Stops drawing and calls the appropriate handler.
   */
  stopDrawing() {
    this.drawMode = DrawManagerMode.STOP;
    this.disableDrawEvents();

    if (this.onFinishHandler) {
      this.onFinishHandler(this.currentShape);
    }

    this.currentShape = null;
    this.latLngs = [];
    this.preEditLatLngs = [];
  }

  /**
   * Disables mouse and touch events for drawing.
   */
  disableDrawEvents() {
    this.map.off("mousemove contextmenu click touchstart");
  }

  /**
   * Deletes the current shape from the map and resets the state of the class.
   */
  deleteShape() {
    if (!this.currentShape) return;
    this.featureGroup.removeLayer(this.currentShape);
    this.latLngs = [];
  }

  /**
   * Sets a custom click handler for the shape.
   *
   * @param clickHandler The custom click handler.
   */
  setCustomOnClickHandler(clickHandler: (latLngs: LatLng[]) => void) {
    this.onClickHandler = clickHandler;
  }

  /**
   * Sets a custom finish handler for the shape.
   *
   * @param onFinishHandler The custom finish handler.
   */
  setCustomOnFinishHandler(onFinishHandler: (shape: T | null) => void) {
    this.onFinishHandler = onFinishHandler;
  }

  /**
   * Sets a custom cancel edit handler for the shape.
   *
   * @param onCancelEditHandler The custom cancel edit handler.
   */
  setOnCancelEditHandler(onCancelEditHandler: (shape: T | null) => void) {
    this.onCancelEditHandler = onCancelEditHandler;
  }

  /**
   * Gets the current draw mode.
   *
   * @returns The current draw mode.
   */
  getDrawMode() {
    return this.drawMode;
  }

  /**
   * Gets the current shape.
   * @returns The current shape.
   */
  getCurrentShape() {
    return this.currentShape;
  }

  setShapeOptions(shapeOptions: ShapeOptions) {
    if (!this.currentShape) return;
    this.currentShape.options = shapeOptions;
  }
}

export { DrawShape };
