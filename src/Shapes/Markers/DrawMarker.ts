import L, { LatLng, LeafletMouseEvent, Marker } from "leaflet";
import { DrawShape } from "../DrawShape";
import { DrawManagerMode } from "../../enums/DrawManagerMode";

class DrawMarker extends DrawShape<L.Marker> {
  private static instance: DrawMarker | null = null;

  /**
   * The options for the icon shape.
   */
  protected shapeOptions: L.MarkerOptions;

  /**
   * Flag indicating whether the marker should be a editable text marker.
   */
  protected isTextMarker: boolean;

  /**
   * Creates a new instance of DrawIcon.
   * @param map The map on which to draw icons.
   * @param featureGroup The feature group to which the drawn icons should be added.
   * @param shapeOptions The options for the icon shape.
   *
   */
  private constructor(
    map: L.Map,
    featureGroup: L.FeatureGroup,
    shapeOptions: L.MarkerOptions
  ) {
    super(map, featureGroup);
    this.shapeOptions = shapeOptions;
    this.isTextMarker = false;
  }

  /**
   * Creates a new instance of DrawMarker or returns the existing instance if it exists.
   * @param map The map on which to draw icons.
   * @param featureGroup The feature group to which the drawn icons should be added.
   * @param shapeOptions The options for the icon shape.
   */
  static getInstance(
    map: L.Map,
    featureGroup: L.FeatureGroup,
    shapeOptions: L.IconOptions
  ): DrawMarker {
    DrawShape.validateInstanceCall();
    if (!DrawMarker.instance) {
      DrawMarker.instance = new DrawMarker(map, featureGroup, shapeOptions);
    }

    return DrawMarker.instance;
  }

  /**
   * Resets the instance of DrawIcon, stopping any drawing and clearing the reference to the instance.
   */
  resetInstance() {
    if (!DrawMarker.instance) return;
    DrawMarker.instance = null;
  }

  startDrawing() {
    this.drawMode = DrawManagerMode.DRAW;
    this.initDrawEvents();
  }

  override stopDrawing(): void {
    if (this.currentShape) {
      this.currentShape.dragging?.disable();
    }
    super.stopDrawing();
    this.resetInstance();
  }

  editShape(marker: L.Marker) {
    this.currentShape = marker;
    this.shapeOptions = marker.options;
    this.isDraggable = true;

    marker.dragging?.enable();
    this.latLngs = [marker.getLatLng()];
    this.preEditLatLngs = [...this.latLngs];
    if (this.isTextMarker) {
      this.currentShape = this.drawTextMarker(this.latLngs);
      this.featureGroup.removeLayer(marker);
    }

    return this.currentShape;
  }

  cancelEdit() {
    if (!this.currentShape) return;
    this.currentShape.setLatLng(this.preEditLatLngs[0]);
    this.fireEvent("onCancelEdit", [this.currentShape]);
    this.stopDrawing();
  }

  override deleteShape(): void {
    super.deleteShape();
    this.stopDrawing();
  }

  /**
   * Creates a new marker on the feature group.
   * @param latLng The latlng to create a new marker on. If not provided it will be created on last clicked location.
   * @returns The marker that was created.
   */
  drawShape(latLngs: L.LatLng[] | null = null) {
    let marker: Marker;
    const latlng = (latLngs && latLngs[0]) || this.latLngs[0];

    if (this.isTextMarker) {
      marker = this.drawTextMarker(latLngs);
    } else {
      marker = L.marker(latlng, {
        ...this.shapeOptions,
        draggable: this.isDraggable,
      });
      marker.addTo(this.featureGroup);
    }

    this.currentShape = marker;

    return marker;
  }

  drawTextMarker(latLng: L.LatLng[] | null = null) {
    const latlng = (latLng && latLng[0]) || this.latLngs[0];
    const randId = Math.floor(Math.random() * 1000 + Math.random());

    const marker = L.marker(latlng, {
      ...this.shapeOptions,
      draggable: this.isDraggable,
      icon: L.divIcon({
        className: "text-marker",
        html: `<input id="text-input-${randId}" dir="rtl" class="text-marker-input" placeholder="הזן טקסט כאן" value="${
          this.shapeOptions.text ? this.shapeOptions.text : ""
        }"/>`,
      }),
    });
    marker.on("drag", (e: any) => this.fireEvent("onEdit", [[e.latlng]]));
    marker.addTo(this.featureGroup);

    (
      document.querySelector(`#text-input-${randId}`) as HTMLInputElement
    ).addEventListener("input", (e) => {
      marker.options.text = (e.target as HTMLInputElement).value;
    });

    return marker;
  }

  initDrawEvents() {
    this.map.on("click", this.handleMapClick.bind(this));
  }

  private handleMapClick(e: LeafletMouseEvent) {
    if (!this.latLngs.length) {
      this.latLngs.push(e.latlng);
      this.currentShape = this.drawShape();
      this.fireEvent("onAddPoint", [this.latLngs]);
    }
  }

  setIsDraggable(isDraggable: boolean) {
    this.isDraggable = isDraggable;
    if (!this.currentShape) return;
    this.currentShape.options.draggable = isDraggable;
  }

  setMarkerIcon(iconOptions: L.IconOptions) {
    if (!this.currentShape) return;
    const icon = L.icon(iconOptions);
    this.currentShape.setIcon(icon);
  }

  /**
   * Sets the options for the marker and redraws the marker with the new options.
   * @param options The options to set.
   */
  setShapeOptions(options: L.MarkerOptions): void {
    if (!this.currentShape) return;
    this.shapeOptions = options;
    this.featureGroup.removeLayer(this.currentShape);
    this.drawShape();
  }

  setLatLng(latLng: LatLng) {
    if (!this.currentShape) return;
    this.latLngs = [latLng];
    this.currentShape.setLatLng(latLng);
  }

  setIsTextMarker(isText: boolean): void {
    this.isTextMarker = isText;
  }
}

export { DrawMarker };
