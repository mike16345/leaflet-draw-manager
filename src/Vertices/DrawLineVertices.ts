import { Shapes } from "../enums/Shapes";
import L, { LatLng, LeafletMouseEvent } from "leaflet";
import { DrawVertices } from "./DrawVertices";

/**
 * A class for drawing line vertices on a map.
 */
class DrawLineVertices extends DrawVertices {
  /**
   * Flag whether to display distance between the line vertices.
   */
  protected displayDistances: boolean;

  /**
   * Creates a new instance of the DrawLineVertices class.
   * @param map The map on which to draw the line vertices.
   * @param shapeType The type of shape to draw (e.g., "polyline", "polygon").
   */
  constructor(map: L.Map, shapeType: Shapes | string = "") {
    super(map, shapeType);
    this.displayDistances = true;
  }

  /**
   * Adds a vertex to the line.
   * @param latLng The location of the vertex.
   * @param index The index of the vertex.
   */
  drawVertex(latLng: LatLng, index: number) {
    const vertexMarker = L.marker(latLng, {
      draggable: true,
      icon: L.divIcon({
        className: "hit-box vertex-marker",
        html: `${index + 1}`,
        iconSize: L.point(24, 24),
      }),
    });

    vertexMarker.on("dragstart", () => {
      this.handleTouchStart();
      this.fireEvent("onDragVertexStart");
    });

    vertexMarker.on("drag", (e: any) => {
      this.latLngs[index] = e.latlng;
      this.fireEvent("onDragVertex", [e, index]);
      this.refreshMidpointMarkers(index);
    });

    vertexMarker.on("dragend", (e: L.LeafletEvent) => {
      this.fireEvent("onDragEndVertex", [this.latLngs]);
      this.handleTouchEnd();
    });

    vertexMarker.addTo(this.vertices);

    return vertexMarker;
  }

  /**
   * Adds all vertices to the line.
   */
  drawVertices() {
    this.latLngs.forEach((latLng, index) => {
      this.drawVertex(latLng, index);
    });
  }

  /**
   * Adds a midpoint vertex to the line.
   * @param currentPosition The location of the current vertex.
   * @param nextPosition The location of the next vertex.
   * @param index The index of the vertex.
   */
  drawMidpointVertex(currentPosition: LatLng, nextPosition: LatLng, index: number) {
    const midpoint = L.latLngBounds(currentPosition, nextPosition).getCenter();
    const midpointLayer = this.midpointVertices.getLayers()[index];

    if (midpointLayer) {
      const currLatLng = (midpointLayer as L.Marker).getLatLng();

      if (currLatLng.equals(midpoint)) return;

      if (this.displayDistances) {
        const distance = currentPosition.distanceTo(nextPosition);
        const tooltipContent = ` ("מ) ${distance.toFixed(2)}`;
        midpointLayer.setTooltipContent(tooltipContent);
      }

      (midpointLayer as L.Marker).setLatLng(midpoint);
      return;
    }

    const midpointMarker = L.marker(midpoint, {
      draggable: true,
      icon: L.divIcon({
        className: "hit-box vertex-marker midpoint-marker",
        iconSize: L.point(20, 20),
      }),
    });

    if (this.displayDistances) {
      const distance = currentPosition.distanceTo(nextPosition);
      const tooltipContent = `("מ) ${distance.toFixed(2)}`;

      midpointMarker
        .bindTooltip(tooltipContent, {
          permanent: true,
          className: `distance-tooltip`,
          direction: "auto",
        })
        .addTo(this.map);
    }

    midpointMarker.on("dragstart", () => {
      this.handleTouchStart();
      this.fireEvent("onDragMidpointVertexStart");
    });

    midpointMarker.on("drag", (e: any) => {
      if (!this.isDragging) {
        this.latLngs.splice(index + 1, 0, e.latlng);
        this.clearVertices();
        this.drawVertices();
      }

      this.fireEvent("onDragMidpointVertex", [e, index, !this.isDragging]);

      this.latLngs[index + 1] = e.latlng;
      const vertexMarker = this.vertices.getLayers()[index + 1];
      if (vertexMarker) {
        (vertexMarker as L.Marker).setLatLng(e.latlng);
      }

      this.drawMidpointVertices();
      this.isDragging = true;
    });

    midpointMarker.on("dragend", (e) => {
      this.isDragging = false;
      this.clearVertices();
      this.drawVertices();
      this.fireEvent("onDragEndMidpointVertex", [this.latLngs]);
      this.handleTouchEnd();
    });
    midpointMarker.addTo(this.midpointVertices);
  }

  /**
   * Gets the surrounding positions of a vertex.
   * @param index The index of the vertex.
   */
  getSurroundingPositions(index: number) {
    const lastIndex = this.latLngs.length - 1;
    var currentPosition;
    var nextPosition;

    if (
      index >= lastIndex &&
      this.shapeType == Shapes.POLYGON &&
      this.latLngs.length >= 3
    ) {
      currentPosition = this.latLngs[0];
      nextPosition = this.latLngs[index];
    } else {
      currentPosition = this.latLngs[index];
      nextPosition = this.latLngs[index + 1];
    }

    return { currentPosition: currentPosition, nextPosition: nextPosition };
  }

