import L, { LatLng, LeafletMouseEvent } from "leaflet";
import { Shapes } from "../enums/Shapes";
import { DrawVertices } from "./DrawVertices";

/**
 * A class for drawing circular vertices on a map.
 */
class DrawCircularVertices extends DrawVertices {
  /**
   * The outer marker of the circular shape.
   */
  protected outerMarker: L.Marker | null;

  /**
   * The center marker of the circular shape.
   */
  protected centerMarker: L.Marker | null;

  /**
   * The original distance between the center and outer markers.
   */
  protected originalDistance: { x: number; y: number };

  /**
   * A flag indicating whether to display the radius of the circular shape.
   */
  protected displayRadius: boolean;

  /**
   * Creates a new instance of DrawCircularVertices.
   * @param map The Leaflet map to draw on.
   * @param shapeType The type of shape to draw (e.g., "circle").
   */
  constructor(map: L.Map, shapeType: Shapes | string = "") {
    super(map, shapeType);
    this.centerMarker = null;
    this.outerMarker = null;
    this.originalDistance = { x: 0.0, y: 0.0 };
    this.displayRadius = false;
  }

  /**
   * Draws the center vertex of the circular shape.
   * @param latLng The LatLng coordinates of the center vertex.
   */
  drawCenterVertex(latLng: LatLng) {
    const marker = L.marker(latLng, {
      draggable: true,
      icon: L.divIcon({
        className: "hit-box vertex-marker ",
        iconSize: L.point(24, 24),
      }),
    });

    marker.on("drag", (e: any) => {
      const targetLatLng = e.latlng;
      const newLat = targetLatLng.lat - this.originalDistance.x;
      const newLng = targetLatLng.lng - this.originalDistance.y;
      const newLatLng = new LatLng(newLat, newLng);

      this.latLngs[0] = targetLatLng;
      this.drawOuterVertex(newLatLng);

      if (this.handleDragMidpoint) {
        this.handleDragMidpoint(e);
      }
    });

    marker.addTo(this.midpointVertices);
    this.centerMarker = marker;
  }

  /**
   * Adds a tooltip to the center marker that displays the radius of the circular shape.
   */
  addRadiusTooltip() {
    if (!this.centerMarker || !this.outerMarker) return;
    const radius = `('ר)${this.centerMarker
      .getLatLng()
      .distanceTo(this.outerMarker.getLatLng())}`;

    this.centerMarker.bindTooltip(radius);
  }

  /**
   * Draws the outer vertex of the circular shape.
   * @param latLng The LatLng coordinates of the outer vertex.
   */
  drawOuterVertex(latLng: LatLng) {
    if (this.outerMarker) {
      this.outerMarker.setLatLng(latLng);
      return;
    }

    const marker = L.marker(latLng, {
      draggable: true,
      icon: L.divIcon({
        className: "hit-box vertex-marker ",
        iconSize: L.point(24, 24),
      }),
    });

    marker.on("drag", (e: any) => {
      this.latLngs[1] = e.latlng;
      if (this.handleDragVertex) {
        this.handleDragVertex(e);
      }
      this.originalDistance = {
        x: this.latLngs[0].lat - this.latLngs[1].lat,
        y: this.latLngs[0].lng - this.latLngs[1].lng,
      };
    });

    marker.addTo(this.vertices);
    this.outerMarker = marker;
    if (this.latLngs.length == 2)
      this.originalDistance = {
        x: this.latLngs[0].lat - this.latLngs[1].lat,
        y: this.latLngs[0].lng - this.latLngs[1].lng,
      };
  }

  /**
   * Handles a click event on the map.
   * @param e The Leaflet mouse event.
   */
  handleMapClick(e: LeafletMouseEvent) {
    super.handleMapClick(e);
    if (this.latLngs.length == 1) {
      this.drawCenterVertex(this.latLngs[0]);
    } else if (this.latLngs.length == 2) {
      this.drawOuterVertex(this.latLngs[1]);
    }
  }

  /**
   * Initializes the draw events for the map.
   */
  initDrawEvents() {
    this.map.on("click", this.handleMapClick.bind(this));
  }
}

export { DrawCircularVertices };
