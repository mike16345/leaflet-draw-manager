import L, { LatLng } from "leaflet";
import { DrawManagerMode } from "../enums/DrawManagerMode";
import { Shapes } from "../enums/Shapes";
import { LeafletShape } from "../types/LeafletShape";
import { ShapeOptions } from "../types/ShapeOptions";
import { ShapeFactory } from "../ShapeFactory/ShapeFactory";
import { IDrawManagerEvents } from "../interfaces/IDrawShape";

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
   * Position of the cursor. Used for drawing dashed polylines.
   */
  protected cursorPosition: LatLng;

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
   * Flag indicating whether it is a touch device or not.
   */
  protected isTouchDevice: boolean;

  /**
   * Mapped events for custom behavior.
   */
  protected events: IDrawManagerEvents;

  /**
   * Creates a new DrawShape instance.
   *
   * @param map The map on which to draw the shape.
   * @param featureGroup The feature group to which the drawn shape will be added.
   */
  protected constructor(map: L.Map, featureGroup: L.FeatureGroup) {
    this.map = map;
    this.map.doubleClickZoom.disable();
    this.drawMode = DrawManagerMode.START;
    this.latLngs = [];
    this.preEditLatLngs = [];
    this.featureGroup = featureGroup;
    this.featureGroup.addTo(this.map);
    this.currentShape = null;
    this.cursorPosition = new LatLng(0.0, 0.0);
    this.shapeType = "";
    this.isTouchDevice = false;
    this.onClickHandler = null;
    this.onFinishHandler = null;
    this.onCancelEditHandler = null;
    this.events = {};
  }

  protected static validateInstanceCall() {
    if (!ShapeFactory._calledFromShapeFactory) {
      throw new Error(
        "You must use the ShapeFactory class to create instances of shapes!"
      );
    }
  }

  /**
   * Sets a custom event handler for the shape.
   *
   * @param event The name of the event to listen for.
   * @param callback The function to call when the event is triggered.
   */
  on(event: keyof IDrawManagerEvents, callback: Function): void {
    this.events[event] = callback;
  }

  /**
   * Removes an event handler from the shape.
   *
   * @param event The name of the event to stop listening for.
   */
  off(event: keyof IDrawManagerEvents): void {
    this.events[event] = null;
  }

  /**
   * Fires an event with the specified arguments.
   *
   * @param event The name of the event to fire.
   * @param args The arguments to pass to the event handler.
   */
  protected fireEvent(event: keyof IDrawManagerEvents, args: any[] = []): void {
    if (this.events[event]) {
      this.events[event](...args);
    }
  }

  /**
   * Stops drawing and calls the appropriate handler.
   */
  stopDrawing() {
    this.drawMode = DrawManagerMode.STOP;
    this.disableDrawEvents();

    this.fireEvent("onFinish", [this.currentShape]);

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
    this.fireEvent("onDeleteShape");
  }

  /**
   * Sets a custom click handler for the shape.
   * @deprecated This method is deprecated and will be removed in the next major version.
   */
  setCustomOnClickHandler(clickHandler: (latLngs: LatLng[]) => void) {
    this.onClickHandler = clickHandler;
  }

  /**
   * Sets a custom finish handler for the shape.
   * @deprecated This method is deprecated and will be removed in the next major version.
   *
   */
  setCustomOnFinishHandler(onFinishHandler: (shape: T | null) => void) {
    this.onFinishHandler = onFinishHandler;
  }

  /**
   * Sets a custom cancel edit handler for the shape.
   *
   * @deprecated This method is deprecated and will be removed in the next major version.
   */
  setOnCancelEditHandler(onCancelEditHandler: (shape: T | null) => void) {
    this.onCancelEditHandler = onCancelEditHandler;
  }

  setIsTouchDevice(isTouchDevice: boolean) {
    this.isTouchDevice = isTouchDevice;
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

  getShapeType() {
    return this.shapeType;
  }

  setShapeOptions(shapeOptions: ShapeOptions) {
    if (!this.currentShape) return;
    this.currentShape.options = shapeOptions;
  }
}

export { DrawShape };