  /**
   * Gets a value indicating whether line distances are displayed.
   */
  getDisplayLineDistances() {
    return this.displayDistances;
  }

  /**
   * Draws all midpoint vertices.
   */
  drawMidpointVertices() {
    this.latLngs.forEach((_, index) => {
      const positions = this.getSurroundingPositions(index);

      if (positions.currentPosition && positions.nextPosition) {
        this.drawMidpointVertex(
          positions.currentPosition,
          positions.nextPosition,
          index
        );
      }
    });
  }

  /**
   * Refreshes the midpoint markers for a specific vertex.
   * @param index The index of the vertex.
   */
  refreshMidpointMarkers(index: number) {
    const midpoints = this.midpointVertices.getLayers();
    const lastIndex = this.latLngs.length - 1;

    var midpointOne = midpoints[index];
    var midpointTwo;

    var currentPosition = this.latLngs[index];
    var prevPosition = this.latLngs[index - 1];

    var nextPosition;

    if (index == 0) {
      nextPosition = this.latLngs[index + 1];
      prevPosition = this.latLngs[lastIndex];
      midpointTwo = midpoints[midpoints.length - 1];
    } else if (index == lastIndex) {
      midpointTwo = midpoints[index - 1];
      nextPosition = this.latLngs[0];
    } else {
      midpointTwo = midpoints[index - 1];
      nextPosition = this.latLngs[index + 1];
    }

    if (!currentPosition || !nextPosition) return;

    const midPointOneDistance = currentPosition.distanceTo(nextPosition);
    const midPointTwoDistance = currentPosition.distanceTo(prevPosition);

    const tooltipOneContent = `("מ) ${midPointOneDistance.toFixed(2)}`;
    const tooltipTwoContent = `("מ) ${midPointTwoDistance.toFixed(2)}`;

    const midpointOneLatLng = L.latLngBounds(
      currentPosition,
      nextPosition
    ).getCenter();

    const midpointTwoLatLng = L.latLngBounds(
      currentPosition,
      prevPosition
    ).getCenter();

    if (midpointOne) {
      (midpointOne as L.Marker).setLatLng(midpointOneLatLng);
      midpointOne.setTooltipContent(tooltipOneContent);
    }

    if (midpointTwo) {
      if (index == 0 && this.shapeType !== Shapes.POLYGON) return;

      (midpointTwo as L.Marker).setLatLng(midpointTwoLatLng);
      midpointTwo.setTooltipContent(tooltipTwoContent);
      if (
        index >= lastIndex &&
        this.shapeType == Shapes.POLYGON &&
        this.latLngs.length >= 3
      ) {
        currentPosition = this.latLngs[0];
        nextPosition = this.latLngs[index];
      } else {
        currentPosition = this.latLngs[index];
        nextPosition = this.latLngs[index + 1];
      }
    }
  }

  /**
   * Sets the option to display the distances between the lines.
   * @param display
   */
  displayLineDistances(display: boolean) {
    this.displayDistances = display;
    this.clearMidpointVertices();
    this.drawMidpointVertices();
  }

  /*
   * Clears only the midpoint vertices from the map.
   */
  clearMidpointVertices() {
    this.midpointVertices.clearLayers();
  }

  /*
   * Clears only the regular vertices from the map.
   */
  clearVertices() {
    this.vertices.clearLayers();
  }

  /*
   * Clears both the midpoint and regular vertices from the map.
   */
  clearAllVertices() {
    this.latLngs = [];
    this.clearMidpointVertices();
    this.clearVertices();
  }

  /*
   * Draws a vertex and midpoint vertex based on the new position clicked at.
   */
  handleMapClick(e: LeafletMouseEvent) {
    super.handleMapClick(e);
    this.drawVertex(e.latlng, this.latLngs.length - 1);
    this.drawMidpointVertices();
  }

  /**
   *Deletes the last added vertex and midpoint vertices.
   */
  handleContextClick() {
    super.handleContextClick();

    if (this.shapeType !== Shapes.POLYGON) return;
    const secondMidpoint = this.midpointVertices.getLayers().pop();

    if (secondMidpoint) this.midpointVertices.removeLayer(secondMidpoint);

    if (this.latLngs.length <= 1) return;

    if (this.latLngs.length == 2) {
      const midpointMarker = this.midpointVertices.getLayers()[0];
      if (midpointMarker) return;
    }

    this.drawMidpointVertex(
      this.latLngs[0],
      this.latLngs[this.latLngs.length - 1],
      this.latLngs.length - 1
    );
  }

  initDrawEvents() {
    this.map.on("click", this.handleMapClick.bind(this));
  }
}

export { DrawLineVertices };
