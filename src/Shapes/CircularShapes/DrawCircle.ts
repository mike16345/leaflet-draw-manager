import { Circle, FeatureGroup, LatLng, LeafletMouseEvent } from "leaflet";
import { DrawShape } from "../DrawShape";
import { IDrawShape } from "../../interfaces/IDrawShape";
import { DrawManagerMode } from "../../enums/DrawManagerMode";
import L from "leaflet";
import { Shapes } from "../../enums/Shapes";
import { DrawCircularVertices } from "../../Vertices/DrawCircularVertices";

/**
 * A class for drawing circles on a map.
 */
class DrawCircle extends DrawShape<L.Circle> implements IDrawShape<L.Circle> {
  private static instance: DrawCircle | null = null;

  /**
   * The options for the circle shape.
   */
  protected shapeOptions: L.CircleOptions;

  /**
   * A flag indicating whether to allow dragging to add additional points.
   */
  protected dragToAddPoint: boolean;

  /**
   * The current mouse cursor position.
   */
  protected cursorPosition: LatLng;

  /**
   * A group of markers used to represent the drawn circle.
   */
  protected markerGroup: FeatureGroup;

  /**
   * A flag indicating whether the device is a touch screen.
   */
  protected isTouchScreen: boolean;

  /**
   * The vertices of the drawn circle.
   */
  protected vertices: DrawCircularVertices;

  /**
   * Creates an instance of DrawCircle.
   * @param map The map on which to draw circles.
   * @param featureGroup The feature group to which the drawn circles should be added.
   * @param shapeOptions The options for the circle shape.
   */
  private constructor(
    map: L.Map,
    featureGroup: L.FeatureGroup,
    shapeOptions: L.CircleOptions
  ) {
    super(map, featureGroup);
    this.dragToAddPoint = false;
    this.shapeOptions = shapeOptions;
    this.shapeType = Shapes.CIRCLE;
    this.markerGroup = L.featureGroup();
    this.markerGroup.addTo(this.map);
    this.cursorPosition = new LatLng(0.0, 0.0);
    this.isTouchScreen = true;
    this.vertices = new DrawCircularVertices(this.map, Shapes.CIRCLE);
  }

  /**
   * Gets the singleton instance of DrawCircle, creating it if it does not already exist.
   * @param map The map on which to draw circles.
   * @param featureGroup The feature group to which the drawn circles should be added.
   * @param shapeOptions The options for the circle shape.
   */
  static getInstance(
    map: L.Map,
    featureGroup: L.FeatureGroup,
    shapeOptions: L.CircleOptions
  ): DrawCircle {
    DrawShape.validateInstanceCall();

    if (!DrawCircle.instance) {
      DrawCircle.instance = new DrawCircle(map, featureGroup, shapeOptions);
    }

    return DrawCircle.instance;
  }

  /**
   * Resets the singleton instance of DrawCircle.
   */
  resetInstance() {
    if (!DrawCircle.instance) return;
    DrawCircle.instance = null;
  }

  /**
   * Initializes the events for drawing the circle
   */
  startDrawing() {
    this.drawMode = DrawManagerMode.DRAW;
    this.initDrawEvents();
    this.vertices.initDrawEvents();
    this.setVerticesEvents();
  }

  /**
   * Stops drawing the circle and disables the events for drawing.
   */
  override stopDrawing() {
    if (this.drawMode === DrawManagerMode.EDIT && this.currentShape) {
      this.currentShape.setStyle({
        ...this.currentShape.options,
        fillOpacity: 0.2,
        dashArray: undefined,
      });
    }
    super.stopDrawing();
    this.vertices.clearAllVertices();
    this.resetInstance();
  }

  override deleteShape(): void {
    super.deleteShape();
    this.stopDrawing();
  }

  /**
   * Edits an existing circle.
   * @param circle The circle to edit.
   */
  editShape(circle: L.Circle) {
    const radiusLatLng = DrawCircle.getRadiusLatLng(circle);
    const centerLatLng = circle.getLatLng();

    this.drawMode = DrawManagerMode.EDIT;
    this.currentShape = circle;
    this.preEditLatLngs = [centerLatLng, radiusLatLng];
    this.latLngs[0] = centerLatLng;
    this.latLngs[1] = radiusLatLng;
    this.vertices.setLatLngs = [...this.latLngs];

    this.setVerticesEvents();
    this.currentShape.setStyle({
      ...this.currentShape.options,
      dashArray: "12,12",
      fillOpacity: 0.3,
    });
    this.vertices.drawCenterVertex(centerLatLng);
    this.vertices.drawOuterVertex(radiusLatLng);
    this.redrawShape();

    return this.currentShape;
  }

  /**
   * Sets the event handlers for the vertices of the drawn circle.
   */
  setVerticesEvents() {
    this.vertices.setHandleDragVertex(this.handleDragVertex.bind(this));
    this.vertices.setHandleDragMidpointVertex(
      this.handleDragMidpointVertex.bind(this)
    );
  }

