import { Shapes } from "../../enums/Shapes";
import { DrawShape } from "../DrawShape";
import { DrawLineShape } from "./DrawLineShape";
import L from "leaflet";

/**
 * Class for drawing polyline on the map.
 */
class DrawPolyline extends DrawLineShape<L.Polyline> {
  private static instance: DrawPolyline | null = null;

  private constructor(
    map: L.Map,
    featureGroup: L.FeatureGroup,
    shapeOptions: L.PolylineOptions
  ) {
    super(map, featureGroup, shapeOptions, Shapes.POLYLINE);
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
  ): DrawPolyline {
    DrawShape.validateInstanceCall();
    if (!DrawPolyline.instance) {
      DrawPolyline.instance = new DrawPolyline(map, featureGroup, shapeOptions);
    }

    return DrawPolyline.instance;
  }

  /**
   * Resets the instance of DrawPolyline, stopping any drawing and clearing the reference to the instance.
   */
  resetInstance() {
    if (!DrawPolyline.instance) return;
    DrawPolyline.instance = null;
  }

  /**
   * Creates a new polyline on the feature group.
   * @returns The newly created polyline.
   */
  override drawShape(latLngs: L.LatLng[] | null = null) {
    const polyline = L.polyline(latLngs || this.latLngs, this.shapeOptions);
    polyline.addTo(this.featureGroup);

    return polyline;
  }
  /**
   * Stops the drawing and resets the instance of the class.
   */
  override stopDrawing(): void {
    super.stopDrawing();
    this.resetInstance();
  }

  /**
   * Creates a transparent polyline based on the current or provided set of LatLng coordinates.
   * @param latLngs - The latLngs to use for the creation of the transparent polyline. If not provided, the current set of LatLng coordinates will be used.
   * @returns The transparent polyline.
   */
  static drawTransparentPolyline(latLngs: L.LatLng[]) {
    const transparentPolyline = L.polyline(latLngs, {
      weight: 40,
      lineCap: "square",
      color: "transparent",
      opacity: 0,
    });

    return transparentPolyline;
  }
}

export { DrawPolyline };
