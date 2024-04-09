import { Polygon, LatLng, Polyline, Marker, Circle } from "leaflet";
import { LeafletShape } from "../types/LeafletShape";
import { DrawCircle } from "../Shapes/CircularShapes/DrawCircle";

const getShapePositions = (shape: LeafletShape) => {
  if (shape instanceof Polygon) {
    return shape.getLatLngs()[0] as LatLng[];
  } else if (shape instanceof Polyline) {
    return shape.getLatLngs() as LatLng[];
  } else if (shape instanceof Marker) {
    return [shape.getLatLng()] as LatLng[];
  } else if (shape instanceof Circle) {
    return [shape.getLatLng(), DrawCircle.getRadiusLatLng(shape)] as LatLng[];
  } else {
    throw new Error("Invalid shape");
  }
};

const convertToLatLngInstances = (
  latlngs: { lat: number; lng: number; alt?: number }[]
) => {
  return latlngs.map((latlng) => new LatLng(latlng.lat, latlng.lng, latlng?.alt));
};

export { convertToLatLngInstances, getShapePositions };
