import { LineString, MultiLineString } from "geojson";
import { Shapes } from "../../enums/Shapes";
import { DrawLineShape } from "./DrawLineShape";
import L, { PathOptions } from "leaflet";
import "leaflet-polylinedecorator";

/**
 * Class for drawing an arrow polyline on the map.
 */
class DrawArrowPolyline extends DrawLineShape<L.Polyline> {
  private static instance: DrawArrowPolyline | null = null;
  private arrowHead: L.PolylineDecorator | null;

  private constructor(
    map: L.Map,
    featureGroup: L.FeatureGroup,
    shapeOptions: L.PolylineOptions
  ) {
    super(map, featureGroup, shapeOptions, Shapes.POLYLINE);
    this.arrowHead = null;
  }

  /**
   * Creates a new instance of DrawPolyline or returns the existing instance if it exists.
   * @param map - The map on which to create the polyline.
   * @param featureGroup - The feature group to add the polyline to.
   * @param shapeOptions - The options for the polyline.
   */
  static getInstance(
    map: L.Map,
    featureGroup: L.FeatureGroup,
    shapeOptions: L.PolylineOptions
  ): DrawArrowPolyline {
    if (!DrawArrowPolyline.instance) {
      DrawArrowPolyline.instance = new DrawArrowPolyline(
        map,
        featureGroup,
        shapeOptions
      );
    }

    return DrawArrowPolyline.instance;
  }

  override startDrawing(): void {
    super.startDrawing(false);
  }

  editShape(shape: L.Polyline<LineString | MultiLineString, any>) {
    super.editShape(shape);
    if (shape.arrowHead) {
      this.map.removeLayer(shape.arrowHead);
    }
    this.drawArrowHeadToPolyline();

    return this.currentShape!;
  }

  /**
   * Resets the instance of DrawPolyline, stopping any drawing and clearing the reference to the instance.
   */
  resetInstance() {
    if (!DrawArrowPolyline.instance) return;
    DrawArrowPolyline.instance = null;
  }

  /**
   * Creates a new polyline on the feature group.
   * @returns The newly created polyline.
   */
  override drawShape(latLngs: L.LatLng[] | null = null) {
    const polyline = L.polyline(latLngs || this.latLngs, this.shapeOptions);
    polyline.addTo(this.featureGroup);
    this.currentShape = polyline;
    this.drawArrowHeadToPolyline();

    return polyline;
  }

  redrawShape() {
    super.redrawShape();

    return this.drawArrowHeadToPolyline();
  }

  deleteShape(): void {
    super.deleteShape();
    this.deleteArrowHead();
  }

  deleteArrowHead() {
    if (this.arrowHead) {
      this.featureGroup.removeLayer(this.arrowHead);
      this.arrowHead = null;
    }
  }

  drawArrowHeadToPolyline() {
    if (!this.currentShape) return;
    this.deleteArrowHead();
    const arrowHead = L.polylineDecorator(this.currentShape, {
      patterns: [
        {
          offset: "100%",
          repeat: 40,
          symbol: L.Symbol.arrowHead({
            pixelSize: 15,
            polygon: false,
            pathOptions: {
              stroke: true,
              color: this.currentShape.options.color,
              strokeWidth: 4,
              fillOpacity: 0.2,
              weight: 8,
            } as PathOptions,
          }),
        },
      ] as L.Pattern[],
    }).addTo(this.featureGroup);

    this.arrowHead = arrowHead;
    this.currentShape.arrowHead = arrowHead;

    return this.currentShape;
  }

  /**
   * Stops the drawing and resets the instance of the class.
   */
  override stopDrawing(): void {
    super.stopDrawing();
    this.resetInstance();
  }
}
export { DrawArrowPolyline };
