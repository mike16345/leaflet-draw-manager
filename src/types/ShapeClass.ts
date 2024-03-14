import { DrawCircle } from "../Shapes/CircularShapes/DrawCircle";
import { DrawPolygon } from "../Shapes/LineShapes/DrawPolygon";
import { DrawPolyline } from "../Shapes/LineShapes/DrawPolyline";
import { DrawMarker } from "../Shapes/Markers/DrawMarker";

export type ShapeClass = DrawPolygon | DrawPolyline | DrawCircle | DrawMarker;