  /**
   * Handles the dragging of a vertex of the drawn circle.
   * @param e The event containing the dragged vertex.
   */
  handleDragVertex(e: any): void {
    this.latLngs[1] = e.latlng;
    this.redrawShape();
  }

  /**
   * Handles the dragging of the midpoint of a vertex of the drawn circle.
   * @param e The event containing the dragged vertex.
   */
  handleDragMidpointVertex(e: any): void {
    this.latLngs[0] = e.latlng;
    this.currentShape?.setLatLng(e.latlng);
  }

  /**
   * Cancels editing an existing circle.
   */
  cancelEdit(): void {
    if (!this.currentShape) return;
    this.latLngs = [...this.preEditLatLngs];
    this.redrawShape();
    if (this.onCancelEditHandler) {
      this.onCancelEditHandler(this.currentShape);
    }
    this.stopDrawing();
  }

  /**
   * Gets the position of the drawn circle.
   * @returns The position of the drawn circle, consisting of the center and outer points.
   */
  getPosition() {
    if (!this.currentShape) return;
    const circleCenter = this.currentShape.getLatLng(); // Get the center of the circle
    const point2 = DrawCircle.getRadiusLatLng(this.currentShape);

    return [circleCenter, point2];
  }

  /**
   * Draws a circle on the map.
   * @param latLngs The coordinates of the center and outer points of the circle.
   * @returns The drawn circle.
   */
  drawShape(latLngs: L.LatLng[] | null = null) {
    const firstPoint = (latLngs && latLngs[0]) || this.latLngs[0];
    const secondPoint = (latLngs && latLngs[1]) || this.latLngs[1];
    const distance = firstPoint.distanceTo(secondPoint);

    const circle = L.circle(
      (latLngs && latLngs[0]) || this.latLngs[0],
      this.shapeOptions
    );
    circle.setRadius(distance);
    circle.addTo(this.featureGroup);

    return circle;
  }

  /**
   * Redraws the drawn circle on the map.
   */
  redrawShape() {
    if (this.latLngs.length == 2 && !this.currentShape) {
      this.currentShape = this.drawShape();
    }

    if (!this.currentShape) return;
    if (!this.featureGroup.hasLayer(this.currentShape)) {
      this.featureGroup.addLayer(this.currentShape);
    }

    const radius = this.calculateRadius();
    if (radius) this.currentShape.setRadius(radius);

    this.currentShape.setLatLng(this.latLngs[0]);
  }

  /**
   * Calculates the radius of the circle based on the current state of the drawing.
   *
   * @returns The radius of the circle, or undefined if the circle is not being drawn.
   */
  calculateRadius() {
    let radius;
    let positionFrom;

    switch (this.drawMode) {
      case DrawManagerMode.STOP:
        radius = this.latLngs[this.latLngs.length - 1].distanceTo(this.latLngs[0]);
        break;
      case DrawManagerMode.EDIT:
        if (this.latLngs[1]) {
          radius = this.latLngs[1].distanceTo(this.latLngs[0]);
        } else {
          //@ts-ignore
          radius = this.currentShape?._mRadius;
        }
        break;
      default:
        if (!this.isTouchScreen)
          positionFrom = new LatLng(
            this.cursorPosition.lat,
            this.cursorPosition.lng
          );
        else positionFrom = this.latLngs[1];

        radius = positionFrom.distanceTo(this.latLngs[0]);
        break;
    }

    return radius;
  }

  /**
   * Calculates the coordinates of two points on the circumference of a circle given the center point and the radius.
   *
   * @param circleCenter - The center point of the circle.
   * @param radius - The radius of the circle.
   * @returns The coordinates of two points on the circumference of the circle.
   */
  static getRadiusLatLng(circle: Circle) {
    const LATITUDE_FACTOR = 111300;
    const circleCenter = circle.getLatLng();
    const radius = circle.getRadius();

    // Calculate the coordinates of two points on the circumference
    var radiusVertex = new LatLng(
      circleCenter.lat,
      circleCenter.lng +
        radius / (LATITUDE_FACTOR * Math.cos(circleCenter.lat * (Math.PI / 180))) // Longitude calculation
    );

    return radiusVertex;
  }

  /**
   * Initializes the events for drawing the circle
   */
  initDrawEvents(): void {
    this.map.on("click", this.handleMapClick.bind(this));
    if (!this.isTouchScreen)
      this.map.on("mousemove", this.handleMapMouseMove.bind(this));
  }

  /**
   * Handles the mouse move event on the map.
   * @param e The mouse move event.
   */
  handleMapMouseMove(e: LeafletMouseEvent): void {
    this.cursorPosition = e.latlng;
    if (this.latLngs.length == 1) {
      this.redrawShape();
    }
  }

  /**
   * Handles the click event on the map.
   * @param e The click event.
   */
  handleMapClick(e: LeafletMouseEvent): void {
    this.latLngs.push(e.latlng);

    if (this.onClickHandler) {
      this.onClickHandler(this.latLngs);
    }
    this.redrawShape();
  }
}

export { DrawCircle };
