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
  DrawLineShape,
} from "../";
import { IShapeClassConfig } from "../interfaces/IShapeClassConfig";
import { IDrawManagerEvents } from "../interfaces/IDrawShape";

/**
 * The default configuration for each shape class.
 */
const DEFAULT_CONFIG: IShapeClassConfig = {
  displayLineDistances: false,
  displayVertexNumbers: false,
  isTouchDevice: false,
  isDraggable: true,
  vertexIcon: null,
  midpointIcon: null,
  polygonDragIcon: null,
  events: null,
};

/**
 * Manages the configuration for each shape class.
 */
class ShapeClassConfig {
  /**
   * The configuration for each shape class.
   */
  private classConfig: IShapeClassConfig;

  public constructor(config?: IShapeClassConfig) {
    this.classConfig = config || DEFAULT_CONFIG;
  }

  /**
   * Updates the configuration for a specific shape class.
   * @param config - The new configuration for the shape class.
   * @param shapeClass - The shape class to update.
   */
  setClassConfig(config: IShapeClassConfig, shapeClass?: ShapeClass): void {
    this.classConfig = config;
    if (!shapeClass) return;
    this.updateShapeClassConfig(config, shapeClass);
  }

  /**
   * Updates the configuration for a specific shape class.
   * @param config - The new configuration for the shape class.
   * @param shapeClass - The shape class to update.
   */
  private updateShapeClassConfig(
    config: IShapeClassConfig,
    shapeClass: ShapeClass
  ): void {
    if (!shapeClass) return;
    shapeClass.setIsTouchDevice(config.isTouchDevice);
    shapeClass.setIsDraggable(config.isDraggable);
    shapeClass.setMidpointVertexIcon(config.midpointIcon);
    shapeClass.setVertexIcon(config.vertexIcon);

    if (shapeClass.hasOwnProperty("vertices")) {
      shapeClass.setVertexIcon(config.vertexIcon);
      shapeClass.setMidpointVertexIcon(config.midpointIcon);
    }

    if (shapeClass instanceof DrawLineShape) {
      shapeClass.setDisplayVertexNumbers(config.displayVertexNumbers);
      shapeClass.displayLineDistances(config.displayLineDistances);
    }

    if (shapeClass instanceof DrawPolygon) {
      shapeClass.setDragIcon(config.polygonDragIcon);
    }

    if (config.events) {
      Object.keys(config.events).forEach((key) => {
        if (config.events[key])
          shapeClass.on(key as keyof IDrawManagerEvents, config.events[key]);
      });
    }
  }

  getClassConfig(): IShapeClassConfig {
    return this.classConfig;
  }
}

class ShapeFactory {
  private static instance: ShapeFactory | null = null;
  public static shapeInstance: ShapeClass | null = null;
  public static _calledFromShapeFactory: boolean = false;
  private shapeClassConfig: ShapeClassConfig;

  private constructor(classConfig?: IShapeClassConfig) {
    this.shapeClassConfig = new ShapeClassConfig(classConfig);
  }

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
  static getInstance(classConfig?: IShapeClassConfig): ShapeFactory {
    if (!ShapeFactory.instance) {
      ShapeFactory.instance = new ShapeFactory(classConfig);
    }

    return ShapeFactory.instance;
  }

  /**
   * Sets the class configuration for the shape classes.
   * @param config The class configuration object.
   */
  setShapeConfig(config: IShapeClassConfig): void {
    this.shapeClassConfig.setClassConfig(config, ShapeFactory.shapeInstance);
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
    const classConfig = this.shapeClassConfig.getClassConfig();
    this.setShapeConfig(classConfig);

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
