import { DrawShape } from "../DrawShape";
import L, { LeafletMouseEvent, LatLng, PolylineOptions, icon } from "leaflet";
import { DrawManagerMode } from "../../enums/DrawManagerMode";
import { Shapes } from "../../enums/Shapes";
import { IDrawManagerEvents, IDrawShape } from "../../interfaces/IDrawShape";
import { DrawLineVertices } from "../../Vertices/DrawLineVertices";
import { getShapePositions } from "../../utils/shapeUtils";

class DrawLineShape<T extends L.Polygon | L.Polyline>
  extends DrawShape<T>
  implements IDrawShape<T>
{
  protected shapeOptions: L.PolylineOptions;
  protected vertices: DrawLineVertices;
  protected dashedPolyline: {
    element: L.Polyline | null;
    coordinates: LatLng[];
  };

  constructor(
    map: L.Map,
    featureGroup: L.FeatureGroup,
    shapeOptions: L.PolylineOptions,
    type: Shapes.POLYGON | Shapes.POLYLINE
  ) {
    super(map, featureGroup);
    this.shapeOptions = shapeOptions;
    this.shapeType = type;
    this.vertices = new DrawLineVertices(map, type);
    this.vertices.setShapeType = type;
    this.dashedPolyline = {
      element: null,
      coordinates: null,
    };
  }

  startDrawing(drawVertices = true) {
    this.drawMode = DrawManagerMode.DRAW;
    this.initDrawEvents();

    if (drawVertices) {
      this.vertices.initDrawEvents();
      this.setVerticesEvents();
    }

    if (!this.currentShape) {
      this.currentShape = this.drawShape();
    } else {
      this.redrawShape();
    }
    this.fireEvent("onDrawStart");
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

  cancelEdit() {
    this.latLngs = structuredClone(this.preEditLatLngs);
    this.redrawShape();
    this.fireEvent("onCancelEdit", [this.currentShape]);
    this.off("onFinish");
    this.stopDrawing();
  }

  override stopDrawing() {
    if (
      this.drawMode === DrawManagerMode.EDIT &&
      this.currentShape &&
      !this.isCustomDashedArray
    ) {
      this.setShapeOptions({
        ...this.currentShape.options,
        dashArray: undefined,
      });
    }

    super.stopDrawing();
    this.removeDashedPolyline();
    this.vertices.clearAllVertices();
  }

  override deleteShape() {
    super.deleteShape();
    this.redrawShape();
    this.stopDrawing();
  }

  editShape(shape: T) {
    this.drawMode = DrawManagerMode.EDIT;
    this.currentShape = shape;
    this.featureGroup.addLayer(this.currentShape);
    this.latLngs = getShapePositions(shape);
    this.preEditLatLngs = structuredClone(this.latLngs);
    if (shape.options.dashArray) {
      this.isCustomDashedArray = true;
    } else {
      this.setShapeOptions({
        ...this.currentShape.options,
        dashArray: "12,12",
      });
    }

    this.redrawShape();
    this.vertices.clearAllVertices();
    this.vertices.setLatLngs = structuredClone(this.latLngs);
    this.setVerticesEvents();
    this.vertices.drawVertices();
    this.vertices.drawMidpointVertices();
    this.disableDrawEvents();

    this.fireEvent("onEditStart");

    return this.currentShape;
  }

  redrawShape(): T | undefined {
    if (!this.currentShape) return;
    if (!this.featureGroup.hasLayer(this.currentShape)) {
      this.featureGroup.addLayer(this.currentShape);
    }
    if (this.drawMode === DrawManagerMode.EDIT) {
      this.fireEvent("onEdit", [this.latLngs]);
    }
    this.currentShape.setLatLngs(this.latLngs);

    return this.currentShape;
  }

  protected handleDragVertex(e: any, index?: number): void {
    if (index || index == 0) this.latLngs[index] = e.latlng;
    this.redrawShape();
    this.fireEvent("onDragVertex", [this.latLngs]);
  }

  protected handleDragMidpointVertex(e: any, index: number, insert = true): void {
    if (insert) this.latLngs.splice(index + 1, 0, e.latlng);
    else this.latLngs[index + 1] = e.latlng;
    this.redrawShape();
    this.fireEvent("onDragMidpointVertex", [this.latLngs]);
  }

  /**
   * @deprecated Use getShapePositions method instead.
   */
  getShapeLatLngs() {}

  drawShape(): T {
    throw new Error("drawShape method must be implemented in a derived class.");
  }

  setLatLngs(latLngs: LatLng[]): void {
    this.latLngs = latLngs;
    this.vertices.clearAllVertices();
    this.vertices.setLatLngs = structuredClone(latLngs);
    this.vertices.drawVertices();
    this.vertices.drawMidpointVertices();
    this.redrawShape();
  }

  displayLineDistances(display: boolean) {
    this.vertices.displayLineDistances(display);
  }

  getDisplayLineDistances() {
    return this.vertices.getDisplayLineDistances();
  }

  override on(event: keyof IDrawManagerEvents, callback: Function) {
    super.on(event, callback);
    this.vertices.on(event, callback);
  }

  setShapeOptions(options: L.PolylineOptions): void {
    this.currentShape.setStyle(options);
  }

  protected initDrawEvents(): void {
    this.map.on("click", this.handleMapClick.bind(this));
    this.map.on("contextmenu", this.handleContextClick.bind(this));
    if (!this.isTouchDevice)
      this.map.on("mousemove", this.handleMouseMove.bind(this));
  }

  protected handleMapClick(e: LeafletMouseEvent) {
    this.latLngs.push(e.latlng);
    this.redrawShape();

    this.fireEvent("onAddPoint", [this.latLngs]);
  }

  handleContextClick() {
    this.latLngs.pop();
    this.redrawShape();

    if (this.latLngs.length === 0) {
      this.stopDrawing();
    }

    this.vertices.handleContextClick();
    this.fireEvent("onDeletePoint", [this.latLngs]);
  }

  protected handleMouseMove(e) {
    if (this.drawMode !== DrawManagerMode.DRAW) return;
    this.cursorPosition = e.latlng;
    this.drawDashedPolyline();
  }

  protected removeDashedPolyline() {
    if (!this.dashedPolyline.element) return;
    this.featureGroup.removeLayer(this.dashedPolyline.element);
    this.dashedPolyline.element = null;
  }

  protected drawDashedPolyline() {
    if (!this.latLngs.length) return;

    this.removeDashedPolyline();
    this.dashedPolyline.coordinates = [this.latLngs.at(-1), this.cursorPosition];
    this.dashedPolyline.element = L.polyline(this.dashedPolyline.coordinates, {
      ...this.shapeOptions,
      className: "cursor-crosshair",
      weight: 4,
      lineCap: "square", // Optional, just to avoid round borders.
      dashArray: "3, 25",
      dashOffset: "10",
    });
    this.featureGroup.addLayer(this.dashedPolyline.element);
  }

  /**
   * Sets the value of a shape attribute.
   * @param attribute The name of the shape attribute to change.
   * @param value The new value of the shape attribute.
   */
  changeShapeAttribute(attribute: keyof PolylineOptions, value: any) {
    if (!this.currentShape) return;
    this.currentShape.setStyle({
      ...this.currentShape.options,
      [attribute]: value,
    });
  }

  /**
   * Sets the option to display the numbers of the vertices and redraws them.
   * @param display Flag to set display.
   */
  setDisplayVertexNumbers(display: boolean) {
    this.vertices.setDisplayVertexNumbers(display);
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

export { DrawLineShape };
