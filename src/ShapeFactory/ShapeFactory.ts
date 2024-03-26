import L, { CircleOptions, FeatureGroup, Map, PolylineOptions } from "leaflet";
import {
  ShapeClass,
  ShapeOptions,
  DrawManagerMode,
  Shapes,
  DrawArrowPolyline,
  DrawMarker,
  DrawCircle,
  DrawPolygon,
  DrawPolyline,
} from "../";

class ShapeFactory {
  private static instance: ShapeFactory | null = null;
  public static shapeInstance: ShapeClass | null = null;
  public static _calledFromShapeFactory: boolean = false;

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

    ShapeFactory._calledFromShapeFactory = true;
    //@ts-ignore
    const newShapeInstance = getShapeInstanceFunc(map, featureGroup, shapeOptions);

    ShapeFactory._calledFromShapeFactory = false; // Reset afterwards

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
   * @param map The map on which to create the shape.
   * @param featureGroup The feature group to add the shape to.
   * @param polygonOptions The options for the polygon.
   * @returns An instance of the DrawPolygon class.
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
   * @param map The map on which to create the shape.
   * @param featureGroup The feature group to add the shape to.
   * @param polylineOptions The options for the polygon.
   * @returns An instance of the DrawPolyline class.
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
   * @param map The map on which to create the shape.
   * @param featureGroup The feature group to add the shape to.
   * @param polylineOptions The options for the circle.
   * @returns An instance of the DrawCircle class.
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

  /**
   * @param map The map on which to create the shape.
   * @param featureGroup The feature group to add the shape to.
   * @param polylineOptions The options for the circle.
   * @returns An instance of the DrawMarker class.
   */
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

  /**
   * @param map The map on which to create the shape.
   * @param featureGroup The feature group to add the shape to.
   * @param polylineOptions The options for the circle.
   * @returns An instance of the DrawArrowPolyline class.
   */

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
}
export { ShapeFactory };
