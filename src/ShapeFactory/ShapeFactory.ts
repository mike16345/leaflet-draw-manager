import L, { CircleOptions, FeatureGroup, Map, PolylineOptions } from "leaflet";
import { Shapes } from "../enums/Shapes";
import { DrawPolygon } from "../Shapes/LineShapes/DrawPolygon";
import { DrawPolyline } from "../Shapes/LineShapes/DrawPolyline";
import { DrawManagerMode } from "../enums/DrawManagerMode";
import { DrawCircle } from "../Shapes/CircularShapes/DrawCircle";
import { DrawMarker } from "../Shapes/Markers/DrawMarker";
import { ShapeClass } from "../types/ShapeClass";
import { ShapeOptions } from "../types/ShapeOptions";
import { DrawArrowPolyline } from "../Shapes/LineShapes/DrawArrowPolyline";

class ShapeFactory {
  private static instance: ShapeFactory | null = null;
  public static shapeInstance: ShapeClass | null = null;

  private constructor() {}

  private shapeInstances = {
    [Shapes.POLYGON]: DrawPolygon.getInstance,
    [Shapes.POLYLINE]: DrawPolyline.getInstance,
    [Shapes.CIRCLE]: DrawCircle.getInstance,
    [Shapes.MARKER]: DrawMarker.getInstance,
    [Shapes.ARROW_POLYLINE]: DrawArrowPolyline.getInstance,
    [Shapes.ICON]: null,
  };

  /**
   * Creates a new instance of the ShapeFactoryClass if it hasn't been created yet,
   * and returns the existing instance.
   */
  static getInstance(): ShapeFactory {
    if (!ShapeFactory.instance) {
      ShapeFactory.instance = new ShapeFactory();
    }
    return ShapeFactory.instance;
  }

  /**
   * Returns the instance of the currently active shape, or null if no shape is active.
   */
  static getShapeInstance() {
    return ShapeFactory.shapeInstance;
  }

  /**
   * Returns an instance of the shape based on the given type.
   * @param type The type of shape to create.
   * @param map The map on which to create the shape.
   * @param featureGroup The feature group to add the shape to.
   * @param shapeOptions The options for the shape.
   * @returns An instance of the requested shape.
   */
  private getShapeInstance<T extends ShapeClass>(
    type: Shapes,
    map: L.Map,
    featureGroup: L.FeatureGroup,
    shapeOptions: ShapeOptions
  ): T {
    const getShapeInstanceFunc = this.shapeInstances[type];

    if (!getShapeInstanceFunc)
      throw new Error(`No shape instance exists for type ${type}`);

    //@ts-ignore
    const newShapeInstance = getShapeInstanceFunc(map, featureGroup, shapeOptions);

    if (!ShapeFactory.shapeInstance) {
      ShapeFactory.shapeInstance = newShapeInstance;
    }

    if (ShapeFactory.shapeInstance.getDrawMode() === DrawManagerMode.EDIT) {
      ShapeFactory.shapeInstance.cancelEdit();
    } else if (ShapeFactory.shapeInstance.getDrawMode() === DrawManagerMode.DRAW) {
      ShapeFactory.shapeInstance.stopDrawing();
    }

    if (newShapeInstance !== ShapeFactory.shapeInstance) {
      ShapeFactory.shapeInstance.resetInstance();
      ShapeFactory.shapeInstance = newShapeInstance;
    }

    return ShapeFactory.shapeInstance as T;
  }

  /**
   * Returns an instance of the Polygon shape.
   * @param map The map on which to create the shape.
   * @param featureGroup The feature group to add the shape to.
   * @param polygonOptions The options for the polygon.
   * @returns An instance of the Polygon shape.
   */
  getPolygonInstance(
    map: Map,
    featureGroup: FeatureGroup,
    polygonOptions: PolylineOptions
  ) {
    return this.getShapeInstance<DrawPolygon>(
      Shapes.POLYGON,
      map,
      featureGroup,
      polygonOptions
    );
  }

  /**
   * Returns an instance of the Polygon shape.
   * @param map The map on which to create the shape.
   * @param featureGroup The feature group to add the shape to.
   * @param polylineOptions The options for the polygon.
   * @returns An instance of the Polygon shape.
   */
  getPolylineInstance(
    map: Map,
    featureGroup: FeatureGroup,
    polylineOptions: PolylineOptions
  ) {
    return this.getShapeInstance<DrawPolyline>(
      Shapes.POLYLINE,
      map,
      featureGroup,
      polylineOptions
    );
  }

  /**
   * Returns an instance of the Circle shape.
   * @param map The map on which to create the shape.
   * @param featureGroup The feature group to add the shape to.
   * @param polylineOptions The options for the circle.
   * @returns An instance of the Circle shape.
   */
  getCircleInstance(
    map: Map,
    featureGroup: FeatureGroup,
    circleOptions: CircleOptions
  ) {
    return this.getShapeInstance<DrawCircle>(
      Shapes.CIRCLE,
      map,
      featureGroup,
      circleOptions
    );
  }

  getMarkerInstance(
    map: Map,
    featureGroup: FeatureGroup,
    markerOptions: L.MarkerOptions
  ) {
    return this.getShapeInstance<DrawMarker>(
      Shapes.MARKER,
      map,
      featureGroup,
      markerOptions
    );
  }

  getArrowPolylineInstance(
    map: Map,
    featureGroup: FeatureGroup,
    polylineOptions: PolylineOptions
  ) {
    return this.getShapeInstance<DrawArrowPolyline>(
      Shapes.ARROW_POLYLINE,
      map,
      featureGroup,
      polylineOptions
    );
  }

  // TODO: Implement other shapes.
}
export { ShapeFactory };
