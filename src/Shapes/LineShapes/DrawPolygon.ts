import { Shapes } from "../../enums/Shapes";
import { DrawLineShape } from "./DrawLineShape";
import L from "leaflet";

/**
 * A class for drawing polygons on a map.
 */
class DrawPolygon extends DrawLineShape<L.Polygon> {
  private static instance: DrawPolygon | null = null;

  /**
   * Creates a new instance of DrawPolygon.
   * @param map The map on which to draw polygons.
   * @param featureGroup The feature group to which the drawn polygons should be added.
   * @param shapeOptions The options for the polygon shape.
   */
  private constructor(
    map: L.Map,
    featureGroup: L.FeatureGroup,
    shapeOptions: L.PolylineOptions
  ) {
    super(map, featureGroup, shapeOptions, Shapes.POLYGON);
  }

  /**
   * Gets the singleton instance of DrawPolygon, creating it if it does not already exist.
   * @param map The map on which to draw polygons.
   * @param featureGroup The feature group to which the drawn polygons should be added.
   * @param shapeOptions The options for the polygon shape.
   */
  static getInstance(
    map: L.Map,
    featureGroup: L.FeatureGroup,
    shapeOptions: L.PolylineOptions
  ): DrawPolygon {
    if (!DrawPolygon.instance) {
      DrawPolygon.instance = new DrawPolygon(map, featureGroup, shapeOptions);
    }

    return DrawPolygon.instance;
  }

  /**
   * Resets the singleton instance of DrawPolygon.
   * Stops drawing the polygon if it is currently drawing.
   */
  resetInstance() {
    if (!DrawPolygon.instance) return;
    DrawPolygon.instance = null;
  }

  /**
   * Stops drawing polygons and resets the singleton instance of DrawPolygon.
   */
  override stopDrawing(): void {
    super.stopDrawing();
    DrawPolygon.instance = null;
  }

  /**
   * Draws a polygon on the map.
   * @param latLngs The coordinates of the polygon's vertices.
   * @returns The polygon that was drawn.
   */
  override drawShape(latLngs: L.LatLng[] | null = null) {
    const polygon = L.polygon(latLngs || this.latLngs, this.shapeOptions);
    this.featureGroup.addLayer(polygon);

    return polygon;
  }
}
export { DrawPolygon };
