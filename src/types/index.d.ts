export interface CustomShapeOptions {
  type?: Shapes;
  text?: string;
  color?: string;
}

interface CustomShape {
  transparentPolyline?: L.Polyline;
  numberedMarkers?: Marker[];
  attachedPolyline?: L.Polyline;
  arrowHead: L.PolylineDecorator;
}

declare module "leaflet" {
  interface Polygon extends CustomShape {}
  interface Marker extends CustomShape {}
  interface Circle extends CustomShape {}
  interface Polyline extends CustomShape {}
  interface Icon extends CustomShape {}
  interface PolylineOptions extends CustomShapeOptions {}
  interface IconOptions extends CustomShapeOptions {}
  interface CircleOptions extends CustomShapeOptions {}
  interface CircleMarkerOptions extends CustomShapeOptions {}
  interface MarkerOptions extends CustomShapeOptions {}
}
