import { Circle, FeatureGroup, LatLng, LeafletMouseEvent } from "leaflet";
import { DrawShape } from "../DrawShape";
import { IDrawManagerEvents, IDrawShape } from "../../interfaces/IDrawShape";
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

  override on(event: keyof IDrawManagerEvents, callback: Function) {
    super.on(event, callback);
    this.vertices.on(event, callback);
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

  protected setVerticesEvents() {
    this.vertices.on("onDragVertexStart", this.events.onDragVertexStart);
    this.vertices.on("onDragVertex", this.handleDragVertex.bind(this));
    this.vertices.on(
      "onDragMidpointVertex",
      this.handleDragMidpointVertex.bind(this)
    );
    this.vertices.on("onDragEndVertex", this.events.onDragEndVertex);
  }

  /**
   * Handles the dragging of a vertex of the drawn circle.
   * @param e The event containing the dragged vertex.
   */
  protected handleDragVertex(e: any): void {
    this.latLngs[1] = e.latlng;
    this.redrawShape();
    this.fireEvent("onDragVertex", [this.latLngs]);
  }

  /**
   * Handles the dragging of the midpoint of a vertex of the drawn circle.
   * @param e The event containing the dragged vertex.
   */
  protected handleDragMidpointVertex(e: any): void {
    this.latLngs[0] = e.latlng;
    this.currentShape?.setLatLng(e.latlng);
    this.fireEvent("onDragMidpointVertex", [this.latLngs]);
  }

  /**
   * Cancels editing an existing circle.
   */
  cancelEdit(): void {
    if (!this.currentShape) return;
    this.latLngs = [...this.preEditLatLngs];
    this.redrawShape();
    this.fireEvent("onCancelEdit", [this.currentShape]);
    this.stopDrawing();
  }

  /**
   * @deprecated Use getShapePositions.
   */
  getPosition() {}

  /**
   * Draws a circle on the map.
   * @param latLngs The coordinates of the center and outer points of the circle.
   * @returns The drawn circle.
   */
  drawShape(latLngs: L.LatLng[] | null = null) {
    var distance = 0;
    const circle = L.circle(
      (latLngs && latLngs[0]) || this.latLngs[0],
      this.shapeOptions
    );
    const firstPoint = (latLngs && latLngs[0]) || this.latLngs[0];
    const secondPoint = (latLngs && latLngs[1]) || this.latLngs[1];
    if (firstPoint && secondPoint) {
      distance = firstPoint.distanceTo(secondPoint);
    }

    circle.setRadius(distance);
    circle.addTo(this.featureGroup);

    return circle;
  }

  private canDraw() {
    return (
      !this.currentShape &&
      ((this.latLngs.length == 1 && !this.isTouchDevice) ||
        (this.latLngs.length == 2 && this.isTouchDevice))
    );
  }

  /**
   * Redraws the drawn circle on the map.
   */
  redrawShape() {
    if (this.canDraw()) {
      this.currentShape = this.drawShape();
    }

    if (!this.currentShape && this.isTouchDevice) return;
    if (!this.featureGroup.hasLayer(this.currentShape)) {
      this.featureGroup.addLayer(this.currentShape);
    }
    const radius = this.calculateRadius();
    if (radius) this.currentShape.setRadius(radius);

    this.currentShape.setLatLng(this.latLngs[0]);
    if (this.drawMode === DrawManagerMode.EDIT) {
      this.fireEvent("onEdit", [this.latLngs]);
    }
  }

  /**
   * Calculates the radius of the circle based on the current state of the drawing.
   *
   * @returns The radius of the circle, or undefined if the circle is not being drawn.
   */
  protected calculateRadius() {
    let radius;
    let positionFrom;

    switch (this.drawMode) {
      case DrawManagerMode.STOP:
        radius = this.latLngs[this.latLngs.length - 1].distanceTo(
          this.latLngs[0]
        );
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
        if (!this.isTouchDevice) {
          positionFrom = new LatLng(
            this.cursorPosition.lat,
            this.cursorPosition.lng
          );
        } else {
          positionFrom = this.latLngs[1];
        }

        radius = positionFrom.distanceTo(this.latLngs[0]);
        break;
    }

    return radius;
  }

  /**
   * Calculates the coordinates of two points on the circumference of a given circle.
   *
   * @param circle - The circle to get radius point.
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
        radius /
          (LATITUDE_FACTOR * Math.cos(circleCenter.lat * (Math.PI / 180))) // Longitude calculation
    );

    return radiusVertex;
  }

  /**
   * Initializes the events for drawing the circle
   */
  initDrawEvents(): void {
    this.map.on("click", this.handleMapClick.bind(this));
    if (!this.isTouchDevice)
      this.map.on("mousemove", this.handleMapMouseMove.bind(this));
  }

  /**
   * Handles the mouse move event on the map.
   * @param e The mouse move event.
   */
  protected handleMapMouseMove(e: LeafletMouseEvent): void {
    this.cursorPosition = e.latlng;

    if (this.latLngs.length == 1) {
      this.redrawShape();
    }
  }

  /**
   * Handles the click event on the map.
   * @param e The click event.
   */
  protected handleMapClick(e: LeafletMouseEvent): void {
    this.latLngs.push(e.latlng);
    this.fireEvent("onAddPoint", [this.latLngs]);
    if (this.latLngs.length <= 2) this.redrawShape();

    if (this.latLngs.length == 2) {
      this.map.off("click", this.handleMapClick.bind(this));
      this.map.off("mousemove", this.handleMapMouseMove.bind(this));
    }
  }

  override setVertexIcon(vertexIcon: L.Icon<L.IconOptions> | L.DivIcon): void {
    super.setVertexIcon(vertexIcon);
    this.vertices.setVertexIcon(vertexIcon);
  }

  override setMidpointVertexIcon(
    midpointIcon: L.Icon<L.IconOptions> | L.DivIcon
  ): void {
    super.setMidpointVertexIcon(midpointIcon);
    this.vertices.setMidpointVertexIcon(midpointIcon);
  }
}

export { DrawCircle };
